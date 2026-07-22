import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKnowledgeListQuery } from '../../hooks/queries/useKnowledgeQuery';
import '../Petition/Petition_list.css';
import useAuthStore from '../../store/useAuthStore';
import { useDepartmentsQuery } from '../../hooks/queries/useDeptQuery';
import './knowl.css';
import Pagination from '../../components/Pagination/Pagination';

const CATEGORY_OPTIONS = [
    { key: 'all', label: '전체 카테고리' },
    { key: '01', label: '민원처리' },
    { key: '02', label: '사업추진' },
    { key: '03', label: '예산' },
    { key: '04', label: '인허가' },
    { key: '05', label: '실패사례' },
    { key: '99', label: '기타' },
];

const CATEGORY_CLASS_MAP = {
    '민원처리': 'badge-new',
    '사업추진': 'badge-warn',
    '예산': 'badge-done',
    '인허가': 'badge-done',
    '실패사례': 'badge-danger',
    '기타': 'badge-soft',
};

const ITEMS_PER_PAGE = 10;

function Knowl() {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const isAdmin = useMemo(() => user?.system_role_code === '02', [user]);
    const { data: departmentsData } = useDepartmentsQuery();
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [sortFilter, setSortFilter] = useState('all_depts');
    const [searchTerm, setSearchTerm] = useState('');
    const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const categoryRef = useRef(null);
    const sortRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (categoryRef.current && !categoryRef.current.contains(e.target)) {
                setIsCategoryOpen(false);
            }
            if (sortRef.current && !sortRef.current.contains(e.target)) {
                setIsSortOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // 필터 변경 시 1페이지로 리셋
    useEffect(() => {
        setCurrentPage(1);
    }, [categoryFilter, sortFilter, appliedSearchTerm]);
    
    const deptSortOptions = useMemo(() => {
        if (isAdmin) {
            const deptOptions = (departmentsData || []).map(d => ({ key: d.code, label: d.name }));
            return [{ key: 'all_depts', label: '전체 부서' }, ...deptOptions];
        }
        return [
            { key: 'all_depts', label: '전체 부서' },
            { key: 'my_dept', label: '내 부서' },
        ];
    }, [isAdmin, departmentsData]);

    const queryParams = useMemo(() => {
        const params = {
            category_code: categoryFilter === 'all' ? null : categoryFilter,
            keyword: appliedSearchTerm,
            page: currentPage - 1,
            size: ITEMS_PER_PAGE,
        };

        if (isAdmin) {
            // 관리자가 '전체 부서'를 선택하면, scope와 department 필터 없이 모든 것을 조회합니다.
            if (sortFilter === 'all_depts') {
                // 아무 파라미터도 추가하지 않습니다.
            } else {
                // 특정 부서를 선택하면 해당 부서 코드로 필터링합니다.
                params.department_code = sortFilter;
            }
        } else {
            // 일반 사용자는 scope_code로 필터링
            if (sortFilter === 'my_dept') {
                params.scope_code = '01';
            }
        }
        return params;
    }, [categoryFilter, sortFilter, appliedSearchTerm, currentPage, isAdmin]);

    const { data: knowledgeData, isLoading, isError } = useKnowledgeListQuery(queryParams);

    const items = knowledgeData?.items || [];
    const totalItems = knowledgeData?.total || 0;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    const handlePageChange = useCallback((pageNumber) => {
        setCurrentPage(pageNumber);
    }, []);

    const handleSearch = useCallback(() => {
        setAppliedSearchTerm(searchTerm);
    }, [searchTerm]);

    const handleReset = () => {
        setCategoryFilter('all');
        setSortFilter('all_depts');
        setSearchTerm('');
        setAppliedSearchTerm('');
        setCurrentPage(1);
    };

    return(
        
        <div className="view active">
            <div className="petition-content">
                <div className="pagehead">
                    <div>
                        <h2>지식베이스 목록</h2>
                        <div className="sub">업무 노하우와 처리 사례를 검색하고 학습합니다.</div>
                    </div>
                </div>

                {!isAdmin && (
                    <div className="project-toolbar-top" style={{marginBottom: '10px'}}>
                        <div className="project-newbtn" onClick={() => navigate("/knowledge/new")}
                            >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                            <path d="M12 5v14M5 12h14" />
                            </svg>
                            새 항목 생성
                        </div>
                        </div>
                )}

                <div className="toolbar">
                    <div className={`dropdown-wrap ${isCategoryOpen ? "open" : ""}`} ref={categoryRef}>
                        <div className="dropdown" onClick={() => {setIsCategoryOpen(p => !p); setIsSortOpen(false);}}>
                            <span>{CATEGORY_OPTIONS.find(o => o.key === categoryFilter)?.label}</span>
                            <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
                        </div>
                        <div className="dropdown-menu">
                            {CATEGORY_OPTIONS.map(opt => (
                                <div key={opt.key} className={`dropdown-item ${categoryFilter === opt.key ? 'active' : ''}`} onClick={() => {setCategoryFilter(opt.key); setIsCategoryOpen(false);}}>{opt.label}</div>
                            ))}
                        </div>
                    </div>
                    <div className={`dropdown-wrap ${isSortOpen ? "open" : ""}`} ref={sortRef}>
                        <div className="dropdown" onClick={() => {setIsSortOpen(p => !p); setIsCategoryOpen(false);}}>
                            <span>{deptSortOptions.find(o => o.key === sortFilter)?.label}</span>
                            <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
                        </div>
                        <div className="dropdown-menu">
                            {deptSortOptions.map(opt => (
                                <div key={opt.key} className={`dropdown-item ${sortFilter === opt.key ? 'active' : ''}`} onClick={() => {setSortFilter(opt.key); setIsSortOpen(false);}}>{opt.label}</div>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="search-wrap" style={{ position: 'relative' }}>
                            <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--ink-tertiary)' }}>
                                <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
                            </svg>
                            <input 
                                type="text" 
                                placeholder="업무명으로 검색" 
                                style={{ width: 240, padding: '9px 12px 9px 36px', border: '1px solid var(--line-strong)', borderRadius: '8px', background: 'var(--surface)' }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSearch();
                                    }
                                }}
                            />
                        </div>
                        <button className="action-btn" onClick={handleSearch}>검색</button>
                        <button className="action-btn" onClick={handleReset}>초기화</button>
                    </div>
                </div>
                <div className="tablewrap">
                    <div className="trow head knowl-trow">
                        <span>카테고리</span>
                        <span>업무명</span>
                        <span>부서</span>
                        <span>작성자</span>
                        <span>노하우</span>
                        <span>최종 수정일</span>
                        <span></span>
                    </div>
                    <div id="listBody">
                        {isLoading ? (
                            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ink-tertiary)', fontSize: '14px' }}>
                                목록을 불러오는 중입니다...
                            </div>
                        ) : isError ? (
                            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--danger)', fontSize: '14px' }}>
                                목록을 불러오는 중 오류가 발생했습니다.
                            </div>
                        ) : items.length > 0 ? (
                            items.map(item => (
                                <div className="trow knowl-trow" key={item.knowledge_id} onClick={() => navigate(`/knowledge/${item.knowledge_id}`)}>
                                    <div><span className={`badge ${CATEGORY_CLASS_MAP[item.category_name] || 'badge-soft'}`}>{item.category_name || '미분류'}</span></div>
                                    <div className="title">{item.title} <span className="subtitle">{item.task_name ? `— ${item.task_name}` : ''}</span></div>
                                    <div className="date">{item.department_name}</div>
                                    <div className="date">{item.created_by_name}</div>
                                    <div className="date">{item.log_count}건</div>
                                    <div className="date">{item.updated_at?.split('T')[0]}</div>
                                    <svg className="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3"><path d="m9 18 6-6-6-6"></path></svg>
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ink-tertiary)', fontSize: '14px' }}>
                                표시할 지식베이스가 없습니다.
                            </div>
                        )}
                    </div>
                </div>
                {totalPages > 1 && (
                    <div className="pagination-wrapper" style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
                        <Pagination totalItems={totalItems} itemsPerPage={ITEMS_PER_PAGE} currentPage={currentPage} onPageChange={handlePageChange} />
                    </div>
                )}
                <div className="footnote">※ 부서 이동 이전 소속 부서의 지식 카드는 표시되지 않습니다.</div>
            </div>
        </div>

    )
}

export default Knowl;
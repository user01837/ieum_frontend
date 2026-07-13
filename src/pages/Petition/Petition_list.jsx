import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Petition_list.css';
import Pagination from '../../components/Pagination/Pagination.jsx';
import useAuthStore from '../../store/useAuthStore.js';
import { COMPLAINTS, PREDECESSOR, TASKS } from './data';

// 다른 파일에서도 사용될 수 있으므로, 나중에 공통 데이터 파일로 옮기는 것을 고려해볼 수 있습니다.
const ALL_DEPARTMENTS = ['행정복지과', '도로교통과', '문화도시과', '도시계획과', '정보통신과', '총무과'];

const statusOptions = [
    { key: 'all', label: '전체' },
    { key: 'wait', label: '대기중' },
    { key: 'progress', label: '처리중' },
    { key: 'done', label: '완료' },
];


function PetitionList({ isAdmin = false }) {
    const user = useAuthStore((state) => state.user);
    const [allComplaints, setAllComplaints] = useState([]); // 필터/정렬된 전체 데이터
    const [complaints, setComplaints] = useState([]); // 현재 페이지에 보여줄 데이터 (10개)
    const [currentScope, setCurrentScope] = useState(isAdmin ? ALL_DEPARTMENTS[0] : 'dept');
    const [currentStatus, setCurrentStatus] = useState('all'); // 'all', 'wait', 'progress', 'done'
    const [isSortOn, setIsSortOn] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    const [isScopeDropdownOpen, setIsScopeDropdownOpen] = useState(false);
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

    const navigate = useNavigate();
    const ITEMS_PER_PAGE = 10;

    const scopeDropdownRef = useRef(null);
    const statusDropdownRef = useRef(null);

    // 로그인한 사용자 정보가 없으면 렌더링하지 않거나 로딩 상태를 표시할 수 있습니다.
    if (!user) {
        return <div>사용자 정보를 불러오는 중입니다...</div>;
    }

    const nonAdminScopeOptions = [
        { key: 'dept', label: '부서 전체 민원' },
        { key: 'task', label: '업무별' },
        { key: 'mine', label: '내 민원' },
        { key: 'predecessor', label: '전임자' },
    ];

    const nonAdminScopeSubtitles = {
      dept:`${user.deptName} 소관 민원을 조회합니다. 항목을 클릭하면 상세 처리 화면으로 이동합니다.`,
      task:'처리기한이 임박한 순서로 업무를 조회합니다. 항목을 클릭하면 상세 처리 화면으로 이동합니다.',
      mine:`${user.name}님이 담당하고 있는 민원만 조회합니다. 항목을 클릭하면 상세 처리 화면으로 이동합니다.`,
      predecessor:'전임자로부터 인계받은 업무 목록입니다. 항목을 클릭하면 상세 처리 화면으로 이동합니다.'
    };

    const scopeOptions = isAdmin
        ? ALL_DEPARTMENTS.map(dept => ({ key: dept, label: dept }))
        : nonAdminScopeOptions;

    const currentSubtitle = isAdmin
        ? `${currentScope} 소관 민원을 조회하고 관리합니다.`
        : nonAdminScopeSubtitles[currentScope];

    const currentScopeLabel = scopeOptions.find(o => o.key === currentScope)?.label;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (scopeDropdownRef.current && !scopeDropdownRef.current.contains(event.target)) {
                setIsScopeDropdownOpen(false);
            }
            if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
                setIsStatusDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        // 1. 데이터 소스 결정 및 필터링/정렬
        if (!user) return;

        let source;

        if (isAdmin) {
            // 관리자는 모든 민원(COMPLAINTS + PREDECESSOR)을 대상으로 부서별 필터링
            source = [...COMPLAINTS, ...PREDECESSOR].filter(c => c.dept === currentScope);
        } else if (currentScope === 'predecessor') {
            source = [...PREDECESSOR];
        } else if (currentScope === 'mine') {
            source = [...COMPLAINTS, ...PREDECESSOR].filter(c => c.assignee === user.name);
        } else if (currentScope === 'task') {
            // 참고: user 객체에 taskIds가 포함되어 있어야 합니다.
            source = [...COMPLAINTS, ...PREDECESSOR].filter(c => user.taskIds?.includes(c.taskId)).sort((a,b) => a.deadline.localeCompare(b.deadline));
        } else { 
            // 일반 사용자의 '부서 전체 민원'
            source = [...COMPLAINTS, ...PREDECESSOR].filter(c => c.dept === user.deptName);
        }
        
        if (currentStatus !== 'all') {
            source = source.filter(c => c.status === currentStatus);
        }

        if (isSortOn) {
            source.sort((a, b) => {
                const aIsDone = a.status === 'done';
                const bIsDone = b.status === 'done';
                if (aIsDone !== bIsDone) {
                    return aIsDone ? 1 : -1;
                }
                return a.received.localeCompare(b.received);
            });
        }
        
        setAllComplaints(source);
        setCurrentPage(1); // 필터가 변경되면 1페이지로 리셋
    }, [currentScope, currentStatus, isSortOn, isAdmin, user]);

    useEffect(() => {
        // 2. 현재 페이지에 맞는 데이터 10개 슬라이싱
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        setComplaints(allComplaints.slice(startIndex, endIndex));
    }, [allComplaints, currentPage]);

    const handleScopeSelect = (scope) => {
        setCurrentScope(scope);
        setIsScopeDropdownOpen(false);
    };

    const handleStatusSelect = (status) => {
        setCurrentStatus(status);
        setIsStatusDropdownOpen(false);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <>
            <div className="view active">
                <div className="petition-content">
                    <div className="pagehead">
                        <div>
                            <h2>민원 목록</h2>
                            <div className="sub">{currentSubtitle}</div>
                        </div>
                    </div>

                    <div className="toolbar">
                        <div className={`dropdown-wrap ${isScopeDropdownOpen ? 'open' : ''}`} ref={scopeDropdownRef}>
                            <div className="dropdown" onClick={() => {setIsScopeDropdownOpen(p => !p); setIsStatusDropdownOpen(false);}}>
                                <span>{currentScopeLabel}</span>
                                <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
                            </div>
                            <div className="dropdown-menu">
                                {scopeOptions.map(opt => (
                                    <div key={opt.key} className={`dropdown-item ${currentScope === opt.key ? 'active' : ''}`} onClick={() => handleScopeSelect(opt.key)}>{opt.label}</div>
                                ))}
                            </div>
                        </div>

                        <div className={`dropdown-wrap ${isStatusDropdownOpen ? 'open' : ''}`} ref={statusDropdownRef}>
                            <div className="dropdown" onClick={() => {setIsStatusDropdownOpen(p => !p); setIsScopeDropdownOpen(false);}}>
                                상태: <span>{statusOptions.find(o => o.key === currentStatus)?.label}</span>
                                <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
                            </div>
                            <div className="dropdown-menu">
                                {statusOptions.map(opt => (
                                    <div key={opt.key} className={`dropdown-item ${currentStatus === opt.key ? 'active' : ''}`} onClick={() => handleStatusSelect(opt.key)}>{opt.label}</div>
                                ))}
                            </div>
                        </div>

                        <div className="checkline" onClick={() => setIsSortOn(p => !p)}>
                            <div className="checkbox" style={{
                                background: isSortOn ? 'var(--blue)' : 'transparent',
                                borderColor: isSortOn ? 'var(--blue)' : 'var(--line-strong)'
                            }}>
                                <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" style={{ opacity: isSortOn ? 1 : 0 }}><path d="M20 6 9 17l-5-5"/></svg>
                            </div>
                            미완료 민원 우선 표시 (접수순)
                        </div>
                    </div>

                    <div className="tablewrap">
                        <div className="trow head">
                            <span>접수일</span>
                            <span>처리기한</span>
                            <span>제목</span>
                            <span>{currentScope === 'task' ? '담당 업무' : '담당과'}</span>
                            <span>처리상태</span>
                            <span></span>
                        </div>
                        <div id="listBody">
                            {complaints.length > 0 ? (
                                complaints.map(c => (
                                    <div key={c.id} className="trow" onClick={() => navigate(`/petitions/${c.id}`)}>
                                        <span className="date">{c.received}</span>
                                        <span className="date">{c.deadline}</span>
                                        <div className="title">{c.title}</div>
                                        <span className="deptname">
                                            {currentScope === 'task' ? (TASKS[c.taskId]?.name || '미분류') : c.dept}
                                        </span>
                                        <span className={`status ${c.status}`}>
                                            <span className="dot"></span>{c.statusText}
                                        </span>
                                        <svg className="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3"><path d="m9 18 6-6-6-6"/></svg>
                                    </div>
                                ))
                            ) : (
                                <div style={{padding:'40px 0', textAlign:'center', fontSize:'13px', color:'var(--ink-tertiary)'}}>표시할 항목이 없습니다.</div>
                            )}
                        </div>
                        <div className="tablefoot">
                            <Pagination
                                totalItems={allComplaints.length}
                                itemsPerPage={ITEMS_PER_PAGE}
                                currentPage={currentPage}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </div>
                    <div className="footnote">※ 부서 이동 시 이전 소속 부서의 민원 목록은 표시되지 않습니다.</div>
                </div>
            </div>
        </>
    );
}

export default PetitionList;

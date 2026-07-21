import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Petition/Petition_list.css';
import './knowl.css';

const CATEGORY_OPTIONS = [
    { key: 'all', label: '전체 카테고리' },
    { key: 'petition', label: '민원처리' },
    { key: 'project', label: '사업추진' },
];

const SORT_OPTIONS = [
    { key: 'latest', label: '전체 부서' },
    { key: 'knowhow', label: '내 부서' },
];

function Knowl() {
    const navigate = useNavigate();
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [sortFilter, setSortFilter] = useState('latest');

    const categoryRef = useRef(null);
    const sortRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (categoryRef.current && !categoryRef.current.contains(e.target)) setIsCategoryOpen(false);
            if (sortRef.current && !sortRef.current.contains(e.target)) setIsSortOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const dummyData = [
        { id: 1, category: '사업추진', categoryClass: 'badge-warn', title: '대중교통 사업', subtitle: '— 중앙부처 사업 수행 시 유의사항', author: '김OO', knowhowCount: 5, lastModified: '2026-06-12' },
        { id: 2, category: '민원처리', categoryClass: 'badge-new', title: '주차장 출입 차단기 오류 민원', subtitle: '— 반복 민원 처리 절차', author: '이OO', knowhowCount: 3, lastModified: '2026-05-03' },
        { id: 3, category: '사업추진', categoryClass: 'badge-warn', title: '연간 예산 편성 절차', subtitle: '— 요구서 작성 및 제출 타임라인', author: '박OO', knowhowCount: 2, lastModified: '2026-04-17' },
        { id: 4, category: '사업추진', categoryClass: 'badge-warn', title: '도로교통 통제', subtitle: '— 2025년 신규 사업 초기 세팅', author: '최OO', knowhowCount: 1, lastModified: '2026-03-22' },
        { id: 5, category: '민원처리', categoryClass: 'badge-new', title: '캠퍼스 가로등 고장 신고 처리', subtitle: '— 유관부서 협조 요청 절차', author: '정OO', knowhowCount: 2, lastModified: '2026-02-09' },
    ];

    return(
        
        <div className="view active">
            <div className="petition-content">
                <div className="pagehead">
                    <div>
                        <h2>지식베이스 목록</h2>
                        <div className="sub">업무 노하우와 처리 사례를 검색하고 학습합니다.</div>
                    </div>
                </div>

                <div className="project-toolbar-top" style={{marginBottom: '10px'}}>
                    <div className="project-newbtn" onClick={() => navigate("/knowledge/new")}
                        >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                        <path d="M12 5v14M5 12h14" />
                        </svg>
                        새 항목 생성
                    </div>
                    </div>

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
                            <span>{SORT_OPTIONS.find(o => o.key === sortFilter)?.label}</span>
                            <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
                        </div>
                        <div className="dropdown-menu">
                            {SORT_OPTIONS.map(opt => (
                                <div key={opt.key} className={`dropdown-item ${sortFilter === opt.key ? 'active' : ''}`} onClick={() => {setSortFilter(opt.key); setIsSortOpen(false);}}>{opt.label}</div>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="search-wrap" style={{ position: 'relative' }}>
                            <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--ink-tertiary)' }}>
                                <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
                            </svg>
                            <input type="text" placeholder="업무명으로 검색" style={{ width: 240, padding: '9px 12px 9px 36px', border: '1px solid var(--line-strong)', borderRadius: '8px', background: 'var(--surface)' }} />
                        </div>
                        <button className="action-btn">검색</button>
                        <button className="action-btn">초기화</button>
                    </div>
                </div>
                <div className="tablewrap">
                    <div className="trow head knowl-trow">
                        <span>카테고리</span>
                        <span>업무명</span>
                        <span>작성자</span>
                        <span>노하우</span>
                        <span>최종 수정일</span>
                        <span></span>
                    </div>
                    <div id="listBody">
                        {dummyData.map(item => (
                            <div className="trow knowl-trow" key={item.id} onClick={() => navigate(`/knowledge/${item.id}`)}>
                                <div><span className={`badge ${item.categoryClass}`}>{item.category}</span></div>
                                <div className="title">{item.title} <span className="subtitle">{item.subtitle}</span></div>
                                <div className="date">{item.author}</div>
                                <div className="date">{item.knowhowCount}건</div>
                                <div className="date">{item.lastModified}</div>
                                <svg className="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3"><path d="m9 18 6-6-6-6"></path></svg>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="footnote">※ 부서 이동 이전 소속 부서의 지식 카드는 표시되지 않습니다.</div>
                {/* 지식 베이스 페이지의 실제 콘텐츠가 여기에 들어갑니다. */}
            </div>
        </div>

    )
}

export default Knowl;
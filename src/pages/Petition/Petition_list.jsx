import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Petition_list.css';
import Pagination from '../../components/Pagination';
import { COMPLAINTS, PREDECESSOR } from './data';

const scopeSubtitles = { 
  dept:'문화도시과 소관 민원을 조회합니다. 항목을 클릭하면 상세 처리 화면으로 이동합니다.', 
  task:'처리기한이 임박한 순서로 업무를 조회합니다. 항목을 클릭하면 상세 처리 화면으로 이동합니다.', 
  mine:'박주임님이 담당하고 있는 민원만 조회합니다. 항목을 클릭하면 상세 처리 화면으로 이동합니다.', 
  predecessor:'전임자로부터 인계받은 업무 목록입니다. 항목을 클릭하면 상세 처리 화면으로 이동합니다.' 
};

const scopeOptions = [
    { key: 'dept', label: '부서 전체 민원' },
    { key: 'task', label: '업무별' },
    { key: 'mine', label: '내 민원' },
    { key: 'predecessor', label: '전임자' },
];

const statusOptions = [
    { key: 'all', label: '전체' },
    { key: 'wait', label: '대기중' },
    { key: 'progress', label: '처리중' },
    { key: 'done', label: '완료' },
];


function PetitionList() {
    const [allComplaints, setAllComplaints] = useState([]); // 필터/정렬된 전체 데이터
    const [complaints, setComplaints] = useState([]); // 현재 페이지에 보여줄 데이터 (10개)
    const [currentScope, setCurrentScope] = useState('dept');
    const [currentStatus, setCurrentStatus] = useState('all');
    const [isSortOn, setIsSortOn] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    const [isScopeDropdownOpen, setIsScopeDropdownOpen] = useState(false);
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

    const navigate = useNavigate();
    const ITEMS_PER_PAGE = 10;
    
    const scopeDropdownRef = useRef(null);
    const statusDropdownRef = useRef(null);

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
        let source;
  
        if (currentScope === 'predecessor') {
            source = [...PREDECESSOR];
        } else if (currentScope === 'mine') {
            source = COMPLAINTS.filter(c => c.assignee === '박주임');
        } else if (currentScope === 'task') {
            source = [...COMPLAINTS].sort((a,b) => a.deadline.localeCompare(b.deadline));
        } else { 
            source = [...COMPLAINTS];
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
    }, [currentScope, currentStatus, isSortOn]);

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
                            <div className="sub">{scopeSubtitles[currentScope]}</div>
                        </div>
                    </div>

                    <div className="toolbar">
                        <div className={`dropdown-wrap ${isScopeDropdownOpen ? 'open' : ''}`} ref={scopeDropdownRef}>
                            <div className="dropdown" onClick={() => {setIsScopeDropdownOpen(p => !p); setIsStatusDropdownOpen(false);}}>
                                <span>{scopeOptions.find(o => o.key === currentScope)?.label}</span>
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
                            <span>담당과</span>
                            <span>처리상태</span>
                            <span></span>
                        </div>
                        <div id="listBody">
                            {complaints.length > 0 ? (
                                complaints.map(c => (
                                    <div key={c.id} className="trow" onClick={() => navigate(`/petitions/${c.id}`)}>
                                        <span className="date">{c.received}</span>
                                        <span className="date">{c.deadline}</span>
                                        <div><div className="title">{c.title}</div></div>
                                        <span className="deptname">{c.dept}</span>
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

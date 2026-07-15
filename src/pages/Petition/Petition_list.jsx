import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Petition_list.css';
import Pagination from '../../components/Pagination/Pagination.jsx';
import useAuthStore from '../../store/useAuthStore.js';
import { usePetitionsQuery } from '../../hooks/queries/usePetitionQuery.js';
import { useDepartmentsQuery } from '../../hooks/queries/useDeptQuery.js';

// 다른 파일에서도 사용될 수 있으므로, 나중에 공통 데이터 파일로 옮기는 것을 고려해볼 수 있습니다.

const statusOptions = [
    { key: 'all', label: '전체' },
    { key: '01', label: '대기중' },
    { key: '02', label: '처리중' },
    { key: '03', label: '완료' },
];

const STATUS_CLASS_MAP = {
    '대기중': 'wait',
    '처리중': 'progress',
    '완료': 'done',
};


function PetitionList() {
    const user = useAuthStore((state) => state.user);
    const isAdmin = useMemo(() => user?.system_role_code === '02', [user]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        // 컴포넌트가 마운트된 후에 isClient를 true로 설정하여
        // 서버 사이드 렌더링과 클라이언트 사이드 렌더링의 불일치를 방지합니다.
        setIsClient(true);
    }, []);
    
    // 전체 부서 목록을 가져와서 code-name 맵을 만듭니다.
    const { data: departmentsData } = useDepartmentsQuery();
    const departments = departmentsData || [];

    const [currentScope, setCurrentScope] = useState(isAdmin ? 'ALL_DEPTS' : 'dept');
    const [currentStatus, setCurrentStatus] = useState('all'); // 'all', 'wait', 'progress', 'done'
    const [isSortOn, setIsSortOn] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;
    
    // API 요청을 위한 파라미터 변환
    const apiScope = useMemo(() => {
        if (isAdmin) return 'ALL'; // 관리자는 항상 'ALL'
        if (currentScope === 'dept') return 'ALL'; // 부서 전체 민원은 백엔드의 'ALL'과 동일
        if (currentScope === 'mine') return 'MY';
        if (currentScope === 'task') return 'TASK';
        if (currentScope === 'predecessor') return 'PREDECESSOR';
        return 'ALL';
    }, [isAdmin, currentScope]);

    const apiStatus = currentStatus === 'all' ? 'ALL' : currentStatus;
    const apiDepartmentCode = (isAdmin && currentScope !== 'ALL_DEPTS') ? currentScope : null;

    const { data: petitionData, isLoading, isError } = usePetitionsQuery({
      scope: isAdmin ? 'ALL' : apiScope,
      status: apiStatus,
      page: currentPage - 1, // API는 0부터 시작, UI는 1부터 시작
      size: ITEMS_PER_PAGE,
      sort: isSortOn ? 'due_date_impending' : null,
      departmentCode: apiDepartmentCode,
    });

    const complaints = petitionData?.content || [];
    const totalItems = petitionData?.totalElements || 0;

    const [isScopeDropdownOpen, setIsScopeDropdownOpen] = useState(false);
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

    const navigate = useNavigate();

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

    const nonAdminScopeOptions = [
        { key: 'dept', label: '부서 전체 민원' }, // UI에서는 'dept'를 사용
        { key: 'task', label: '업무별' },
        { key: 'mine', label: '내 민원' },
        { key: 'predecessor', label: '전임자' },
    ];

    const scopeOptions = useMemo(() => {
        if (isAdmin) {
            const deptOptions = departments.map(d => ({ key: d.code, label: d.name }));
            return [{ key: 'ALL_DEPTS', label: '전체 부서' }, ...deptOptions];
        }
        return nonAdminScopeOptions;
    }, [isAdmin, departments]);

    // `user`가 로드되기 전에도 안전하게 접근하기 위해 옵셔널 체이닝(`?.`)을 사용합니다.
    const nonAdminScopeSubtitles = {
      dept:`${user?.deptName} 소관 민원을 조회합니다. 항목을 클릭하면 상세 처리 화면으로 이동합니다.`,
      task:'처리기한이 임박한 순서로 업무를 조회합니다. 항목을 클릭하면 상세 처리 화면으로 이동합니다.',
      mine:`${user?.name}님이 담당하고 있는 민원만 조회합니다. 항목을 클릭하면 상세 처리 화면으로 이동합니다.`,
      predecessor:'전임자로부터 인계받은 업무 목록입니다. 항목을 클릭하면 상세 처리 화면으로 이동합니다.'
    };

    const currentSubtitle = isAdmin
        ? `${scopeOptions.find(o => o.key === currentScope)?.label || '전체'} 소관 민원을 조회하고 관리합니다.`
        : nonAdminScopeSubtitles[currentScope];

    const currentScopeLabel = scopeOptions.find(o => o.key === currentScope)?.label;

    // 클라이언트에서 마운트되기 전이거나, 사용자 정보가 없다면 로딩 상태를 표시합니다.
    // 이렇게 하면 localStorage에서 상태를 불러오는 동안 발생할 수 있는 UI 깜빡임이나 오류를 방지합니다.
    if (!isClient || !user) {
        return <div>사용자 정보를 불러오는 중입니다...</div>;
    }

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
                            처리기한 임박 민원 우선 표시
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
                            {isLoading ? (
                                <div style={{padding:'40px 0', textAlign:'center', fontSize:'13px', color:'var(--ink-tertiary)'}}>민원 목록을 불러오는 중입니다...</div>
                            ) : isError ? (
                                <div style={{padding:'40px 0', textAlign:'center', fontSize:'13px', color:'var(--danger)'}}>오류가 발생했습니다.</div>
                            ) : complaints.length > 0 ? (
                                complaints.map(c => (
                                    <div key={c.complaintId} className="trow" onClick={() => navigate(`/petitions/${c.complaintId}`, { state: { isAdmin } })}>
                                        <span className="date">{c.receivedAt?.split('T')[0]}</span>
                                        <span className="date due-date">{c.dueDate?.split('T')[0]}</span>
                                        <div className="title">{c.title}</div>
                                        <span className="deptname">
                                            {currentScope === 'task'
                                                ? c.taskName || '업무 미지정'
                                                : (departments.find(d => d.code === c.departmentCode)?.name || c.departmentName || '부서 미분류')
                                            }
                                        </span>
                                        <span className={`status ${STATUS_CLASS_MAP[c.statusName] || ''}`}>
                                            <span className="dot"></span>{c.statusName}
                                        </span>
                                        <svg className="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3"><path d="m9 18 6-6-6-6"/></svg>
                                    </div>
                                ))
                            ) : (
                                <div style={{padding:'40px 0', textAlign:'center', fontSize:'13px', color:'var(--ink-tertiary)'}}>표시할 민원이 없습니다.</div>
                            )}
                        </div>
                        <div className="tablefoot">
                            <Pagination
                                totalItems={totalItems}
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

import { useState, useEffect, useRef } from "react";
import "./Admin.css";
import { useQueryClient } from "@tanstack/react-query";
import EmployeeSearchModal from "../../components/EmpSearchModal/EmpSearchModal";
import Pagination from "../../components/Pagination/Pagination.jsx";
import { useDepartmentsQuery } from "../../hooks/queries/useDeptQuery";
import { useUsersQuery, useAdminStatsQuery } from "../../hooks/queries/useUserQuery";
import {
  useCreateUserMutation,
  useUpdateUserMutation,
  useResetPasswordMutation,
} from "../../hooks/mutations/useUserMutations";

const statusOptions = [
  { key: 'ALL', label: '전체 상태' },
  { key: '01', label: '재직' },
  { key: '02', label: '휴직' },
  { key: '03', label: '퇴직' },
];
const PAGE_SIZE_OPTIONS = [10, 20, 50];

const INIT_FORM = {
  loginId: '', pw: '', name: '', employeeNo: '',
  dept: '', position: '', status: '01', predecessor: null,
};

// API 응답의 이름을 코드로 변환하기 위한 역방향 맵
const REVERSE_POSITION_MAP = {
  "부장": "01",
  "팀장": "02",
  "주무관": "03",
};

const REVERSE_USER_STATUS_MAP = {
  "재직": "01",
  "휴직": "02",
  "퇴직": "03",
};

export default function Admin() {
  // 탭
  const [activeTab, setActiveTab] = useState('list');

  // 목록 필터
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchInputValue, setSearchInputValue] = useState(''); // 입력창의 값
  const [appliedSearchKeyword, setAppliedSearchKeyword] = useState(''); // 실제 필터링에 적용될 값
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isDeptOpen, setIsDeptOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
  const [isModalDeptOpen, setIsModalDeptOpen] = useState(false);
  const [isModalPositionOpen, setIsModalPositionOpen] = useState(false);
  const [predecessorTouched, setPredecessorTouched] = useState(false);

  // 신규 직원 등록 모달
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTargetId, setEditTargetId] = useState(null);
  const [formData, setFormData] = useState(INIT_FORM);
  const [isPredecessorModalOpen, setIsPredecessorModalOpen] = useState(false);

  // 비밀번호 초기화 모달
  const [isResetPwOpen, setIsResetPwOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState(null);
  const [newTempPassword, setNewTempPassword] = useState('');

  // 토스트
  const [toast, setToast] = useState('');
  const toastTimerRef = useRef(null);

  // API Hooks
  const { data: departmentsData } = useDepartmentsQuery();
  const deptOptions = [{ code: 'ALL', name: '전체 부서' }, ...(departmentsData || [])];

  // 통계 데이터 조회
  const { data: statsData } = useAdminStatsQuery();

  const { data: usersData, isLoading, isError } = useUsersQuery({
    departmentCode: deptFilter === 'ALL' ? null : deptFilter,
    status: statusFilter === 'ALL' ? null : statusFilter,
    keyword: appliedSearchKeyword,
    page: currentPage - 1,
    size: pageSize,
  });

  const users = usersData?.content || [];
  const totalUsers = usersData?.totalElements || 0;

  // Mutation Hooks
  const createUserMutation = useCreateUserMutation();
  const updateUserMutation = useUpdateUserMutation();
  const resetPasswordMutation = useResetPasswordMutation();
  const queryClient = useQueryClient();

  const deptRef = useRef(null);
  const statusRef = useRef(null);
  const pageSizeRef = useRef(null);
  const modalDeptRef = useRef(null);
  const modalPositionRef = useRef(null);

  useEffect(() => {
    return () => toastTimerRef.current && clearTimeout(toastTimerRef.current);
  }, []);

  // 드롭다운 외부 클릭 닫기
  useEffect(() => {
    const handler = (e) => {
      if (deptRef.current && !deptRef.current.contains(e.target)) setIsDeptOpen(false);
      if (statusRef.current && !statusRef.current.contains(e.target)) setIsStatusOpen(false);
      if (pageSizeRef.current && !pageSizeRef.current.contains(e.target)) setIsPageSizeOpen(false);
      if (modalDeptRef.current && !modalDeptRef.current.contains(e.target)) setIsModalDeptOpen(false);
      if (modalPositionRef.current && !modalPositionRef.current.contains(e.target)) setIsModalPositionOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // 토스트
  const showToast = (msg) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast(msg);
    toastTimerRef.current = setTimeout(() => {
      setToast('');
      toastTimerRef.current = null;
    }, 2500);
  };

  // 통계
  const stats = {
    total: statsData?.totalUsers ?? 0,
    active: statsData?.activeUsers ?? 0,
    leave: statsData?.leaveUsers ?? 0,
    retired: statsData?.resignedUsers ?? 0,
    depts: statsData?.totalDepartments ?? 0,
  };

  // 신규 등록 모달 열기
  const openCreateModal = () => {
    setIsEditMode(false);
    setFormData(INIT_FORM);
    setIsUserFormOpen(true);
  };

  // 수정 모달 열기
  const openEditModal = (user) => {
    setPredecessorTouched(false);
    setIsEditMode(true);
    setEditTargetId(user.userId);
    setFormData({
      loginId: user.userId,
      pw: '',
      name: user.name,
      employeeNo: user.userId,
      dept: departmentsData?.find(d => d.name === user.departmentName)?.code || '',
      position: REVERSE_POSITION_MAP[user.positionName] || '',
      status: REVERSE_USER_STATUS_MAP[user.statusName] || '',
      predecessor: user.predecessor,
    });
    setIsUserFormOpen(true);
  };

  // 저장
  const handleFormSave = () => {
    if (!formData.name || !formData.employeeNo || !formData.dept || !formData.position) {
      alert('필수 항목을 모두 입력해 주세요.'); return;
    }

    const mutation = isEditMode ? updateUserMutation : createUserMutation;

    let userData = {
      name: formData.name,
      departmentCode: formData.dept,
      positionCode: formData.position,
      statusCode: formData.status,
    };

    if (predecessorTouched) {
      userData.predecessorUserId = formData.predecessor ? formData.predecessor.userId : null;
    }

    const variables = isEditMode ? {
      userId: editTargetId,
      userData,
    } : {
      userId: formData.employeeNo,
      name: formData.name,
      departmentCode: formData.dept,
      positionCode: formData.position,
      predecessorUserId: formData.predecessor ? formData.predecessor.userId : null,
    };

    mutation.mutate(variables, {
      onSuccess: (data) => {
        setIsUserFormOpen(false);
        showToast(data.message || (isEditMode ? '직원 정보가 수정되었습니다.' : '신규 직원이 등록되었습니다.'));
        // 직원 목록과 통계 데이터를 함께 새로고침합니다.
        queryClient.invalidateQueries({ queryKey: ['users'] });
        queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      },
      onError: (error) => {
        alert(`오류: ${error.response?.data?.detail || error.message}`);
      }
    });
  };

  // 비밀번호 초기화
  const openResetPw = (user) => {
    setResetTarget(user);
    setNewTempPassword('');
    setIsResetPwOpen(true);
  };

  const closeResetPwModal = () => {
    setIsResetPwOpen(false);
    setResetTarget(null);
    setNewTempPassword('');
  };

  const handleResetPw = () => {
    if (!resetTarget) return;
    resetPasswordMutation.mutate(resetTarget.userId, {
      onSuccess: (data) => {
        // 비밀번호 표시를 위해 모달을 닫지 않고, 상태를 업데이트합니다.
        showToast(data.message || `${resetTarget.name}님의 비밀번호가 초기화되었습니다.`);
        setNewTempPassword(data.temporaryPassword);
      },
      onError: (error) => {
        alert(`오류: ${error.response?.data?.detail || error.message}`);
      }
    });
  };

  const handleSelectPredecessor = (employee) => {
    setFormData(p => ({
      ...p, predecessor: { name: employee.name, userId: employee.userId }
    }));
    setPredecessorTouched(true);
    setIsPredecessorModalOpen(false);
  };

  return (
    <div className="admin-content">

      {/* 통계 카드 */}
      <div className="admin-stats">
        {[
          { label: '전체 직원', value: stats.total, unit: '명', sub: '전체 계정 수', color: 'var(--blue-soft)', iconColor: 'var(--blue)' },
          { label: '재직 중', value: stats.active, unit: '명', sub: '현재 재직 중인 직원', color: 'var(--good-soft)', iconColor: 'var(--good)' },
          { label: '휴직 중', value: stats.leave, unit: '명', sub: '휴직 중인 직원', color: 'var(--warn-soft)', iconColor: 'var(--warn)' },
          { label: '퇴직', value: stats.retired, unit: '명', sub: '퇴직 처리된 직원', color: '#FAE8E3', iconColor: '#C1503D' },
          { label: '부서 수', value: stats.depts, unit: '개', sub: '활성 부서 기준', color: '#EDE9FE', iconColor: '#7C3AED' },
        ].map((card) => (
          <div key={card.label} className="admin-stat-card">
            <div className="admin-stat-icon" style={{ background: card.color, color: card.iconColor }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
              </svg>
            </div>
            <div>
              <div className="admin-stat-value">{card.value}<span className="unit">{card.unit}</span></div>
              <div className="admin-stat-label">{card.label}</div>
              <div className="admin-stat-sub">{card.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 탭 */}
      <div className="admin-tabs">
        {[
          { key: 'list', label: '직원 목록' },
        ].map((tab) => (
          <div
            key={tab.key}
            className={`admin-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </div>
        ))}
      </div>

      {/* 직원 목록 탭 */}
      {activeTab === 'list' && (
        <>
          <div className="admin-toolbar">
            {/* 부서 필터 */}
            <div className={`dropdown-wrap ${isDeptOpen ? 'open' : ''}`} ref={deptRef}>
              <div className="dropdown" onClick={() => setIsDeptOpen(p => !p)}>
                <span>{deptOptions.find(d => d.code === deptFilter)?.name || '전체 부서'}</span>
                <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6" /></svg>
              </div>
              <div className="dropdown-menu">
                {deptOptions.map(d => (
                  <div key={d.code} className={`dropdown-item ${deptFilter === d.code ? 'active' : ''}`}
                    onClick={() => { setDeptFilter(d.code); setIsDeptOpen(false); setCurrentPage(1); }}>
                    {d.name}
                  </div>
                ))}
              </div>
            </div>

            {/* 상태 필터 */}
            <div className={`dropdown-wrap ${isStatusOpen ? 'open' : ''}`} ref={statusRef}>
              <div className="dropdown" onClick={() => setIsStatusOpen(p => !p)}>
                <span>{statusOptions.find(s => s.key === statusFilter)?.label || '전체 상태'}</span>
                <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6" /></svg>
              </div>
              <div className="dropdown-menu">
                {statusOptions.map(s => (
                  <div key={s.key} className={`dropdown-item ${statusFilter === s.key ? 'active' : ''}`}
                    onClick={() => { setStatusFilter(s.key); setIsStatusOpen(false); setCurrentPage(1); }}>
                    {s.label}
                  </div>
                ))}
              </div>
            </div>

            {/* 검색 */}
            <div className="admin-search-wrap">
              <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                placeholder="이름, 사번으로 검색"
                style={{ padding: '9px 12px 9px 36px', border: '1px solid var(--line-strong)', borderRadius: '8px', background: 'var(--surface)' }}
                value={searchInputValue}
                onChange={(e) => setSearchInputValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    setAppliedSearchKeyword(searchInputValue);
                    setCurrentPage(1);
                  }
                }}
              />
            </div>

            {/* 검색 */}
            <button className="admin-action-btn" onClick={() => {
              setAppliedSearchKeyword(searchInputValue);
              setCurrentPage(1);
            }}>검색</button>

            {/* 초기화 */}
            <button className="admin-action-btn" onClick={() => {
              setDeptFilter('ALL'); setStatusFilter('ALL');
              setSearchInputValue(''); setAppliedSearchKeyword(''); setCurrentPage(1);
            }}>초기화</button>

            {/* 신규 등록 */}
            <button className="btn btn-navy add-new-empl-btn" onClick={openCreateModal}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
              신규 직원 등록
            </button>
          </div>

          <div>
            <span className="admin-count-label">전체 {totalUsers}명</span>
          </div>

          {/* 테이블 */}
          <div className="admin-tablewrap">
            <div className="admin-trow head">
              <span>사번</span><span>이름</span><span>부서</span>
              <span>직책</span><span>담당 Task</span>
              <span>전임자</span><span>상태</span><span className="task-span">작업</span>
            </div>

            {isLoading ? (
              <div className="admin-empty">직원 목록을 불러오는 중입니다...</div>
            ) : isError ? (
              <div className="admin-empty" style={{ color: 'var(--danger)' }}>오류가 발생했습니다.</div>
            ) : users.length === 0 ? (
              <div className="admin-empty">조건에 맞는 직원이 없습니다.</div>
            ) : (
              users.map((user) => (
                <div key={user.userId} className="admin-trow">
                  <span className="admin-user-id-cell">{user.userId}</span>
                  <span className="admin-user-name">{user.name}</span>
                  <span className="admin-user-dept">{user.departmentName}</span>
                  <span><span className={`admin-rank-badge ${user.positionName}`}>{user.positionName}</span></span>
                  <div className="admin-task-tags">
                    {user.taskNames?.slice(0, 2).map(t => <span key={t} className="admin-task-tag">{t}</span>)}
                    {user.taskNames?.length > 2 && (
                      <>
                        <span className="admin-task-tag">...</span>
                        <div className="admin-task-tooltip">{user.taskNames.join(', ')}</div>
                      </>
                    )}
                  </div>
                  <div className={`admin-predecessor ${user.predecessor ? '' : 'none'}`}>
                    {user.predecessor ? <>{user.predecessor.name}<div style={{ fontSize: '10.5px', color: 'var(--ink-tertiary)' }}>{user.predecessor.userId}</div></> : '없음'}
                  </div>
                  <span><span className={`admin-status-pill ${user.statusName}`}>{user.statusName}</span></span>

                  {/* 메뉴 */}
                  <div className="admin-row-actions">
                    <button className="admin-action-btn" onClick={() => openEditModal(user)}>수정</button>
                    <button className="admin-action-btn" onClick={() => openResetPw(user)} disabled={resetPasswordMutation.isLoading}>비밀번호 초기화</button>
                  </div>
                </div>
              ))
            )}

            {/* 페이지네이션 */}
            <div className="admin-tablefoot" style={{ justifyContent: users.length > 0 ? 'center' : 'flex-end' }}>
              {users.length > 0 && (
                <Pagination
                  totalItems={totalUsers}
                  itemsPerPage={pageSize}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                />
              )}
            </div>
          </div>

          <div className="footnote">※ 퇴직 처리된 직원은 로그인이 제한됩니다.</div>
        </>
      )}

      {/* 안내 박스 */}
      <div className="admin-infobox">
        <div className="admin-infobox-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
          안내
        </div>
        <div className="admin-infobox-grid">
          <div>• <b>신규 직원 등록</b>: 계정 생성은 '신규 직원 등록' 버튼을 통해 진행합니다.</div>
          <div>• <b>전임자</b>: 업무 인수인계 및 참고를 위해 전임자를 지정합니다.</div>
          <div>• <b>비밀번호 초기화</b>: 비밀번호를 초기화하여 해당 사용자에게 새 비밀번호를 안내할 수 있습니다.</div>
        </div>
      </div>

      {/* 신규 직원 등록 / 수정 모달 */}
      {isUserFormOpen && (
        <div className="modal-overlay">
          <div className="modal-card wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="modal-title">{isEditMode ? '직원 정보 수정' : '신규 직원 등록'}</p>
                <p className="modal-subtitle">{isEditMode ? '직원 정보를 수정합니다.' : '신규 직원의 기본 정보를 입력하여 계정을 생성합니다.'}</p>
              </div>
              <button className="modal-close-btn" onClick={() => setIsUserFormOpen(false)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="admin-modal-body">
              <div className="admin-form-scroll">

                <div className="admin-formrow2">
                  <div className="admin-field">
                    <label>이름 *</label>
                    <input className="admin-input" type="text" placeholder="이름을 입력하세요"
                      value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div className="admin-field">
                    <label>사번 *</label>
                    <input className="admin-input" type="text" placeholder="사번을 입력하세요"
                      value={formData.employeeNo} onChange={(e) => setFormData(p => ({ ...p, employeeNo: e.target.value }))} disabled={isEditMode} />
                  </div>
                </div>

                <div className="admin-formrow2">
                  <div className="admin-field">
                    <label>부서 *</label>
                    <div className={`dropdown-wrap ${isModalDeptOpen ? 'open' : ''}`} ref={modalDeptRef}>
                      <div className="dropdown" onClick={() => setIsModalDeptOpen(p => !p)}>
                        <span style={{ color: formData.dept ? 'var(--ink)' : 'var(--ink-soft)' }}>
                          {departmentsData?.find(d => d.code === formData.dept)?.name || '부서를 선택하세요'}
                        </span>
                        <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6" /></svg>
                      </div>
                      <div className="dropdown-menu">
                        {departmentsData?.map(d => (
                          <div key={d.code}
                            className={`dropdown-item ${formData.dept === d.code ? 'active' : ''}`}
                            onClick={() => {
                              setFormData(p => ({ ...p, dept: d.code, predecessor: null }));
                              setIsModalDeptOpen(false);
                            }}>
                            {d.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="admin-field">
                  <label>직책 *</label>
                  <div className={`dropdown-wrap ${isModalPositionOpen ? 'open' : ''}`} ref={modalPositionRef}>
                    <div className="dropdown" onClick={() => setIsModalPositionOpen(p => !p)}>
                      <span style={{ color: formData.position ? 'var(--ink)' : 'var(--ink-soft)' }}>
                        {formData.position
                          ? { "01": "부장", "02": "팀장", "03": "주무관" }[formData.position]
                          : '직책을 선택하세요'}
                      </span>
                      <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6" /></svg>
                    </div>
                    <div className="dropdown-menu">
                      {Object.entries({ "01": "부장", "02": "팀장", "03": "주무관" }).map(([code, name]) => (
                        <div key={code}
                          className={`dropdown-item ${formData.position === code ? 'active' : ''}`}
                          onClick={() => {
                            setFormData(p => ({ ...p, position: code }));
                            setIsModalPositionOpen(false);
                          }}>
                          {name}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="admin-field">
                  <label>전임자 <span style={{ fontWeight: 500, color: 'var(--ink-tertiary)' }}>(선택)</span></label>
                  {!formData.predecessor ? (
                    <button className="admin-action-btn" style={{ width: '100%', justifyContent: 'center' }} onClick={() => {
                      if (!formData.dept) {
                        alert('먼저 부서를 선택해주세요.');
                        return;
                      }
                      setIsPredecessorModalOpen(true);
                    }}>
                      직원 검색
                    </button>
                  ) : (
                    <div className="admin-selected-chip" style={{ marginTop: 0 }}>
                      {formData.predecessor.name} ({formData.predecessor.userId})
                      <button className="rm" onClick={() => { setFormData(p => ({ ...p, predecessor: null })); setPredecessorTouched(true); }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
                      </button>
                    </div>
                  )}
                </div>

                {isEditMode && (
                  <div className="admin-field">
                    <label>재직 상태 *</label>
                    <div className="admin-radio-row">
                      {statusOptions.filter(s => s.key !== 'ALL').map(s => (
                        <div key={s.key} className="admin-radio" onClick={() => setFormData(p => ({ ...p, status: s.key }))}>
                          <input type="radio" name="ufStatus" value={s.key} checked={formData.status === s.key}
                            onChange={() => setFormData(p => ({ ...p, status: s.key }))} readOnly />
                          <span className="dot" />
                          <span>{s.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 안내 패널 */}
              <div className="admin-info-panel">
                <div className="admin-info-panel-title">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
                  안내
                </div>
                {[
                  { label: '계정 생성', desc: '신규 직원의 계정을 생성합니다.' },
                  { label: '부서 배정', desc: '직원이 소속될 부서를 지정합니다.' },
                  { label: '전임자 지정', desc: '전임자를 지정하면 업무 인수인계에 활용됩니다.' },
                ].map(item => (
                  <div key={item.label} className="admin-info-item">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21a8 8 0 1 0-16 0" /><circle cx="12" cy="7" r="4" /></svg>
                    <div><b>{item.label}</b><br />{item.desc}</div>
                  </div>
                ))}
                <div className="admin-info-note">담당 업무(Task)는 계정 생성 후 부서관리 페이지에서 배정됩니다.</div>
              </div>
            </div>

            <div className="modal-footer">
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                <button className="modal-footer-btn" onClick={() => setIsUserFormOpen(false)}>취소</button>
                <button className="btn btn-navy" style={{ padding: '9px 16px' }} onClick={handleFormSave} disabled={createUserMutation.isLoading || updateUserMutation.isLoading}>
                  {isEditMode ? '저장' : '계정 생성'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )
      }

      {
        isPredecessorModalOpen && (
          <EmployeeSearchModal
            onSelect={handleSelectPredecessor}
            onClose={() => setIsPredecessorModalOpen(false)}
            // forceDeptScope를 제거하여 모달 내에서 '전체 부서'를 선택할 수 있도록 하고,
            // currentDept를 전달하여 이전에 선택한 부서를 초기값으로 설정합니다.
            currentDept={departmentsData?.find(d => d.code === formData.dept)?.name}
          />
        )
      }

      {/* 비밀번호 초기화 확인 모달 */}
      {
        isResetPwOpen && resetTarget && (
          <div className="modal-overlay" onClick={closeResetPwModal}>
            <div className="modal-card" style={{ width: 380 }} onClick={(e) => e.stopPropagation()}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--good-soft)', color: 'var(--good)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="10" width="18" height="11" rx="2" /><path d="M7 10V7a5 5 0 0 1 10 0v3" /></svg>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>
                {newTempPassword ? '초기화 완료' : '비밀번호 초기화'}
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', lineHeight: 1.7, marginBottom: 20 }}>
                {newTempPassword ? (
                  <>
                    <b>{resetTarget.name}</b>님의 비밀번호가 초기화되었습니다.<br />
                    새로운 임시 비밀번호는 <b>{newTempPassword}</b>입니다.<br />
                    이 비밀번호는 해당 직원에게 안전하게 전달해 주세요.
                  </>
                ) : (
                  <>
                    <b>{resetTarget.name}</b>님의 비밀번호를 초기화하시겠습니까?<br />
                    초기화 시 임시 비밀번호가 생성되며, 해당 직원은 다음 로그인 시 비밀번호를 변경해야 합니다.
                  </>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                {newTempPassword
                  ? <button className="btn btn-navy" style={{ padding: '9px 16px' }} onClick={closeResetPwModal}>확인</button>
                  : <><button className="modal-footer-btn" onClick={closeResetPwModal}>취소</button><button className="btn btn-navy" style={{ padding: '9px 16px' }} onClick={handleResetPw} disabled={resetPasswordMutation.isLoading}>초기화</button></>}
              </div>
            </div>
          </div>
        )
      }
      {/* 토스트 */}
      {toast && <div key={toast} className="admin-toast">{toast}</div>}

    </div >
  );
}
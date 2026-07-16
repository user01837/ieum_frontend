import React, { useState, useEffect, useRef, useReducer } from 'react';
import { v4 as uuidv4 } from 'uuid';
import './DeptMgmt.css';
import EmployeeSearchModal from '../../components/EmpSearchModal/EmpSearchModal';
import { COMPLAINTS } from '../Petition/data';
import { useDepartmentTasksQuery } from '../../hooks/queries/useTaskQuery';
import { useCreateTaskMutation, useDeleteTaskMutation, useAddAssigneeMutation } from '../../hooks/mutations/useTaskMutation';

// --- Mock Data ---
const MOCK_DATA = {
  '행정복지과': {
    members: [
      { id: 'm1', position: '과장', name: '김철수', isSelf: true },
      { id: 'm2', position: '팀장', name: '이영희', isSelf: false },
      { id: 'm3', position: '주무관', name: '박민수', isSelf: false },
      { id: 'm4', position: '주무관', name: '김하늘', isSelf: false },
    ],
    tasks: [
      { id: 't1', name: '예산 정산 보고서 작성', assignees: ['m2'] },
      { id: 't2', name: '신규 민원 업무 배정', assignees: [] },
    ],
  },
  '도로교통과': {
    members: [
      { id: 'd1', position: '과장', name: '서지훈', isSelf: false },
      { id: 'd2', position: '팀장', name: '한서준', isSelf: false },
    ],
    tasks: [{ id: 'd-t1', name: '교통 신호 체계 개선안 검토', assignees: ['d2'] }],
  },
  '문화도시과': { members: [], tasks: [] },
};
const DEPT_LIST = Object.keys(MOCK_DATA);
const POSITION_RANK = { 과장: 0, 팀장: 1, 주무관: 2 };
const POSITION_CLASSES = ['과장', '팀장', '주무관'];

function getInitials(name) {
  return name.slice(-2);
}

/* =========================================================
   서브 컴포넌트: 팝오버 (외부 클릭으로 닫힘)
   ========================================================= */
function Popover({ open, onClose, children, className = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className={`popover-box ${className}`} ref={ref}>
      {children}
    </div>
  );
}

/* =========================================================
   서브 컴포넌트: 포지션 뱃지
   ========================================================= */
function PosBadge({ position, size = 'md' }) {
  const cls = POSITION_CLASSES.includes(position) ? position : '';
  return (
    <span className={`pos-badge pos-badge--${cls} pos-badge--${size}`}>
      {position}
    </span>
  );
}

/* =========================================================
   서브 컴포넌트: 새로운 대시보드
   ========================================================= */
function NewDashboard({ tasks, members, onOpenUrgentPanel }) {

  // 1. 이번 달 민원
  const currentMonth = new Date().getMonth() + 1;
  const monthlyComplaints = COMPLAINTS.filter(c => {
    const receivedMonth = parseInt(c.received.split('.')[1], 10);
    return receivedMonth === currentMonth;
  });
  const monthlyTotal = monthlyComplaints.length;
  const monthlyWait = monthlyComplaints.filter(c => c.status === 'wait').length;
  const monthlyProgress = monthlyComplaints.filter(c => c.status === 'progress').length;
  const monthlyDone = monthlyComplaints.filter(c => c.status === 'done').length;

  // 2. 처리기한 임박
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const urgentComplaints = COMPLAINTS.filter(c => {
    if (c.status === 'done') return false;
    const deadlineDate = new Date(c.deadline.replace(/\./g, '-'));
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    c.dDay = diffDays; // D-day 정보 추가
    return diffDays >= 0 && diffDays <= 3;
  }).sort((a, b) => a.dDay - b.dDay);

  // 3. Task 현황
  const totalTasks = tasks.length;
  const unassignedTasks = tasks.filter((t) => t.assignees.length === 0).length;
  const allAssignees = new Set(tasks.flatMap(t => t.assignees));
  const unassignedMembers = members.filter(m => !allAssignees.has(m.id)).length;

  return (
    <div className="new-dashboard">
      {/* 이번 달 민원 */}
      <div className="dash-card">
        <div className="dash-card-title">이번 달 민원</div>
        <div className="dash-card-value">{monthlyTotal}<span className="unit">건</span></div>
        <div className="dash-card-sub">
          <span className="status-dot wait"></span>대기 {monthlyWait} &nbsp;
          <span className="status-dot progress"></span>처리 {monthlyProgress} &nbsp;
          <span className="status-dot done"></span>완료 {monthlyDone}
        </div>
      </div>

      {/* 처리기한 임박 */}
      <div className="dash-card urgent-card clickable" onClick={() => onOpenUrgentPanel(urgentComplaints)}>
        <div className="dash-card-title">
          처리기한 임박
        </div>
        <div className="dash-card-value">{urgentComplaints.length}<span className="unit">건</span></div>
      </div>

      {/* Task 현황 */}
      <div className="dash-card">
        <div className="dash-card-title">Task 현황</div>
        <div className="dash-card-main-stats">
          <span>전체 <strong>{totalTasks}</strong></span>
          <span className="divider">·</span>
          <span>미배정 <strong>{unassignedTasks}</strong></span>
        </div>
        <div className="dash-card-sub">
          담당자 없는 직원: <strong>{unassignedMembers}</strong>명
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   서브 컴포넌트: 처리기한 임박 사이드 패널
   ========================================================= */
function UrgentComplaintsPanel({ complaints, onClose }) {
  return (
    <div className="side-panel open">
      <div className="side-panel-header">
        <div className="side-panel-header-top">
          <span className="side-panel-badge">처리기한 임박</span>
          <div className="side-panel-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </div>
        </div>
        <h3 className="side-panel-title">기한이 3일 이하로 남은 민원 목록입니다.</h3>
      </div>
      <div className="side-panel-body">
        {complaints.length > 0 ? (
          complaints.map(c => (
            <div key={c.id} className="urgent-item-in-panel">
              <div className="urgent-item-info">
                <div className="urgent-item-title">{c.title}</div>
                <div className="urgent-item-meta">
                  <span>접수: {c.received}</span>
                  <span className="dotsep">·</span>
                  <span>담당: {c.assignee}</span>
                </div>
              </div>
              <div className="urgent-item-dday">
                D-{c.dDay}
              </div>
            </div>
          ))
        ) : (
          <div className="urgent-empty">기한이 임박한 민원이 없습니다.</div>
        )}
      </div>
      <div className="side-panel-footer">
        <div className="side-panel-action-btn" onClick={() => alert('민원 목록 페이지로 이동합니다.')}>
          전체 민원 목록 보기
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   서브 컴포넌트: 부서원 목록
   ========================================================= */
function MemberPanel({ members, tasks, onHandover }) {
  const [openPopover, setOpenPopover] = useState(null); // memberId | null
  const sorted = [...members].sort(
    (a, b) => (POSITION_RANK[a.position] ?? 99) - (POSITION_RANK[b.position] ?? 99)
  );

  return (
    <div className="card member-panel">
      <div className="panel-title">우리 부서원</div>
      {sorted.map((m) => (
        <div key={m.id} className="member-item">
          <PosBadge position={m.position} />
          <span className="member-name">
            {m.name}
            {m.isSelf && <span className="self-tag">(본인)</span>}
          </span>
          <div className="assign-wrap">
            <button
              className="assign-btn"
              onClick={(e) => {
                e.stopPropagation();
                setOpenPopover(openPopover === m.id ? null : m.id);
              }}
            >
              업무 인계
            </button>
            <Popover
              open={openPopover === m.id}
              onClose={() => setOpenPopover(null)}
              className="assign-popover"
            >
              <div className="popover-label">배정할 Task 선택</div>
              {tasks.length === 0 ? (
                <div className="popover-empty">등록된 Task가 없습니다.</div>
              ) : (
                tasks.map((t) => (
                  <div
                    key={t.id}
                    className="popover-item"
                    onClick={() => {
                      onHandover(t.id, m.id);
                      setOpenPopover(null);
                    }}
                  >
                    {t.assignees.includes(m.id) ? '✓ ' : ''}{t.name}
                  </div>
                ))
              )}
            </Popover>
          </div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   서브 컴포넌트: Task 카드
   ========================================================= */
function TaskCard({ task, members, onRename, onDelete, onRemoveAssignee, onOpenSearchModal }) {
  // onAddAssignee, onOpenSearchModal prop 추가

  return (
    <div className="task-card">
      <div className="task-card-top">
        <div className="task-title-row">
          <span
            className="task-name"
            contentEditable
            suppressContentEditableWarning
          >
            {task.name}
          </span>
        </div>
        <div className="task-actions">
          <button className="icon-btn" onClick={() => onDelete(task.id)} title="삭제">🗑</button>
        </div>
      </div>

      <div className="assignee-row">
        {task.assignees.map((mid) => {
          const m = members.find((mb) => mb.id === mid);
          if (!m) return null;
          return (
            <span key={mid} className="assignee-chip">
              <PosBadge position={m.position} size="sm" />
              {m.name}
              <button className="remove-chip" onClick={() => onRemoveAssignee(task.id, mid)}>ⓧ</button>
            </span>
          );
        })}
        {task.assignees.length === 0 ? (
          <div className="add-assignee-wrap">
            <button className="add-assignee-btn" onClick={() => onOpenSearchModal(task.id)}>+ 담당자 지정</button>
          </div>
        ) : (
          <div className="add-assignee-wrap">
            <button className="add-assignee-btn" onClick={() => onOpenSearchModal(task.id)}>+ 담당자 추가</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   서브 컴포넌트: Task 보드
   ========================================================= */
function TaskPanel({ tasks, members, onRename, onDelete, onAddTask, onAddAssignee, onRemoveAssignee, currentDept }) {
  const [formOpen, setFormOpen] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [modalTaskId, setModalTaskId] = useState(null); // 직원 검색 모달을 제어할 상태
  const inputRef = useRef(null);

  const handleOpenForm = () => {
    setFormOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleConfirm = () => {
    const name = newTaskName.trim();
    if (!name) { inputRef.current?.focus(); return; }
    onAddTask(name);
    setNewTaskName('');
    setFormOpen(false);
  };

  const handleCancel = () => {
    setNewTaskName('');
    setFormOpen(false);
  };

  const handleSelectEmployee = (employee) => {
    if (!modalTaskId || !employee) return;
    onAddAssignee(modalTaskId, employee.userId);
    setModalTaskId(null); // 모달 닫기
  };

  return (
    <div className="card task-panel">
      <div className="task-panel-header">
        <div className="panel-title">Task 보드</div>
        <button className="add-task-btn" onClick={handleOpenForm}>+ 새 Task 추가</button>
      </div>

      {formOpen && (
        <div className="add-task-form">
          <input
            ref={inputRef}
            type="text"
            placeholder="Task명을 입력하세요"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleConfirm(); if (e.key === 'Escape') handleCancel(); }}
          />
          <button className="form-btn primary" onClick={handleConfirm}>추가</button>
          <button className="form-btn" onClick={handleCancel}>취소</button>
        </div>
      )}

      <div className="task-list">
        {tasks.length === 0 ? (
          <div className="empty-tasks">등록된 Task가 없습니다. 새 Task를 추가해보세요.</div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              members={members}
              onRename={onRename}
              onDelete={onDelete}
              onRemoveAssignee={onRemoveAssignee}
              onOpenSearchModal={setModalTaskId}
            />
          ))
        )}
      </div>

      {modalTaskId && (
        <EmployeeSearchModal
          currentDept={currentDept}
          onSelect={handleSelectEmployee}
          onClose={() => setModalTaskId(null)}
          forceDeptScope={true}
        />
      )}
    </div>
  );
}

const tasksReducer = (state, action) => {
  switch (action.type) {
    case 'SET_TASKS':
      return action.payload;
    case 'ADD_TASK':
      return [...state, { id: uuidv4(), name: action.payload, assignees: [] }];
    case 'DELETE_TASK':
      return state.filter((t) => t.id !== action.payload);
    case 'RENAME_TASK':
      if (!action.payload.name) return state;
      return state.map((t) => (t.id === action.payload.id ? { ...t, name: action.payload.name } : t));
    case 'ADD_ASSIGNEE':
      return state.map((t) =>
        t.id === action.payload.taskId && !t.assignees.includes(action.payload.memberId)
          ? { ...t, assignees: [...t.assignees, action.payload.memberId] }
          : t
      );
    case 'REMOVE_ASSIGNEE':
      return state.map((t) =>
        t.id === action.payload.taskId
          ? { ...t, assignees: t.assignees.filter((id) => id !== action.payload.memberId) }
          : t
      );
    case 'HANDOVER_TASK': // 담당자를 한 명으로 교체 (인계)
      return state.map((t) =>
        t.id === action.payload.taskId ? { ...t, assignees: [action.payload.memberId] } : t
      );
    default:
      return state;
  }
};

/* =========================================================
   루트 컴포넌트
   ========================================================= */
function DeptMgmt() {
  const [userRole, setUserRole] = useState('manager'); // 'manager' | 'admin'
  const [selectedDept, setSelectedDept] = useState(DEPT_LIST[0]);
  const [members, setMembers] = useState([]);
  const [tasks, dispatch] = useReducer(tasksReducer, []);
  const { data: tasksData } = useDepartmentTasksQuery();
  const { mutate: createTaskMutate } = useCreateTaskMutation();
  const { mutate: deleteTaskMutate } = useDeleteTaskMutation();
  const { mutate: addAssigneeMutate } = useAddAssigneeMutation();
  const [isUrgentPanelOpen, setIsUrgentPanelOpen] = useState(false);
  const [urgentComplaintsData, setUrgentComplaintsData] = useState([]);

  // 현재 로그인한 사용자의 부서 (과장 역할일 때)
  const myDept = DEPT_LIST[0];

  const currentDeptName = userRole === 'manager' ? myDept : selectedDept;

  // API 호출 시뮬레이션
  useEffect(() => {
    // 실제 애플리케이션에서는 이 부분에 API 호출 코드를 작성합니다.
    // 예: fetch('/api/department/members').then(...)
    const fetchDeptData = () => {
      // 과장은 자기 부서만, 관리자는 선택한 부서의 데이터를 불러옴
      const deptKey = userRole === 'manager' ? myDept : selectedDept;
      const data = MOCK_DATA[deptKey] || { members: [], tasks: [] };

      // 과장일 경우, isSelf 플래그를 동적으로 설정
      const processedMembers =
        userRole === 'manager'
          ? data.members.map((m) => ({
            ...m,
            isSelf: m.position === '과장',
          }))
          : data.members;

      setMembers(processedMembers);
    };

    fetchDeptData();
  }, [userRole, selectedDept, myDept]);

  // 추가-Task만
  useEffect(() => {
    if (tasksData) {
      const converted = tasksData.map((t) => ({
        id: t.taskId,
        name: t.name,
        assignees: t.assignees.map((a) => a.userId),
      }));
      dispatch({ type: 'SET_TASKS', payload: converted });
    }
  }, [tasksData]);

  // ESC 키로 사이드 패널 닫기
  useEffect(() => {
    if (!isUrgentPanelOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsUrgentPanelOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isUrgentPanelOpen]);

  const handleOpenUrgentPanel = (complaints) => {
    setUrgentComplaintsData(complaints);
    setIsUrgentPanelOpen(true);
  };

  const handleHandover = (taskId, memberId) => {
    dispatch({ type: 'HANDOVER_TASK', payload: { taskId, memberId } });
  };

  const handleRename = (taskId, name) => {
    dispatch({ type: 'RENAME_TASK', payload: { id: taskId, name } });
  };

  const handleDelete = (taskId) => {
    const taskToDelete = tasks.find((t) => t.id === taskId);
    if (window.confirm(`'${taskToDelete?.name || '해당'}' Task를 정말 삭제하시겠습니까? \n이 작업은 복구할 수 없습니다.`)) {
      deleteTaskMutate(taskId);
    }
  };

  const handleAddTask = (name) => {
    createTaskMutate({ name });
  };

  const handleAddAssignee = (taskId, memberId) => {
    console.log('handleAddAssignee 호출:', taskId, memberId);
    console.log('addAssigneeMutate:', addAssigneeMutate);
    addAssigneeMutate({ taskId, userId: memberId });
    console.log('addAssigneeMutate 호출 완료');
  };
  const handleRemoveAssignee = (taskId, memberId) => {
    dispatch({ type: 'REMOVE_ASSIGNEE', payload: { taskId, memberId } });
  };

  return (
    <div className={`split-layout ${isUrgentPanelOpen ? 'split-active' : ''}`}>
      <div className="dept-wrap" data-role={userRole}>
        <div className="dept-heading-row">
          <span className="dept-tag">
            {currentDeptName}
          </span>
          {userRole === 'admin' && (
            <select
              className="dept-select"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              {DEPT_LIST.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          )}
        </div>

        <NewDashboard tasks={tasks} members={members} onOpenUrgentPanel={handleOpenUrgentPanel} />
        <div className="mgmt-row">
          <MemberPanel
            members={members}
            tasks={tasks}
            onHandover={handleHandover}
          />
          <TaskPanel
            currentDept={currentDeptName}
            tasks={tasks.sort((a, b) => a.name.localeCompare(b.name))}
            members={members}
            onRename={handleRename}
            onDelete={handleDelete}
            onAddTask={handleAddTask}
            onAddAssignee={handleAddAssignee}
            onRemoveAssignee={handleRemoveAssignee}
          />
        </div>
      </div>
      {isUrgentPanelOpen && (
        <UrgentComplaintsPanel
          complaints={urgentComplaintsData}
          onClose={() => setIsUrgentPanelOpen(false)}
        />
      )}
    </div>
  );
}

export default DeptMgmt;
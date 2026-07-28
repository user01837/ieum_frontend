import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import "./Sidebar.css";
import useAuthStore from '../../store/useAuthStore';
import logo from '../../assets/logo_1.png';

import ChangePasswordModal from './ChangePasswordModal';

function UserActionPopover({ open, onClose, onOpenChangePasswordModal }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="user-popover" ref={ref}>
      <div className="user-popover-item" onClick={onOpenChangePasswordModal}>비밀번호 변경</div>
    </div>
  );
}

function Sidebar() {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const mustChangePassword = useAuthStore((state) => state.mustChangePassword);

  const alertShownRef = useRef(false);
  useEffect(() => {
    // 비밀번호를 강제로 변경해야 할 때, 사용자에게 한 번만 알림을 표시합니다.
    if (mustChangePassword && !alertShownRef.current) {
      alert('보안을 위해 비밀번호를 먼저 변경해주세요.');
      // 알림이 다시 표시되지 않도록 ref 값을 업데이트합니다.
      alertShownRef.current = true;
    }
  }, [mustChangePassword]);

  const handleCloseModal = () => {
    // 비밀번호를 강제로 변경해야 하는 경우에는 모달을 닫을 수 없습니다.
    // 컴포넌트의 상태가 아닌, 스토어의 최신 상태를 직접 읽어와서 확인합니다.
    // 비밀번호 변경 성공 직후 이 함수가 호출될 때, 컴포넌트의 mustChangePassword는 아직 true일 수 있기 때문입니다. (stale state)
    if (useAuthStore.getState().mustChangePassword) {
      return;
    }
    setIsChangePasswordModalOpen(false);
  };
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <img src={logo} alt="이음 로고" />
        </div>

        <div>
          <div className="brand-title">
            공무원 업무지원
            <br />
            공공이음
          </div>
        </div>
      </div>

      <nav className="nav">
        <NavLink to="/petitions" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
          <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" /><path d="M9 9h1M9 13h6M9 17h6" /></svg>
          민원 처리
        </NavLink>

        <NavLink to="/projects" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
          <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>
          사업/프로젝트 기획
        </NavLink>

        <NavLink to="/knowledge" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
          <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0M3 6v13M12 6v13M21 6v13"/></svg>
          지식 베이스
        </NavLink>

        {(user?.system_role_code === '02' || user?.position_code === '01') && (
          <NavLink to="/departments" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
            <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></svg>
            부서 관리
          </NavLink>
        )}

        <NavLink to="/orgchart" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
          <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="2.2" /><circle cx="5" cy="19" r="2.2" /><circle cx="19" cy="19" r="2.2" /><path d="M12 7.2V13m0 0-5.3 4M12 13l5.3 4" /></svg>
          조직도
        </NavLink>

        <div className="nav-divider"></div>

        {user?.system_role_code === '02' && (
          <>
            <div className="nav-admin">
              관리자 메뉴
            </div>
            <NavLink to="/admin" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
              <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82-.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06-.06A1.65 1.65 0 0 0 19.4 9c.14.36.5.9 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" /></svg>
              관리자 페이지
            </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-user">
        <div className="avatar">{user?.name?.charAt(0) || ''}</div>

        <div>
          <div className="user-name">{user?.name || '사용자'} {user?.system_role_code === '02' ? '' : (user?.positionName || '')}</div>
          <div className="user-dept">{user?.deptName || '부서없음'}</div>
        </div>
        <div className="user-actions">
          <button className="kebab-btn" onClick={() => setIsPopoverOpen(p => !p)}>
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path></svg>
          </button>
          <UserActionPopover
            open={isPopoverOpen}
            onClose={() => setIsPopoverOpen(false)}
            onOpenChangePasswordModal={() => {
              setIsPopoverOpen(false);
              setIsChangePasswordModalOpen(true);
            }}
          />
        </div>
      </div>
      {(isChangePasswordModalOpen || mustChangePassword) && (
        <ChangePasswordModal onClose={handleCloseModal} />
      )}
    </aside>
  );
}

export default Sidebar;
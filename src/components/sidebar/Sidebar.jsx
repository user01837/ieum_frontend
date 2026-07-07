import { NavLink } from 'react-router-dom';
import "./Sidebar.css";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">공</div>

        <div>
          <div className="brand-title">
            공무원 업무지원
            <br />
            플랫폼
          </div>
        </div>
      </div>

      <nav className="nav">
        <NavLink to="/petitions" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
          <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z"/><path d="M9 9h1M9 13h6M9 17h6"/></svg>
          민원 처리
        </NavLink>

        <NavLink to="/projects" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
          <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
          사업/프로젝트 기획
        </NavLink>

        <NavLink to="/departments" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
          <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
          부서 관리
        </NavLink>

        <NavLink to="/orgchart" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
          <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="2.2"/><circle cx="5" cy="19" r="2.2"/><circle cx="19" cy="19" r="2.2"/><path d="M12 7.2V13m0 0-5.3 4M12 13l5.3 4"/></svg>
          조직도
        </NavLink>

        <div className="nav-divider"></div>

        <div className="nav-admin">
          관리자 계정 로그인 시에만 노출
        </div>

        <NavLink to="/admin" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")} style={{ opacity: 0.35 }}>
          <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.14.36.5.9 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>
          관리자 페이지
        </NavLink>
      </nav>

      <div className="sidebar-user">
        <div className="avatar">박</div>

        <div>
          <div className="user-name">박주임</div>
          <div className="user-dept">문화도시과</div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
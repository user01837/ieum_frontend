import React from 'react';
import './Header.css';
import { useLogoutMutation } from "../../hooks/mutations/useAuthMutation";
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import NotificationBell from './NotificationBell';

function Header({ title, currentDate }) {
  const { mutate: logoutMutate } = useLogoutMutation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const authLogout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    if (!refreshToken) {
      console.error("Logout impossible: No refresh token found.");
      // 토큰이 없어도 로컬 상태는 정리하고 로그인 페이지로 보냅니다.
      authLogout();
      navigate('/login');
      return;
    }
    logoutMutate(refreshToken, {
      // API 요청의 성공/실패 여부와 관계없이 항상 실행됩니다.
      // 이를 통해 서버와의 통신이 실패하더라도 클라이언트 측에서는 확실하게 로그아웃 처리를 할 수 있습니다.
      onSettled: () => {
        authLogout();
        navigate('/login');
      },
    });
  };

  return (
    <div className="topbar">
      <h1>{title}</h1>
      <div className="topbar-right">
        <NotificationBell />
        <span>안녕하세요, <b>{user?.name || '사용자'}</b>님</span>
        <span>|</span>
        <span>{currentDate}</span>
        <button className="logout-pill" onClick={handleLogout}>로그아웃</button>
      </div>
    </div>
  );
}

export default Header;

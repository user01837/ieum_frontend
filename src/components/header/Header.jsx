import React from 'react';
import './Header.css';
import { useLogoutMutation } from "../../hooks/mutations/useAuthMutation";
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

function Header({ title, userName, currentDate }) {
  const { mutate: logoutMutate } = useLogoutMutation();
  const navigate = useNavigate();
  const authLogout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logoutMutate(undefined, {
      onSuccess: () => {
        authLogout();
        navigate('/login');
      },
      onError: (error) => {
        console.error('Logout failed:', error);
        alert('로그아웃에 실패했습니다. 다시 시도해주세요.');
      }
    });
  };

  return (
    <div className="topbar">
      <h1>{title}</h1>
      <div className="topbar-right">
        <span>안녕하세요, <b>{userName}</b>님</span>
        <span>|</span>
        <span>{currentDate}</span>
        <button className="logout-pill" onClick={handleLogout}>로그아웃</button>
      </div>
    </div>
  );
}

export default Header;

import React from 'react';
import './Header.css';

function Header({ title, userName, currentDate }) {
  return (
    <div className="topbar">
      <h1>{title}</h1>
      <div className="topbar-right">
        <span>안녕하세요, <b>{userName}</b>님</span>
        <span>|</span>
        <span>{currentDate}</span>
        <button className="logout-pill">로그아웃</button>
      </div>
    </div>
  );
}

export default Header;

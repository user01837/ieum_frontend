import React from 'react';
import './StickySideBarButton.css';

// TypeScript interface 부분을 지우고 일반 JavaScript 매개변수 구조로 변경했습니다.
export default function StickySideBarButton({ 
  onClick, 
  label = "노하우 작성하기" 
}) {
  return (
    <div className="sticky-sidebar-container">
      <button className="sticky-sidebar-btn" onClick={onClick} type="button">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="sidebar-icon"
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
        <span className="sidebar-text">{label}</span>
      </button>
    </div>
  );
}
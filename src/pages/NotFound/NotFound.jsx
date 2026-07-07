import React from 'react';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="fullscreen-error-container">
      {/* 상단 헤더 (사이드바가 없으므로 로고를 헤더 왼쪽에 배치) */}
      <header className="error-header">
        <div className="header-logo">
          <div className="logo-icon">공</div>
          <span className="logo-text">공무원 업무지원 플랫폼</span>
        </div>
        <div className="header-user">
          <span>안녕하세요, <strong>박주임님</strong></span>
          <span className="divider">|</span>
          <span className="date">2026년 7월 3일 (금)</span>
          <button className="logout-btn">로그아웃</button>
        </div>
      </header>

      {/* 중앙 404 콘텐츠 영역 */}
      <main className="error-main">
        <div className="error-card">
          <div className="error-visual">
            <span className="error-code">404</span>
            <div className="error-icon-bg">⚠️</div>
          </div>
          
          <h1 className="error-title">요청하신 페이지를 찾을 수 없습니다.</h1>
          <p className="error-description">
            방문하시려는 페이지의 주소가 잘못 입력되었거나,<br />
            페이지의 주소가 변경 혹은 삭제되어 현재 접근할 수 없습니다.
          </p>
          
          <div className="button-group">
            <button 
              className="primary-btn"
              onClick={() => window.location.href = '/'} // 메인(민원 처리)으로 이동
            >
              민원 처리 홈으로 이동
            </button>
            <button 
              className="secondary-btn"
              onClick={() => window.history.back()} // 이전 페이지로 돌아가기
            >
              이전 페이지로 돌아가기
            </button>
          </div>
        </div>
        
        <p className="footer-notice">※ 지속적으로 문제가 발생할 경우 전산관리과로 문의하시기 바랍니다.</p>
      </main>
    </div>
  );
};

export default NotFound;
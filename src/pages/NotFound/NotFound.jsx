import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="fullscreen-error-container">
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
              onClick={() => navigate('/')} // 메인(민원 처리)으로 이동
            >
              공공이음 홈으로 이동
            </button>
            <button 
              className="secondary-btn"
              onClick={() => navigate(-1)} // 이전 페이지로 돌아가기
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
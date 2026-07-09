import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';
import botIcon from '../assets/bot.png';

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const fabRef = useRef(null);

  useEffect(() => {
    // 'Esc' 키를 누르면 챗봇 창을 닫는 함수
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        // 이벤트 버블링과 함께, 현재 요소(window)의 다른 리스너 실행을 즉시 중단합니다.
        event.stopImmediatePropagation();
        setIsOpen(false);
        // 챗봇 버튼에서 포커스를 제거하여 테두리가 생기지 않도록 합니다.
        fabRef.current?.blur();
      }
    };

    // 챗봇 창이 열려 있을 때만 이벤트 리스너를 추가.
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown, true); // 캡처링 단계에서 이벤트를 감지하도록 true 추가
    }

    // 컴포넌트가 언마운트되거나, 챗봇 창이 닫힐 때 이벤트 리스너를 제거.
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true); // 제거할 때도 동일하게 true 추가
    };
  }, [isOpen]); // isOpen 상태가 변경될 때마다 이 useEffect가 다시 실행.

  return (
    <div className="chatbot-container">
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <span>챗봇</span>
            <button className="chatbot-close-btn" onClick={() => setIsOpen(false)}>&times;</button>
          </div>
          <div className="chatbot-body">
            {/* TODO: 채팅 메시지 구현 */}
            <p className="chatbot-greeting">안녕하세요! 무엇을 도와드릴까요?</p>
          </div>
          <div className="chatbot-input-area">
            <input type="text" placeholder="메시지를 입력하세요..." />
            <button>전송</button>
          </div>
        </div>
      )}
      <button ref={fabRef} className="chatbot-fab" onClick={() => setIsOpen(p => !p)}>
        <img src={botIcon} alt="챗봇 열기" />
      </button>
    </div>
  );
}

export default Chatbot;
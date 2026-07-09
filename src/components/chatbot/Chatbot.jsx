import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';
import botIcon from '../../assets/bot.png';

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: '안녕하세요! 무엇을 도와드릴까요?', sender: 'bot' },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const fabRef = useRef(null);
  const messagesEndRef = useRef(null); // 메시지 스크롤을 위한 ref

  useEffect(() => {
    // 'Esc' 키를 누르면 챗봇 창을 닫는 함수
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopImmediatePropagation();
        setIsOpen(false);
        fabRef.current?.blur();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown, true);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen]);

  // 메시지가 업데이트될 때마다 스크롤을 맨 아래로 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (inputMessage.trim() === '') return;

    const newUserMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
    };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setInputMessage('');

    // 더미 챗봇 응답 시뮬레이션 (API 호출 가정)
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: `"${newUserMessage.text}" 에 대한 응답입니다. 현재 챗봇은 개발 중입니다.`,
        sender: 'bot',
      };
      setMessages((prevMessages) => [...prevMessages, botResponse]);
    }, 1000); // 1초 후 응답
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="chatbot-container">
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <span>챗봇</span>
            <button className="chatbot-close-btn" onClick={() => setIsOpen(false)}>&times;</button>
          </div>
          <div className="chatbot-body">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chat-message ${message.sender === 'user' ? 'user' : 'bot'}`}
              >
                {message.text}
              </div>
            ))}
            <div ref={messagesEndRef} /> {/* 자동 스크롤을 위한 빈 div */}
          </div>
          <div className="chatbot-input-area">
            <input
              type="text"
              placeholder="메시지를 입력하세요..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button onClick={handleSendMessage}>전송</button>
          </div>
        </div>
      )}
      <button ref={fabRef} className="chatbot-fab" onClick={() => setIsOpen((p) => !p)}>
        <img src={botIcon} alt="챗봇 열기" />
      </button>
    </div>
  );
}

export default Chatbot;
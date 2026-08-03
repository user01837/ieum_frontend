import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';
import botIcon from '../../assets/bot.png';
import { useLegalChatMutation, useKnowledgeChatMutation } from '../../hooks/mutations/useChatbotMutations';

const MODES = {
  legal: { label: '법률', loadingText: '법률을 찾는중...', placeholder: '법률 관련 질문을 입력하세요...' },
  knowledge: { label: '노하우', loadingText: '노하우를 찾는중...', placeholder: '업무 노하우를 질문해보세요...' },
};

// 참고 법령을 표시하는 서브 컴포넌트
const ReferencedArticles = ({ articles }) => {
  const [expandedIndex, setExpandedIndex] = useState(null); // 확장된 항목의 인덱스를 추적하는 상태

  if (!articles || articles.length === 0) {
    return null;
  }

  const toggleExpand = (index) => {
    // 이미 열려있는 항목을 다시 클릭하면 닫고, 다른 항목을 클릭하면 해당 항목을 엽니다.
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="referenced-articles">
      <p><strong>참고 법령:</strong></p>
      <ul>
        {articles.map((article, index) => (
          <li key={index} className="ref-article-item">
            <div className="ref-article-header" onClick={() => toggleExpand(index)}>
              <span>{article.law_title} 제{article.article_no}조 ({article.article_title})</span>
              <svg className={`ref-article-chevron ${expandedIndex === index ? 'expanded' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
            </div>
            {expandedIndex === index && (
              <div className="ref-article-body">
                <pre className="ref-article-document">{article.document}</pre>
                <a
                  href={`https://www.law.go.kr/LSW/lsSc.do?menuId=1&subMenuId=15&tabMenuId=81&query=${encodeURIComponent(`${article.law_title} 제${article.article_no}조`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ref-article-link"
                >
                  국가법령정보센터에서 보기
                </a>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

// 참고 노하우(지식베이스)를 표시하는 서브 컴포넌트
const ReferencedKnowledge = ({ items }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  if (!items || items.length === 0) {
    return null;
  }

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="referenced-articles">
      <p><strong>참고 노하우:</strong></p>
      <ul>
        {items.map((item, index) => {
          const tagList = (item.tags || '').split(',').map((t) => t.trim()).filter(Boolean);
          return (
            <li key={item.knowledge_id ?? index} className="ref-article-item">
              <div className="ref-article-header" onClick={() => toggleExpand(index)}>
                <span>{item.title}</span>
                <svg className={`ref-article-chevron ${expandedIndex === index ? 'expanded' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
              </div>
              {expandedIndex === index && (
                <div className="ref-article-body">
                  {item.summary && <p className="ref-knowledge-summary">{item.summary}</p>}
                  <pre className="ref-article-document">{item.content}</pre>
                  {item.warning_note && (
                    <p className="ref-knowledge-warning">⚠ {item.warning_note}</p>
                  )}
                  {tagList.length > 0 && (
                    <div className="ref-knowledge-tags">
                      {tagList.map((tag) => (
                        <span key={tag} className="ref-knowledge-tag">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

function Chatbot({ compact = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('legal'); // 'legal' | 'knowledge'
  const [messages, setMessages] = useState([
    { id: 1, text: '안녕하세요! 상단에서 모드를 선택해 법률 또는 업무 노하우에 대해 질문해 보세요.', sender: 'bot' },
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

  const replaceLoadingWith = (message) => {
    setMessages((prevMessages) => [
      ...prevMessages.filter((m) => m.id !== 'loading'),
      message,
    ]);
  };

  const handleError = (error) => {
    replaceLoadingWith({
      id: Date.now(),
      text: `죄송합니다, 오류가 발생했습니다. 잠시 후 다시 시도해주세요. (에러: ${error.response?.data?.detail || error.message})`,
      sender: 'bot',
      isError: true,
    });
  };

  const legalChatMutation = useLegalChatMutation({
    onSuccess: (data) => {
      replaceLoadingWith({
        id: Date.now(),
        text: data.answer,
        sender: 'bot',
        referenced_articles: data.referenced_articles,
      });
    },
    onError: handleError,
  });

  const knowledgeChatMutation = useKnowledgeChatMutation({
    onSuccess: (data) => {
      replaceLoadingWith({
        id: Date.now(),
        text: data.answer,
        sender: 'bot',
        referenced_knowledge: data.referenced_knowledge,
      });
    },
    onError: handleError,
  });

  const isPending = legalChatMutation.isPending || knowledgeChatMutation.isPending;

  const handleSendMessage = () => {
    if (inputMessage.trim() === '' || isPending) return;

    const newUserMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
    };

    // 로딩 메시지를 미리 추가합니다 (현재 모드에 맞는 문구로).
    const loadingMessage = {
      id: 'loading', // 고유 ID로 로딩 메시지를 식별합니다.
      sender: 'bot',
      type: 'loading', // 렌더링 시 로딩 상태임을 구분하기 위한 타입
      loadingText: MODES[mode].loadingText,
    };

    setMessages((prevMessages) => [...prevMessages, newUserMessage, loadingMessage]);
    const question = inputMessage;
    setInputMessage('');

    if (mode === 'legal') {
      legalChatMutation.mutate({ question });
    } else {
      knowledgeChatMutation.mutate({ question });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      handleSendMessage();
    }
  };

  return (
    <div className={`chatbot-container ${compact ? 'compact' : ''}`}>
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <span>챗봇</span>
            <button className="chatbot-close-btn" onClick={() => setIsOpen(false)}>&times;</button>
          </div>
          <div className="chatbot-mode-tabs">
            {Object.entries(MODES).map(([key, { label }]) => (
              <button
                key={key}
                type="button"
                className={`chatbot-mode-tab ${mode === key ? 'active' : ''}`}
                onClick={() => setMode(key)}
                disabled={isPending}
              >
                {key === 'legal' ? '⚖️' : '💡'} {label}
              </button>
            ))}
          </div>
          <div className="chatbot-body">
            {messages.map((message) => {
              // 메시지 타입이 'loading'이면 로딩 인디케이터를 렌더링합니다.
              if (message.type === 'loading') {
                return (
                  <div key={message.id} className="chat-message bot">
                    <div className="loading-wrapper">
                      <div className="typing-indicator">
                        <span></span><span></span><span></span>
                      </div>
                      <span>{message.loadingText}</span>
                    </div>
                  </div>
                );
              }
              // 그 외의 경우 일반 메시지를 렌더링합니다.
              return (
                <div
                  key={message.id}
                  className={`chat-message ${message.sender === 'user' ? 'user' : 'bot'} ${message.isError ? 'error' : ''}`}
                >
                  {message.text}
                  {message.referenced_articles && <ReferencedArticles articles={message.referenced_articles} />}
                  {message.referenced_knowledge && <ReferencedKnowledge items={message.referenced_knowledge} />}
                </div>
              );
            })}
            <div ref={messagesEndRef} /> {/* 자동 스크롤을 위한 빈 div */}
          </div>
          <div className="chatbot-input-area">
            <input
              type="text"
              placeholder={MODES[mode].placeholder}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isPending}
            />
            <button onClick={handleSendMessage} disabled={isPending}>전송</button>
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

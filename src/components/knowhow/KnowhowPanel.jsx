import React, { useState, useRef, useEffect } from 'react';
import useKnowledgeMemo from './knowhow';
import './KnowhowPanel.css';
import '../../pages/Petition/Petition_list.css'; // 공용 드롭다운 스타일

function KnowhowPanel({ onClose }) {
  const {
    isLoadingList,
    existingCards,
    selectedCardId,
    setSelectedCardId,
    newCardTitle,
    setNewCardTitle,
    tags,
    newTagInput,
    isLoadingTags,
    setNewTagInput,
    currentFilter,
    setCurrentFilter,
    memoText,
    setMemoText,
    filteredLogs,
    toggleTag,
    addTag,
    handleSave,
    logs, // logs를 hook에서 가져옵니다.
  } = useKnowledgeMemo();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <div className="kh-header">
        <h3>노하우 작성 & 확인</h3>
        <button className="kh-close-btn" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>
      </div>
      <div className="kh-body">
        <div className="kh-section">
          <div className="kh-label">지식베이스 선택</div>
          <div className={`dropdown-wrap ${isDropdownOpen ? "open" : ""}`} ref={dropdownRef}>
            <div className="dropdown" onClick={() => setIsDropdownOpen(p => !p)}>
              <span>
                {selectedCardId === 'new' 
                  ? '새 지식베이스 만들기...' 
                  : existingCards.find(c => c.id === selectedCardId)?.title || '지식베이스 선택...'}
              </span>
              <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
            </div>
            <div className="dropdown-menu">
              {isLoadingList ? (
                <div className="dropdown-item">목록 로딩 중...</div>
              ) : (
                <>
                  {existingCards.map(card => (
                    <div key={card.id} className={`dropdown-item ${selectedCardId === card.id ? 'active' : ''}`} onClick={() => { setSelectedCardId(card.id); setIsDropdownOpen(false); }}>
                      {card.title}
                    </div>
                  ))}
                  <div className="dropdown-divider"></div>
                  <div className={`dropdown-item ${selectedCardId === 'new' ? 'active' : ''}`} onClick={() => { setSelectedCardId('new'); setIsDropdownOpen(false); }}>
                    + 새 지식베이스 만들기...
                  </div>
                </>
              )}
            </div>
          </div>
          {selectedCardId === 'new' && (
            <input
              type="text"
              className="kh-input"
              placeholder="새 지식베이스 제목 입력"
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              style={{ marginTop: '8px' }}
            />
          )}
        </div>
        <div className="kh-section">
          <div className="kh-label">태그 선택</div>
          <div className="kh-tags">
            {isLoadingTags ? (
              <div>태그 로딩 중...</div>
            ) : (
              tags.map((tag) => (
                <button
                  key={tag.id}
                  className={`kh-tag ${tag.active ? 'active' : ''}`}
                  onClick={() => toggleTag(tag.id)}
                >
                  {tag.name}
                </button>
              ))
            )}
          </div>
          <div className="kh-new-tag">
            <input
              type="text"
              placeholder="새 태그 추가"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTag()}
            />
            <button onClick={addTag}>+</button>
          </div>
        </div>

        <div className="kh-section">
          <div className="kh-label">노하우 작성</div>
          <textarea
            className="kh-textarea"
            placeholder="공유할 노하우를 작성해주세요."
            value={memoText}
            onChange={(e) => setMemoText(e.target.value)}
          ></textarea>
        </div>

        {selectedCardId && selectedCardId !== 'new' ? (
          <div className="kh-section">
            <div className="kh-label">이전 로그</div>
            <div className="kh-log-filter">
              <button className={currentFilter === 'all' ? 'active' : ''} onClick={() => setCurrentFilter('all')}>전체</button>
              {/* 로그에 존재하는 태그만 필터 버튼으로 표시 */}
              {[...new Set(logs.map(log => log.tag))].map((tag, index) => (
                <button key={index} className={currentFilter === tag ? 'active' : ''} onClick={() => setCurrentFilter(tag)}>{tag}</button>
              ))}
            </div>
            <div className="kh-logs">
              {filteredLogs.length > 0 ? filteredLogs.map(log => (
                <div key={log.id} className="kh-log-item">
                  <div className="kh-log-meta">
                    <span>{log.date}</span>
                    <span>{log.author}</span>
                    <span className="kh-log-tag">{log.tag}</span>
                  </div>
                  <div className="kh-log-body">{log.body}</div>
                </div>
              )) : <div style={{textAlign: 'center', padding: '20px 0', fontSize: '12px', color: 'var(--ink-tertiary)'}}>로그가 없습니다.</div>}
            </div>
          </div>
        ) : (
          <div className="kh-info-box">
            기존 지식베이스를 선택하면<br />이전에 작성된 노하우를 확인할 수 있습니다.
          </div>
        )}
      </div>
      <div className="kh-footer">
        <button className="btn-save" onClick={handleSave}>저장</button>
      </div>
    </>
  );
}

export default KnowhowPanel;
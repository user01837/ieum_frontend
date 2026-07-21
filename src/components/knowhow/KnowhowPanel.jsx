import React from 'react';
import useKnowledgeMemo from './knowhow';
import './KnowhowPanel.css';

function KnowhowPanel({ onClose }) {
  const {
    cardMode,
    setCardMode,
    existingCards,
    selectedCardId,
    setSelectedCardId,
    newCardTitle,
    setNewCardTitle,
    tags,
    newTagInput,
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

  return (
    <>
      <div className="kh-header">
        <h3>노하우 작성</h3>
        <button className="kh-close-btn" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>
      </div>
      <div className="kh-body">
        <div className="kh-section">
          <div className="kh-label">어떤 지식 베이스에 추가할까요?</div>
          <div className="kh-card-mode-btns">
            <button
              type="button"
              className={`kh-mode-btn ${cardMode === 'existing' ? 'active' : ''}`}
              onClick={() => setCardMode('existing')}
            >
              기존 지식베이스에 추가
            </button>
            <button
              type="button"
              className={`kh-mode-btn ${cardMode === 'new' ? 'active' : ''}`}
              onClick={() => setCardMode('new')}
            >
              새 지식 베이스 만들기
            </button>
          </div>
          {cardMode === 'existing' ? (
            <select
              className="kh-select"
              value={selectedCardId}
              onChange={(e) => setSelectedCardId(e.target.value)}
            >
              <option value="">지식베이스 선택...</option>
              {existingCards.map(card => (
                <option key={card.id} value={card.id}>{card.title}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              className="kh-input"
              placeholder="새 지식베이스 제목 입력"
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
            />
          )}
        </div>
        <div className="kh-section">
          <div className="kh-label">태그 선택</div>
          <div className="kh-tags">
            {tags.map((tag, index) => (
              <button
                key={index}
                className={`kh-tag ${tag.active ? 'active' : ''}`}
                onClick={() => toggleTag(index)}
              >
                {tag.name}
              </button>
            ))}
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
      </div>
      <div className="kh-footer">
        <button className="btn-save" onClick={handleSave}>저장</button>
      </div>
    </>
  );
}

export default KnowhowPanel;
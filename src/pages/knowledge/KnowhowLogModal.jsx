import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './KnowhowLogModal.css'; // 기존 CSS 재사용

function KnowhowLogModal({ logToEdit, existingTags, onClose, onSave }) {
    const isEditMode = !!logToEdit;

    const [selectedTag, setSelectedTag] = useState('');
    const [newTag, setNewTag] = useState('');
    const [memo, setMemo] = useState('');

    useEffect(() => {
        if (isEditMode) {
            // 수정 모드: 폼 데이터 미리 채우기
            if (existingTags.includes(logToEdit.tag)) {
                setSelectedTag(logToEdit.tag);
                setNewTag('');
            } else {
                setSelectedTag('');
                setNewTag(logToEdit.tag);
            }
            setMemo(logToEdit.content);
        } else {
            // 추가 모드: 폼 초기화
            setSelectedTag('');
            setNewTag('');
            setMemo('');
        }
    }, [logToEdit, isEditMode, existingTags]);

    const handleSave = () => {
        const tagToSave = newTag.trim() || selectedTag;
        if (!tagToSave) {
            alert('태그를 선택하거나 새로 입력해주세요.');
            return;
        }
        if (!memo.trim()) {
            alert('노하우 내용을 입력해주세요.');
            return;
        }

        if (isEditMode) {
            // 수정 모드일 경우, ID를 포함한 전체 로그 객체를 전달
            onSave({ ...logToEdit, tag: tagToSave, content: memo });
        } else {
            // 추가 모드일 경우, 태그와 내용만 전달
            onSave({ tag: tagToSave, body: memo });
        }
    };

    return ReactDOM.createPortal(
        <div className="dk-modal-overlay" onClick={onClose}>
            <div className="dk-modal" onClick={e => e.stopPropagation()}>
                <div className="dk-modal-header">
                    <h3>{isEditMode ? '노하우 로그 수정' : '노하우 로그 추가'}</h3>
                    <button className="dk-modal-close-btn" onClick={onClose}>&times;</button>
                </div>
                <div className="dk-modal-body">
                    <div className="dk-form-group">
                        <label>태그</label>
                        <div className="dk-tag-select">
                            {existingTags.map(tag => (
                                <button key={tag} className={`dk-tag-btn ${selectedTag === tag ? 'active' : ''}`} onClick={() => { setSelectedTag(prev => prev === tag ? '' : tag); setNewTag(''); }}>
                                    {tag}
                                </button>
                            ))}
                        </div>
                        <input type="text" placeholder="또는 새 태그 입력" value={newTag} onChange={e => { setNewTag(e.target.value); setSelectedTag(''); }} />
                    </div>
                    <div className="dk-form-group">
                        <label>내용</label>
                        <textarea placeholder="공유할 노하우를 작성해주세요." value={memo} onChange={e => setMemo(e.target.value)}></textarea>
                    </div>
                </div>
                <div className="dk-modal-footer">
                    <button className="dk-modal-btn" onClick={onClose}>취소</button>
                    <button className="dk-modal-btn primary" onClick={handleSave}>
                        {isEditMode ? '수정 완료' : '저장'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

export default KnowhowLogModal;
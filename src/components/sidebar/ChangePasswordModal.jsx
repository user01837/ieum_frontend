import React, { useState } from 'react';
import './ChangePasswordModal.css';

/**
 * 비밀번호 변경 모달
 * @param {function} onClose - 모달 닫기 콜백
 * @param {function} onConfirm - 확인 버튼 클릭 시 콜백
 */
function ChangePasswordModal({ onClose, onConfirm }) {
  const [id, setId] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!id) newErrors.id = '아이디를 입력해주세요.';
    if (!currentPassword) newErrors.currentPassword = '현재 비밀번호를 입력해주세요.';
    if (!newPassword) {
      newErrors.newPassword = '새 비밀번호를 입력해주세요.';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = '비밀번호는 8자 이상이어야 합니다.';
    } else if (newPassword === currentPassword) {
      newErrors.newPassword = '현재 비밀번호와 다른 비밀번호를 사용해주세요.';
    }
    if (!confirmNewPassword) {
      newErrors.confirmNewPassword = '새 비밀번호를 다시 한번 입력해주세요.';
    } else if (newPassword && newPassword !== confirmNewPassword) {
      newErrors.confirmNewPassword = '새 비밀번호가 일치하지 않습니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (validate()) {
      // 실제 API 호출 로직
      console.log('비밀번호 변경 API 호출:', { id, currentPassword, newPassword });
      alert('비밀번호가 성공적으로 변경되었습니다.');
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container" role="dialog" aria-modal="true" style={{ width: '400px' }}>
        <div className="modal-header">
          <div>
            <p className="modal-title">비밀번호 변경</p>
            <p className="modal-subtitle">
              계정 정보를 입력하고 새 비밀번호를 설정하세요.
            </p>
          </div>
          <button aria-label="닫기" className="modal-close-btn" onClick={onClose}>
            <i className="ti ti-x ic" aria-hidden="true"></i>
          </button>
        </div>

        <div className="pw-change-form">
          <div className="pw-field">
            <label htmlFor="pw-id">아이디</label>
            <input
              id="pw-id"
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className={errors.id ? 'error' : ''}
            />
            {errors.id && <p className="error-message">{errors.id}</p>}
          </div>

          <div className="pw-field">
            <label htmlFor="pw-current">현재 비밀번호</label>
            <input
              id="pw-current"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={errors.currentPassword ? 'error' : ''}
            />
            {errors.currentPassword && <p className="error-message">{errors.currentPassword}</p>}
          </div>

          <div className="pw-field">
            <label htmlFor="pw-new">새 비밀번호</label>
            <input
              id="pw-new"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={errors.newPassword ? 'error' : ''}
            />
            {errors.newPassword && <p className="error-message">{errors.newPassword}</p>}
          </div>

          <div className="pw-field">
            <label htmlFor="pw-confirm">새 비밀번호 확인</label>
            <input
              id="pw-confirm"
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className={errors.confirmNewPassword ? 'error' : ''}
            />
            {errors.confirmNewPassword && <p className="error-message">{errors.confirmNewPassword}</p>}
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-footer-btn" onClick={onClose}>취소</button>
          <button className="modal-footer-btn primary" onClick={handleConfirm}>확인</button>
        </div>
      </div>
    </div>
  );
}

export default ChangePasswordModal;
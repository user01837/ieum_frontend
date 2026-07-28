import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './ChangePasswordModal.css';
import { useChangePasswordMutation } from '../../hooks/mutations/useAuthMutation';
import useAuthStore from '../../store/useAuthStore';

/**
 * 비밀번호 변경 모달
 * @param {function} onClose - 모달 닫기 콜백
 */
function ChangePasswordModal({ onClose }) {
  const user = useAuthStore((state) => state.user);
  const mustChangePassword = useAuthStore((state) => state.mustChangePassword);
  const setMustChangePassword = useAuthStore((state) => state.setMustChangePassword);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [errors, setErrors] = useState({});

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const { mutate: changePasswordMutate, isPending } = useChangePasswordMutation();

  const validate = () => {
    const newErrors = {};
    if (!user?.userId) newErrors.id = '사용자 정보를 불러올 수 없습니다.';
    if (!currentPassword) newErrors.currentPassword = '현재 비밀번호를 입력해주세요.';
    if (!newPassword) {
      newErrors.newPassword = '새 비밀번호를 입력해주세요.';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/.test(newPassword)) {
      newErrors.newPassword = '비밀번호는 영문 대소문자, 숫자, 특수문자를 포함하여 8자 이상이어야 합니다.';
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
      changePasswordMutate({ currentPassword, newPassword }, {
        onSuccess: () => {
          alert('비밀번호가 성공적으로 변경되었습니다.');
          // 비밀번호 변경 필요 상태를 false로 업데이트합니다.
          setMustChangePassword(false);
          onClose();
        },
        onError: (error) => {
          // 401: 현재 비밀번호 불일치, 422: 유효성 검사 실패 등
          const errorMessage = error.response?.data?.detail || '비밀번호 변경에 실패했습니다. 다시 시도해주세요.';
          alert(errorMessage);
        },
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // 폼 제출 시 페이지가 새로고침되는 것을 방지합니다.
    handleConfirm();
  };

  // 포탈(Portal)을 사용하여 모달을 document.body의 최상단에 렌더링합니다.
  // 이렇게 하면 사이드바의 z-index 스태킹 컨텍스트(stacking context) 문제와 상관없이
  // 모달이 항상 다른 모든 UI 요소 위에 표시됩니다.
  return ReactDOM.createPortal(
    <div className="modal-overlay force-change-pw-overlay" onClick={onClose}>
      <form className="modal-container" role="dialog" aria-modal="true" style={{ width: '400px' }} onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="modal-title">비밀번호 변경</p>
            <p className="modal-subtitle">
              새 비밀번호는 영문 대소문자, 숫자, 특수문자를 포함하여 8자 이상이어야 합니다.
            </p>
          </div>
          {
            !mustChangePassword && (
              <button type="button" aria-label="닫기" className="modal-close-btn" onClick={onClose}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3"><path d="M18 6 6 18M6 6l12 12" /></svg>
                <i className="ti ti-x ic" aria-hidden="true"></i>
              </button>
            )
          }
        </div>

        <div className="pw-change-form">
          <div className="pw-field">
            <label htmlFor="pw-id">아이디</label>
            <input
              id="pw-id"
              type="text"
              value={user?.userId || ''}
              readOnly
              disabled
              className={errors.id ? 'error' : ''} // 에러 스타일은 유지
            />
            {errors.id && <p className="error-message">{errors.id}</p>}
          </div>

          <div className="pw-field">
            <label htmlFor="pw-current">현재 비밀번호</label>
            <div className="pw-input-wrap">
              <input
                id="pw-current"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={errors.currentPassword ? 'error' : ''}
              />
              <button type="button" className="pw-toggle-eye" onClick={() => setShowCurrentPassword(p => !p)}>
                {showCurrentPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <line x1="2" x2="22" y1="2" y2="22" />
                  </svg>
                )}
              </button>
            </div>
            {errors.currentPassword && <p className="error-message">{errors.currentPassword}</p>}
          </div>

          <div className="pw-field">
            <label htmlFor="pw-new">새 비밀번호</label>
            <div className="pw-input-wrap">
              <input
                id="pw-new"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={errors.newPassword ? 'error' : ''}
              />
              <button type="button" className="pw-toggle-eye" onClick={() => setShowNewPassword(p => !p)}>
                {showNewPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <line x1="2" x2="22" y1="2" y2="22" />
                  </svg>
                )}
              </button>
            </div>
            {errors.newPassword && <p className="error-message">{errors.newPassword}</p>}
          </div>

          <div className="pw-field">
            <label htmlFor="pw-confirm">새 비밀번호 확인</label>
            <div className="pw-input-wrap">
              <input
                id="pw-confirm"
                type={showConfirmNewPassword ? 'text' : 'password'}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className={errors.confirmNewPassword ? 'error' : ''}
              />
              <button type="button" className="pw-toggle-eye" onClick={() => setShowConfirmNewPassword(p => !p)}>
                {showConfirmNewPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <line x1="2" x2="22" y1="2" y2="22" />
                  </svg>
                )}
              </button>
            </div>
            {errors.confirmNewPassword && <p className="error-message">{errors.confirmNewPassword}</p>}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="modal-footer-btn" onClick={onClose} disabled={mustChangePassword}>취소</button>
          <button type="submit" className="modal-footer-btn primary" disabled={isPending || !user}>
            {isPending ? '변경 중...' : '확인'}
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}

export default ChangePasswordModal;
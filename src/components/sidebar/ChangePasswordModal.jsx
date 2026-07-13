import React, { useState } from 'react';
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

  const { mutate: changePasswordMutate, isPending } = useChangePasswordMutation();

  const validate = () => {
    const newErrors = {};
    if (!user?.userId) newErrors.id = '사용자 정보를 불러올 수 없습니다.';
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

  return (
    <div className="modal-overlay">
      <form className="modal-container" role="dialog" aria-modal="true" style={{ width: '400px' }} onSubmit={handleSubmit}>
        <div className="modal-header">
          <div>
            <p className="modal-title">비밀번호 변경</p>
            <p className="modal-subtitle">
              계정 정보를 입력하고 새 비밀번호를 설정하세요.
            </p>
          </div>
          <button type="button" aria-label="닫기" className="modal-close-btn" onClick={onClose} disabled={mustChangePassword}>
            <i className="ti ti-x ic" aria-hidden="true"></i>
          </button>
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
          <button type="button" className="modal-footer-btn" onClick={onClose} disabled={mustChangePassword}>취소</button>
          <button type="submit" className="modal-footer-btn primary" disabled={isPending || !user}>
            {isPending ? '변경 중...' : '확인'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChangePasswordModal;
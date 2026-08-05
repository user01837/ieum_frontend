import api from './axios';

/**
 * 로그인 요청 API
 * @param {{ empId: string, password: string, deptCode: string }} data - 로그인 데이터 (사원 ID, 비밀번호, 부서 코드)
 */
export const login = data => {
  // 백엔드 API가 기대하는 형식으로 데이터 변환
  // 프론트엔드 (empId, deptCode) -> 백엔드 (userId, department_code)
  const requestData = {
    userId: data.empId,
    password: data.password,
    department_code: data.deptCode,
  };

  return api.post('/auth/login', requestData);
};

/**
 * 로그아웃 요청 API
 */
export const logout = (refreshToken) => {
  // 서버에 로그아웃을 요청합니다. 성공 시 204 No Content를 반환합니다.
  // 백엔드는 body에 refreshToken을 담아 보내는 것을 기대합니다.
  return api.post('/auth/logout', { refreshToken });
};

/**
 * 현재 로그인된 사용자 정보 조회 API
 */
export const getMe = () => {
  return api.get('/auth/me'); // 백엔드에 해당 엔드포인트가 필요합니다.
};

/**
 * 비밀번호 변경 API
 * @param {{ currentPassword, newPassword }} data - 현재 비밀번호, 새 비밀번호
 */
export const changePassword = (data) => {
  const requestData = {
    oldPassword: data.currentPassword,
    newPassword: data.newPassword,
  };
  return api.post('/auth/password', requestData);
};

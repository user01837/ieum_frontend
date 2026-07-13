import api from './axios';

/**
 * 로그인 요청 API
 * @param {{ empId: string, password: string, deptName: string }} data - 로그인 데이터 (사원 ID, 비밀번호, 부서명)
 */
export const login = data => {
  console.log('Login attempt with:', data);

  // 백엔드 API가 기대하는 형식으로 데이터 변환
  // 프론트엔드 (empId, deptName) -> 백엔드 (userId, position_code)
  const requestData = {
    userId: data.empId,
    password: data.password,
    position_code: data.deptName,
  };

  console.log('Sending login request to backend with:', requestData);
  return api.post('/auth/login', requestData);
};

/**
 * [더미] 로그아웃 요청 API
 */
export const logout = () => {
  console.log('Dummy logout attempt');
  // 기존 실제 API 호출 코드 (주석 처리)
  // return api.post('/auth/logout');

  // 더미 데이터를 반환하는 Promise를 생성합니다.
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        data: { message: 'Logout successful' },
      });
    }, 300); // 0.3초 딜레이
  });
};

/**
 * 현재 로그인된 사용자 정보 조회 API
 */
export const getMe = () => {
  return api.get('/auth/me'); // 백엔드에 해당 엔드포인트가 필요합니다.
};

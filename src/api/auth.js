import api from './axios';

/**
 * [더미] 로그인 요청 API
 * @param {{ empId: string, password, deptName: string }} data - 로그인 데이터 (사원 ID, 비밀번호, 부서명)
 */
export const login = data => {
  console.log('Dummy login attempt with:', data);
  // // 기존 실제 API 호출 코드 (주석 처리)
  // return api.post('/auth/login', data);

  // 더미 데이터를 반환하는 Promise를 생성합니다.
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        data: {
          user: {
            id: 1,
            name: '홍길동',
            empId: data.empId,
            deptName: data.deptName,
            profileImg: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
            role: 'ROLE_USER',
          },
          accessToken: 'dummy-access-token-for-testing',
        },
      });
    }, 500); // 0.5초 딜레이
  });
};

/**
 * [더미] 로그아웃 요청 API
 */
export const logout = () => {
  console.log('Dummy logout attempt');
  // // 기존 실제 API 호출 코드 (주석 처리)
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

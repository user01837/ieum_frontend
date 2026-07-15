import api from './axios';

/**
 * 관리자용 직원 목록 조회 API
 * @param {object} params - 쿼리 파라미터
 * @param {string} [params.departmentCode] - 부서 코드
 * @param {string} [params.status] - 재직 상태 코드
 * @param {string} [params.keyword] - 검색 키워드
 * @param {number} params.page - 페이지 번호
 * @param {number} params.size - 페이지 크기
 */
export const getUsers = async (params) => {
  const { data } = await api.get('/admin/users', { params });
  return data;
};

/**
 * 신규 직원 생성 API (플레이스홀더)
 * @param {object} userData - 생성할 직원 정보
 */
export const createUser = async (userData) => {
  console.log('Creating user (placeholder):', userData);
  // 실제 API 연동 시 아래 주석 해제
  // const { data } = await api.post('/admin/users', userData);
  // return data;
  return Promise.resolve({ message: '신규 직원이 등록되었습니다.' });
};

/**
 * 직원 정보 수정 API (플레이스홀더)
 * @param {object} param
 * @param {string} param.userId - 수정할 직원 ID
 * @param {object} param.userData - 수정할 직원 정보
 */
export const updateUser = async ({ userId, userData }) => {
  console.log(`Updating user ${userId} (placeholder):`, userData);
  // 실제 API 연동 시 아래 주석 해제
  // const { data } = await api.put(`/admin/users/${userId}`, userData);
  // return data;
  return Promise.resolve({ message: '직원 정보가 수정되었습니다.' });
};

/**
 * 직원 비밀번호 초기화 API (플레이스홀더)
 * @param {string} userId - 비밀번호를 초기화할 직원 ID
 */
export const resetPassword = async (userId) => {
  console.log(`Resetting password for user ${userId} (placeholder)`);
  // 실제 API 연동 시 아래 주석 해제
  // const { data } = await api.post(`/admin/users/${userId}/reset-password`);
  // return data;
  return Promise.resolve({ message: '비밀번호가 초기화되었습니다.' });
};
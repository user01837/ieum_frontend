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
 * 신규 직원 생성 API
 * @param {object} userData - 생성할 직원 정보
 */
export const createUser = async (userData) => {
  // 백엔드 API와 연동합니다.
  const { data } = await api.post('/admin/users', userData);
  return data;
};

/**
 * 직원 정보 수정 API
 * @param {object} param
 * @param {string} param.userId - 수정할 직원 ID
 * @param {object} param.userData - 수정할 직원 정보
 */
export const updateUser = async ({ userId, userData }) => {
  const { data } = await api.patch(`/admin/users/${userId}`, userData);
  return data;
};

/**
 * 직원 비밀번호 초기화 API
 * @param {string} userId - 비밀번호를 초기화할 직원 ID
 */
export const resetPassword = async (userId) => {
  const { data } = await api.post(`/admin/users/${userId}/reset-password`);
  return data;
};

/**
 * 관리자 대시보드 통계 조회 API
 */
export const getAdminStats = async () => {
  const { data } = await api.get('/admin/stats');
  return data;
};
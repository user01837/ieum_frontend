import api from './axios';

/**
 * 민원 목록 조회 API
 * @param {object} params - 쿼리 파라미터
 * @param {string} params.scope - 조회 범위
 * @param {string} params.status - 민원 상태
 * @param {number} params.page - 페이지 번호
 * @param {number} params.size - 페이지 크기
 * @param {number|null} params.taskId - Task ID
 * @param {string|null} params.sort - 정렬 옵션
 */
export const getPetitions = async (params) => {
  const { data } = await api.get('/petitions', { params });
  return data;
};
import api from './axios';

/**
 * 지식베이스 목록을 조회하는 API
 * @param {object} params - 쿼리 파라미터
 * @param {string|null} params.category_code - 카테고리 코드
 * @param {string|null} params.scope_code - 공개 범위 코드
 * @param {string|null} params.keyword - 검색어
 * @param {number} params.page - 페이지 번호 (0부터 시작)
 * @param {number} params.size - 페이지당 항목 수
 */
export const getKnowledgeList = async (params) => {
  const response = await api.get('/api/knowledge', { params });
  return response.data;
};
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

/**
 * 지식베이스 상세 정보를 조회하는 API
 * @param {number} knowledgeId - 지식베이스 ID
 */
export const getKnowledgeDetail = async (knowledgeId) => {
  const response = await api.get(`/api/knowledge/${knowledgeId}`);
  return response.data;
};

/**
 * 지식베이스를 수정하는 API
 * @param {object} payload
 * @param {number} payload.knowledgeId - 지식베이스 ID
 * @param {object} payload.data - 수정할 데이터 (e.g., { summary, warning_note })
 * @returns
 */
export const updateKnowledge = async ({ knowledgeId, data }) => {
  // PUT 요청 시에는 data를 요청 본문에 직접 전달합니다.
  const response = await api.put(`/api/knowledge/${knowledgeId}`, data);
  return response.data;
};
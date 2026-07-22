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
 * @param {object|FormData} payload.data - 수정할 데이터
 * @returns
 */
export const updateKnowledge = async ({ knowledgeId, data }) => {
  const isFormData = data instanceof FormData;
  const headers = isFormData ? { 'Content-Type': 'multipart/form-data' } : {};

  // 백엔드에서 PUT/PATCH 요청 시 FormData를 처리할 수 있도록 구현이 필요합니다.
  const response = await api.patch(`/api/knowledge/${knowledgeId}`, data, { headers });
  return response.data;
};

/**
 * 새 지식베이스를 생성하는 API
 * @param {FormData} formData - 생성할 데이터 (multipart/form-data)
 */
export const createKnowledge = async (formData) => {
  const response = await api.post('/api/knowledge', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * 지식베이스 첨부파일을 삭제하는 API
 * @param {number} attachmentId - 삭제할 첨부파일 ID
 */
export const deleteKnowledgeAttachment = async (attachmentId) => {
  const response = await api.delete(`/api/knowledge/attachments/${attachmentId}`);
  return response.data;
};

/**
 * 부서 코드에 해당하는 지식 태그 목록을 조회하는 API
 * @param {string} departmentCode - 부서 코드
 */
export const getKnowledgeTags = async (departmentCode) => {
  const response = await api.get('/api/knowledge/tags', { params: { department_code: departmentCode } });
  return response.data;
};

/**
 * 새 지식 태그를 생성하는 API
 * @param {object} data - { name, department_code }
 */
export const createKnowledgeTag = async (data) => {
  const response = await api.post('/api/knowledge/tags', data);
  return response.data;
};

/**
 * 새 노하우 로그를 생성하는 API
 * @param {object} payload
 * @param {number} payload.knowledgeId
 * @param {object} payload.data - { content, tag_ids }
 */
export const createKnowledgeLog = async ({ knowledgeId, data }) => {
  const response = await api.post(`/api/knowledge/${knowledgeId}/logs`, data);
  return response.data;
};

/**
 * 노하우 로그를 수정하는 API
 * @param {object} payload
 * @param {number} payload.logId
 * @param {object} payload.data - { content, tag_ids }
 */
export const updateKnowledgeLog = async ({ logId, data }) => {
  const response = await api.patch(`/api/knowledge/logs/${logId}`, data);
  return response.data;
};

/**
 * 노하우 로그를 삭제하는 API
 * @param {number} logId
 */
export const deleteKnowledgeLog = async (logId) => {
  const response = await api.delete(`/api/knowledge/logs/${logId}`);
  return response.data;
};
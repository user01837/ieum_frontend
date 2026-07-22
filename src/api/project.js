import api from './axios';

/**
 * 프로젝트 목록 조회 API
 * @param {object} params - 쿼리 파라미터
 * @param {string|null} params.stage - 진행 단계 필터 ('01': 저장, '02': 승인완료, 미입력 시 전체)
 * @param {number} params.page - 페이지 번호 (0부터 시작)
 * @param {number} params.size - 페이지 크기
 */
export const getProjects = async (params) => {
  const { departmentCode, ...rest } = params;
  const queryParams = {
    ...rest,
    ...(departmentCode ? { department_code: departmentCode } : {}),
  };
  const { data } = await api.get('/projects', { params: queryParams });
  return data;
};

/**
 * 새 프로젝트 생성 API
 * @param {object} body - 요청 데이터
 * @param {string} body.name - 사업명
 * @param {string} body.businessContent - 사업 설명
 * @param {string|null} body.startDate - 사업 시작일 (yyyy-MM-dd)
 * @param {string|null} body.deadline - 마감기한 (yyyy-MM-dd)
 * @param {number[]} body.memberUserIds - 협업 멤버 사번 목록
 */
export const createProject = async (body) => {
  const { data } = await api.post('/projects', body);
  return data;
};

/**
 * 프로젝트 상세 조회 API
 * @param {number} projectId - 프로젝트 ID
 */
export const getProjectDetail = async (projectId) => {
  const { data } = await api.get(`/projects/${projectId}`);
  return data;
};

/**
 * 프로젝트 저장 (수정) API
 * @param {number} projectId - 프로젝트 ID
 * @param {object} body - 요청 데이터
 */
export const updateProject = async (projectId, body) => {
  const { data } = await api.patch(`/projects/${projectId}`, body);
  return data;
};

/**
 * 기획서 승인완료 API
 * @param {number} projectId - 프로젝트 ID
 */
export const approveProject = async (projectId) => {
  const { data } = await api.post(`/projects/${projectId}/approve`);
  return data;
};

/**
 * 프로젝트 삭제 API
 * @param {number} projectId - 프로젝트 ID
 */
export const deleteProject = async (projectId) => {
  const { data } = await api.delete(`/projects/${projectId}`);
  return data;
};

/**
 * AI 기획서 초안 생성 API
 * @param {number} projectId - 프로젝트 ID
 */
export const getAiDraft = async (projectId) => {
  const response = await api.post(`/projects/${projectId}/ai-draft`);
  return response;
};

/**
 * 기획서 내보내기 API
 * @param {number} projectId - 프로젝트 ID
 * @param {string} format - 파일 형식 ('pdf' | 'docx' | 'hwpx')
 */
export const exportProject = async (projectId, format) => {
  const response = await api.get(`/projects/${projectId}/export`, {
    params: { format },
    responseType: 'blob',
  });
  return response;
};
import api from './axios';

/**
 * 민원 목록을 조회하는 API
 * @param {object} params - 쿼리 파라미터
 */
export const getPetitions = async (params) => {
  const response = await api.get('/petitions/', { params });
  return response.data;
};

/**
 * 특정 민원의 상세 정보를 조회하는 API
 * @param {string | number} complaintId - 민원 ID
 */
export const getPetitionDetail = async (complaintId) => {
  const response = await api.get(`/petitions/${complaintId}`);
  return response.data;
};

/**
 * 민원 답변을 임시저장하는 API
 * @param {object} data - 업데이트할 데이터
 * @param {string | number} data.complaintId - 민원 ID
 * @param {string} data.manualAnswer - 답변 내용 (HTML)
 * @param {string | number} [data.assigneeUserId] - 변경할 담당자 ID
 * @param {File[]} [data.files] - 업로드할 파일 목록
 */
export const tempSavePetition = async ({ complaintId, manualAnswer, assigneeUserId, files }) => {
  const formData = new FormData();

  // FormData는 null이나 undefined를 보내면 "null" 또는 "undefined" 문자열로 변환하므로,
  // 값이 있을 때만 추가합니다.
  if (manualAnswer !== null && manualAnswer !== undefined) {
    formData.append('manualAnswer', manualAnswer);
  }
  if (assigneeUserId !== null && assigneeUserId !== undefined) {
    formData.append('assigneeUserId', assigneeUserId);
  }

  // 파일이 있는 경우, 각 파일을 'files'라는 동일한 키로 추가합니다.
  if (files && files.length > 0) {
    files.forEach(file => {
      formData.append('files', file);
    });
  }

  const response = await api.put(`/petitions/${complaintId}/temp-save`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * 민원 답변을 최종 완료하는 API
 * @param {object} data - 완료 데이터
 * @param {string | number} data.complaintId - 민원 ID
 * @param {string} data.manualAnswer - 답변 내용 (HTML)
 * @param {File[]} [data.files] - 업로드할 파일 목록
 */
export const answerPetition = async ({ complaintId, manualAnswer, files }) => {
  const formData = new FormData();

  formData.append('manualAnswer', manualAnswer);

  if (files && files.length > 0) {
    files.forEach(file => {
      formData.append('files', file);
    });
  }

  const response = await api.post(`/petitions/${complaintId}/answer`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * 민원 정보를 업데이트하는 API (저장, 완료, 담당자 변경 등)
 * @param {object} data - 업데이트할 데이터
 * @param {string | number} data.complaintId - 민원 ID
 * @param {string} data.status_code - 상태 코드 ('02': 처리중, '03': 완료)
 * @param {string} [data.assignee_user_id] - 변경할 담당자 ID
 * @param {string} data.manual_answer - 답변 내용 (HTML)
 * @param {File[]} [data.attachments] - 첨부 파일 목록
 */
export const updatePetition = async ({ complaintId, ...updateData }) => {
  // 백엔드에 업데이트를 위한 PATCH 엔드포인트가 있다고 가정합니다.
  // 실제 엔드포인트와 필드명은 백엔드 API 명세에 따라야 합니다.
  // FormData를 사용한 파일 업로드는 추후 구현이 필요합니다.
  const response = await api.patch(`/petitions/${complaintId}`, updateData);
  return response.data;
};

/**
 * 첨부파일을 삭제하는 API (소프트 삭제)
 * @param {number} attachmentId - 삭제할 첨부파일 ID
 */
export const deleteAttachment = async (attachmentId) => {
  const response = await api.delete(`/petitions/attachments/${attachmentId}`);
  return response.data;
};

/**
 * AI를 통해 유사 민원을 검색하는 API
 * @param {object} payload - 검색 요청 데이터
 * @param {string} payload.title - 현재 민원 제목
 * @param {string} payload.content - 현재 민원 내용
 * @param {string} payload.department_code - 현재 민원 부서 코드
 * @param {number} [payload.top_k=2] - 반환할 최대 결과 수
 * @param {number[]} [payload.exclude_ids=[]] - 결과에서 제외할 민원 ID 목록
 * @param {number} [payload.min_similarity=0.0] - 최소 유사도
 * @returns {Promise<object>} - 유사 민원 검색 결과
 */
export const findSimilarPetitions = async (payload) => {
  const response = await api.post('/ai/similar-petitions', payload);
  return response.data;
};

/**
 * AI를 통해 답변 초안을 생성하는 API
 * @param {object} payload - 요청 데이터
 * @param {string} payload.title - 현재 민원 제목
 * @param {string} payload.content - 현재 민원 내용
 * @param {string} payload.department_code - 현재 민원 부서 코드
 * @returns {Promise<object>} - AI 답변 초안 생성 결과
 */
export const createDraftAnswer = async (payload) => {
  const response = await api.post('/ai/draft-answer', payload);
  return response.data;
};

/**
 * 시민이 로그인 없이 민원을 접수하는 공개 API (외부 민원 접수 API를 그대로 재사용)
 * @param {object} payload - { title, content }
 */
export const submitExternalPetition = async ({ title, content }) => {
  const response = await api.post(
    '/petitions/external',
    { title, content },
    { headers: { 'X-API-Key': import.meta.env.VITE_EXTERNAL_PETITION_API_KEY } }
  );
  return response.data;
};
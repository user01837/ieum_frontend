import api from './axios';

/**
 * 민원 목록을 조회하는 API
 * @param {object} params - 쿼리 파라미터
 */
export const getPetitions = async (params) => {
  const response = await api.get('/petitions', { params });
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
 */
export const tempSavePetition = async ({ complaintId, ...saveData }) => {
  const response = await api.put(`/petitions/${complaintId}/temp-save`, saveData);
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
import api from './axios';

/**
 * Task 목록 조회 API
 * 일반 사용자: JWT에서 부서 자동 추출
 * 관리자: departmentCode 파라미터로 선택 부서 조회
 */
export const getDepartmentTasks = async (departmentCode) => {
  const params = departmentCode ? { department_code: departmentCode } : {};
  const { data } = await api.get('/tasks', { params });
  return data;
};

/**
 * Task 생성 API
 * @param {object} params
 * @param {string} params.name - Task명
 * @param {string} [params.departmentCode] - 관리자 전용: 생성할 부서 코드 (없으면 본인 부서)
 */
export const createTask = async ({ name, departmentCode }) => {
  const params = departmentCode ? { department_code: departmentCode } : {};
  const { data } = await api.post('/tasks', { name }, { params });
  return data;
};

/**
 * Task 삭제 API
 * @param {number} taskId - Task ID
 */
export const deleteTask = async (taskId) => {
  const { data } = await api.delete(`/tasks/${taskId}`);
  return data;
};

/**
 * 담당자 지정 API
 * @param {object} params
 * @param {number} params.taskId - Task ID
 * @param {number} params.userId - 담당자 사번
 */
export const addAssignee = async ({ taskId, userId }) => {
  const { data } = await api.post(`/tasks/${taskId}/assignees`, { userId });
  return data;
};

/**
 * 담당자 해제 API
 * @param {object} params
 * @param {number} params.taskId - Task ID
 * @param {number} params.userId - 담당자 사번
 */
export const removeAssignee = async ({ taskId, userId }) => {
  const { data } = await api.delete(`/tasks/${taskId}/assignees/${userId}`);
  return data;
};
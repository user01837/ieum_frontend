import api from './axios';

/**
 * 내 부서 Task 목록 조회 API
 * JWT에서 부서 자동 추출
 */
export const getDepartmentTasks = async () => {
  const { data } = await api.get('/tasks');
  return data;
};

/**
 * Task 생성 API
 * @param {object} body
 * @param {string} body.name - Task명
 */
export const createTask = async (body) => {
  const { data } = await api.post('/tasks', body);
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
import api from './axios';

/**
 * 내 부서 Task 목록 조회 API
 * JWT에서 부서 자동 추출
 */
export const getDepartmentTasks = async () => {
  const { data } = await api.get('/tasks');
  return data;
};
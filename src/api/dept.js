import api from './axios';

/**
 * 부서 목록 조회 API
 */
export const getDepartments = async () => {
  const { data } = await api.get('/departments/');
  return data;
};

/**
 * 특정 부서의 조직원 목록 조회 API
 * @param {string} departmentCode - 부서 코드
 */
export const getDepartmentMembers = async (departmentCode) => {
  if (!departmentCode) return []; // 부서 코드가 없으면 요청하지 않음
  const { data } = await api.get(`/departments/${departmentCode}/members`);
  return data;
};
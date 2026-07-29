// 부서관리 페이지 - 대시보드
import api from './axios';

/**
 * 이번달 민원 건수 조회 API
 */
export const getComplaintsSummary = async (departmentCode) => {
    const params = departmentCode ? { department_code: departmentCode } : {};
    const { data } = await api.get('/dashboard/complaints/summary', { params });
    return data;
};

/**
 * 처리기한 임박 민원 목록 조회 API
 */
export const getDueSoonComplaints = async (departmentCode) => {
    const params = departmentCode ? { department_code: departmentCode } : {};
    const { data } = await api.get('/dashboard/complaints/due-soon', { params });
    return data;
};

/**
 * Task 현황 조회 API
 */
export const getTasksSummary = async (departmentCode) => {
    const params = departmentCode ? { department_code: departmentCode } : {};
    const { data } = await api.get('/dashboard/tasks/summary', { params });
    return data;
};

/**
 * 사용자 홈 대시보드 데이터 조회 API
 */
export const getHomeDashboardData = async () => {
    const { data } = await api.get('/home');
    return data;
};
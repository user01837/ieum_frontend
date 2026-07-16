// 부서관리 페이지 - 대시보드
import api from './axios';

/**
 * 이번달 민원 건수 조회 API
 */
export const getComplaintsSummary = async () => {
    const { data } = await api.get('/dashboard/complaints/summary');
    return data;
};

/**
 * 처리기한 임박 민원 목록 조회 API
 */
export const getDueSoonComplaints = async () => {
    const { data } = await api.get('/dashboard/complaints/due-soon');
    return data;
};

/**
 * Task 현황 조회 API
 */
export const getTasksSummary = async () => {
    const { data } = await api.get('/dashboard/tasks/summary');
    return data;
};
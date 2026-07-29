// 부서관리 페이지 - 대시보드
import { useQuery } from '@tanstack/react-query';
import { getComplaintsSummary, getDueSoonComplaints, getTasksSummary } from '../../api/dashboard';

/**
 * 이번달 민원 건수 쿼리
 */
export const useComplaintsSummaryQuery = (departmentCode) => {
    return useQuery({
        queryKey: ['complaintsSummary', departmentCode],
        queryFn: () => getComplaintsSummary(departmentCode),
        // departmentCode가 truthy(null, undefined, ''가 아님)일 때만 쿼리를 실행합니다.
        enabled: !!departmentCode,
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });
};

/**
 * 처리기한 임박 민원 목록 쿼리
 */
export const useDueSoonComplaintsQuery = (departmentCode) => {
    return useQuery({
        queryKey: ['dueSoonComplaints', departmentCode],
        queryFn: () => getDueSoonComplaints(departmentCode),
        enabled: !!departmentCode,
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });
};

/**
 * Task 현황 쿼리
 */
export const useTasksSummaryQuery = (departmentCode) => {
    return useQuery({
        queryKey: ['tasksSummary', departmentCode],
        queryFn: () => getTasksSummary(departmentCode),
        enabled: !!departmentCode,
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });
};
// 부서관리 페이지 - 대시보드
import { useQuery } from '@tanstack/react-query';
import { getComplaintsSummary, getDueSoonComplaints, getTasksSummary } from '../../api/dashboard';

export const useComplaintsSummaryQuery = () => {
    return useQuery({
        queryKey: ['complaintsSummary'],
        queryFn: getComplaintsSummary,
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });
};

export const useDueSoonComplaintsQuery = () => {
    return useQuery({
        queryKey: ['dueSoonComplaints'],
        queryFn: getDueSoonComplaints,
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });
};

export const useTasksSummaryQuery = () => {
    return useQuery({
        queryKey: ['tasksSummary'],
        queryFn: getTasksSummary,
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });
};
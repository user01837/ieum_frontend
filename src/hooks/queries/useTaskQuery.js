import { useQuery } from '@tanstack/react-query';
import { getDepartmentTasks } from '../../api/task';

/**
 * 내 부서 Task 목록을 가져오는 쿼리 Hook
 */
export const useDepartmentTasksQuery = () => {
  return useQuery({
    queryKey: ['departmentTasks'],
    queryFn: getDepartmentTasks,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};
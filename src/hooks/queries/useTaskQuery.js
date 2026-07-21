import { useQuery } from '@tanstack/react-query';
import { getDepartmentTasks } from '../../api/task';

/**
 * Task 목록을 가져오는 쿼리 Hook
 * @param {string | undefined} departmentCode - 관리자 전용: 선택 부서 코드 (없으면 본인 부서)
 */
export const useDepartmentTasksQuery = (departmentCode) => {
  return useQuery({
    queryKey: ['departmentTasks', departmentCode],
    queryFn: () => getDepartmentTasks(departmentCode),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};
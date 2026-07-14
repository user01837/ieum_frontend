import { useQuery } from '@tanstack/react-query';
import { getDepartments, getDepartmentMembers } from '../../api/dept';
import api from '../../api/axios';

/**
 * 부서 목록을 가져오는 쿼리 Hook
 */
export const useDepartmentsQuery = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments,
    staleTime: 1000 * 60 * 5, // 5분 동안은 캐시된 데이터 사용
    refetchOnWindowFocus: false,
  });
};

/**
 * 특정 부서의 조직원 목록을 가져오는 쿼리 Hook
 * @param {string | null} departmentCode - 조회할 부서 코드
 */
export const useDepartmentMembersQuery = (departmentCode) => {
  return useQuery({
    queryKey: ['departmentMembers', departmentCode],
    queryFn: () => getDepartmentMembers(departmentCode),
    enabled: !!departmentCode, // departmentCode가 있을 때만 쿼리 실행
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

// 부서 목록 조회 (직원 검색 모달 드롭다운용)
export const useDeptList = () => {
  return useQuery({
    queryKey: ['deptList'],
    queryFn: () => api.get('/departments/').then((res) => res.data),
  });
};
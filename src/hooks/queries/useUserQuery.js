//직원 검색 조회

import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios";
import { getUsers, getAdminStats } from "../../api/userManagement";

// 이 훅은 EmpSearchModal에서 사용됩니다.
export const useUserSearch = ({ scope, departmentCode, keyword }) => {
  return useQuery({
    queryKey: ["userSearch", scope, departmentCode, keyword],
    queryFn: () =>
      api
        .get("/users/search", {
          params: {
            scope,
            departmentCode,
            keyword,
          },
        })
        .then((res) => res.data), // API의 원본 데이터
    enabled: !!scope && (scope !== 'dept' || (departmentCode !== undefined && departmentCode !== null)),
    // `select` 옵션으로 API 응답 데이터를 가공합니다.
    // 이렇게 하면 이 훅을 사용하는 모든 컴포넌트가 일관된 데이터 형식을 받게 됩니다.
    select: (data) =>
      data.map((emp) => ({ ...emp, userId: emp.userId || emp.id })), // API 응답에 id 또는 userId가 있을 경우, userId로 통일합니다.
  });
};

/**
 * 관리자용 직원 목록을 조회하는 React Query 훅
 * @param {object} params - API 요청 파라미터
 * @param {string|null} params.departmentCode
 * @param {string|null} params.status
 * @param {string} params.keyword
 * @param {number} params.page
 * @param {number} params.size
 */
export const useUsersQuery = (params) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => getUsers(params),
    staleTime: 1000 * 60 * 5, // 5분
    refetchOnWindowFocus: false,
    // 페이지 변경 시 이전 데이터가 잠시 보이는 현상을 방지하고,
    // 새 데이터가 로드될 때까지 이전 데이터를 유지하여 UX를 개선합니다.
    keepPreviousData: true,
  });
};

/**
 * 관리자 대시보드 통계를 조회하는 React Query 훅
 */
export const useAdminStatsQuery = () => {
  return useQuery({
    queryKey: ['adminStats'],
    queryFn: getAdminStats,
    staleTime: 1000 * 60 * 5, // 5분
    refetchOnWindowFocus: false,
  });
};
//직원 검색 조회

import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios";

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
    enabled: !!scope,
    // `select` 옵션으로 API 응답 데이터를 가공합니다.
    // 이렇게 하면 이 훅을 사용하는 모든 컴포넌트가 일관된 데이터 형식을 받게 됩니다.
    select: (data) =>
      data.map((emp) => ({ ...emp, userId: emp.userId || emp.id })), // API 응답에 id 또는 userId가 있을 경우, userId로 통일합니다.
  });
};
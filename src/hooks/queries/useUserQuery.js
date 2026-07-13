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
        .then((res) => res.data),
    enabled: !!scope,
  });
};
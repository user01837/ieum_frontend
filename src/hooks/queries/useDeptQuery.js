// 부서 목록/조직도 조회
import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios";

export const useDeptList = () => {
  return useQuery({
    queryKey: ["deptList"],
    queryFn: () => api.get("/departments/").then((res) => res.data),
  });
};
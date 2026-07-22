import { useQuery } from '@tanstack/react-query';
import { getKnowledgeList } from '../../api/knowledge';

/**
 * 지식베이스 목록을 조회하는 React Query 훅
 * @param {object} params - API 요청 파라미터
 * @param {string|null} params.category_code
 * @param {string|null} params.scope_code
 * @param {string} params.keyword
 * @param {number} params.page
 * @param {number} params.size
 */
export const useKnowledgeListQuery = (params) => {
  // API로 보내기 전에 null이나 undefined 값을 가진 파라미터를 제거합니다.
  // 이렇게 하면 백엔드가 예기치 않은 빈 파라미터(예: ?sort=)를 수신하는 것을 방지할 수 있습니다.
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== null && value !== undefined)
  );

  return useQuery({
    // params 객체의 속성을 모두 쿼리 키에 포함시켜, 파라미터가 변경될 때마다 쿼리를 다시 실행합니다.
    queryKey: ['knowledgeList', cleanParams],
    queryFn: () => getKnowledgeList(cleanParams),
    staleTime: 1000 * 60 * 5, // 5분
    refetchOnWindowFocus: false,
    keepPreviousData: true, // 페이지네이션 UX 개선
  });
};
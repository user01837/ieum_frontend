import { useQuery } from '@tanstack/react-query';
import { getPetitions } from '../../api/petition';

/**
 * 민원 목록을 가져오는 쿼리 Hook
 * @param {object} params - 쿼리 파라미터
 * @param {string} params.scope
 * @param {string} params.status
 * @param {number} params.page
 * @param {number} params.size
 * @param {number|null} params.taskId
 * @param {string|null} params.sort
 */
export const usePetitionsQuery = (params) => {
  return useQuery({
    queryKey: ['petitions', params], // 쿼리 키에 파라미터를 포함하여 캐싱을 관리
    queryFn: () => getPetitions(params),
  });
};
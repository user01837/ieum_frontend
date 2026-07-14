import { useQuery } from '@tanstack/react-query';
import { getPetitions, getPetitionDetail } from '../../api/petition';

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
  // API로 보내기 전에 null이나 undefined 값을 가진 파라미터를 제거합니다.
  // 이렇게 하면 백엔드가 예기치 않은 빈 파라미터(예: ?sort=)를 수신하는 것을 방지할 수 있습니다.
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== null && value !== undefined)
  );

  return useQuery({
    // params 객체의 속성을 모두 쿼리 키에 포함시켜,
    // 파라미터가 동일할 경우 캐시된 데이터를 재사용하도록 합니다.
    // 객체 참조가 아닌 실제 값에 의해 캐싱이 결정됩니다.
    queryKey: ['petitions', { ...cleanParams }],
    queryFn: () => getPetitions(cleanParams),
    enabled: !!params?.scope, // scope 값이 있을 때만 쿼리를 실행합니다.
  });
};

/**
 * 특정 민원의 상세 정보를 가져오는 쿼리 Hook
 * @param {string | number} complaintId - 민원 ID
 */
export const usePetitionDetailQuery = (complaintId) => {
  return useQuery({
    queryKey: ['petition', complaintId],
    queryFn: () => getPetitionDetail(complaintId),
    // complaintId가 있을 때만 쿼리를 실행하고,
    // 404, 403 등 에러 발생 시 재시도하지 않습니다.
    enabled: !!complaintId,
    retry: false,
  });
};
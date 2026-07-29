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
  // enabled 옵션을 분리하고, 나머지 파라미터로 cleanParams를 생성합니다.
  const { enabled = true, ...apiParams } = params;

  // API로 보내기 전에 null이나 undefined 값을 가진 파라미터를 제거합니다.
  // 이렇게 하면 백엔드가 예기치 않은 빈 파라미터(예: ?sort=)를 수신하는 것을 방지할 수 있습니다.
  const cleanParams = Object.fromEntries(
    Object.entries(apiParams).filter(([, value]) => value !== null && value !== undefined)
  );

  return useQuery({
    queryKey: ['petitions', { ...cleanParams }],
    queryFn: () => getPetitions(cleanParams),
    // 외부에서 전달된 enabled 값과, scope 파라미터 존재 여부를 모두 만족할 때 쿼리를 실행합니다.
    enabled: enabled && !!params?.scope,
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
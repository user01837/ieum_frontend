// 프로젝트 목록/상세 조회

import { useQuery } from '@tanstack/react-query';
import { getProjects, getProjectDetail, getAiDraft } from '../../api/project';

/**
 * 프로젝트 목록을 가져오는 쿼리 Hook
 * @param {object} params - 쿼리 파라미터
 * @param {string|null} params.stage - 진행 단계 필터 ('01': 저장, '02': 승인완료)
 * @param {number} params.page - 페이지 번호 (0부터 시작)
 * @param {number} params.size - 페이지 크기
 */
export const useProjectsQuery = (params) => {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => getProjects(params),
  });
};

/**
 * 프로젝트 상세를 가져오는 쿼리 Hook
 * @param {number} projectId - 프로젝트 ID
 */
export const useProjectDetailQuery = (projectId) => {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProjectDetail(projectId),
    enabled: !!projectId,
  });
};

/**
 * AI 기획서 초안을 가져오는 쿼리 Hook
 * @param {number} projectId - 프로젝트 ID
 */
export const useAiDraftQuery = (projectId) => {
  return useQuery({
    queryKey: ['aiDraft', projectId],
    queryFn: () => getAiDraft(projectId),
    enabled: false, // 버튼 클릭 시에만 실행 (refetch로 호출)
  });
};
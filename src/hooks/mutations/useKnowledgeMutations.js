import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateKnowledge } from '../../api/knowledge';

/**
 * 지식베이스 정보를 수정하는 뮤테이션
 */
export const useUpdateKnowledgeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateKnowledge,
    onSuccess: (data, variables) => {
      // 수정 성공 시, 해당 지식 상세 정보 쿼리를 무효화하여 최신 데이터로 갱신
      queryClient.invalidateQueries({ queryKey: ['knowledgeDetail', variables.knowledgeId] });
      // 목록 쿼리도 무효화할 수 있음
      queryClient.invalidateQueries({ queryKey: ['knowledgeList'] });
      alert('지식베이스가 성공적으로 수정되었습니다.');
    },
    onError: (error) => {
      alert(`수정 중 오류가 발생했습니다: ${error.response?.data?.detail || error.message}`);
    },
  });
};

// TODO: 노하우 로그 추가/수정/삭제, 첨부파일 추가/삭제 뮤테이션 구현 필요
// export const useCreateKnowledgeLogMutation = () => { ... };
// export const useUpdateKnowledgeLogMutation = () => { ... };
// export const useDeleteKnowledgeLogMutation = () => { ... };
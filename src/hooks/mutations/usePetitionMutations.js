import { useMutation, useQueryClient } from '@tanstack/react-query';
import { answerPetition, tempSavePetition, deleteAttachment, findSimilarPetitions } from '../../api/petition';
import { useNavigate } from 'react-router-dom';

export const useCompletePetitionMutation = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: answerPetition,
    onSuccess: (data, variables) => {
      // 성공 시, 목록과 상세 정보 쿼리를 무효화하여 최신 데이터로 갱신
      queryClient.invalidateQueries({ queryKey: ['petitions'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['petition', variables.complaintId] });

      alert(data.message || "답변이 완료되었습니다.");
      navigate('/petitions');
    },
    onError: (error) => {
      console.error("민원 답변 완료 실패:", error);
      const message = error.response?.data?.detail || "처리 중 오류가 발생했습니다. 다시 시도해주세요.";
      alert(message);
    },
  });
};

/**
 * AI 유사 민원 검색을 위한 Mutation
 * @param {object} options - react-query useMutation options
 */
export const useFindSimilarPetitionsMutation = (options) => {
  return useMutation({
    mutationFn: findSimilarPetitions,
    ...options,
  });
};

export const useDeleteAttachmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ attachmentId }) => deleteAttachment(attachmentId),
    onSuccess: (data, variables) => {
      alert(data.message || '첨부파일이 삭제되었습니다.');
      // mutation 변수에서 complaintId를 받아와 해당 민원의 상세 정보 쿼리만 무효화합니다.
      if (variables.complaintId) {
        queryClient.invalidateQueries({ queryKey: ['petition', variables.complaintId] });
      }
    },
    onError: (error) => {
      console.error("첨부파일 삭제 실패:", error);
      const message = error.response?.data?.detail || "파일 삭제 중 오류가 발생했습니다.";
      alert(message);
    },
  });
};

export const useTempSavePetitionMutation = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: tempSavePetition,
    onSuccess: (data, variables) => {
      // 성공 시, 목록과 상세 정보 쿼리를 무효화하여 최신 데이터로 갱신
      queryClient.invalidateQueries({ queryKey: ['petitions'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['petition', variables.complaintId] });

      alert(data.message || "저장되었습니다.");
      
      // 담당자가 변경되지 않은 경우, 사용자가 계속 편집할 수 있도록 페이지에 머무릅니다.
      if (!variables.assigneeUserId) {
        return;
      }

      navigate('/petitions');
    },
    onError: (error) => {
      console.error("민원 임시저장 실패:", error);
      const message = error.response?.data?.detail || "처리 중 오류가 발생했습니다. 다시 시도해주세요.";
      alert(message);
    },
  });
};
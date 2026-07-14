import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePetition, tempSavePetition } from '../../api/petition';
import { useNavigate } from 'react-router-dom';

export const useUpdatePetitionMutation = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: updatePetition,
    onSuccess: (data, variables) => {
      // 성공 시, 목록과 상세 정보 쿼리를 무효화하여 최신 데이터로 갱신
      queryClient.invalidateQueries({ queryKey: ['petitions'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['petition', variables.complaintId] });

      if (variables.status_code === '03') { // 완료
        alert("민원 처리가 완료되었습니다.");
      } else { // 저장 또는 담당자 변경
        alert("저장되었습니다.");
      }
      navigate('/petitions');
    },
    onError: (error) => {
      console.error("민원 업데이트 실패:", error);
      const message = error.response?.data?.detail || "처리 중 오류가 발생했습니다. 다시 시도해주세요.";
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
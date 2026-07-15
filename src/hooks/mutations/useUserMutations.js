import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createUser, updateUser, resetPassword } from '../../api/userManagement';

// 신규 직원 생성 Mutation
export const useCreateUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      // 성공 시 'users' 쿼리를 무효화하여 목록을 새로고침
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

// 직원 정보 수정 Mutation
export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, userData }) => updateUser({ userId, userData }),
    onSuccess: () => {
      // 성공 시 'users' 쿼리를 무효화하여 목록을 새로고침
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

// 비밀번호 초기화 Mutation
export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: resetPassword,
    // 비밀번호 초기화는 목록 데이터에 영향을 주지 않으므로 onSuccess에서 특별한 작업 불필요
  });
};
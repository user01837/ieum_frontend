import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createChatRoom, markChatRoomRead, addChatRoomMembers, leaveChatRoom, renameChatRoom } from '../../api/chat';

export const useCreateChatRoomMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createChatRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
    },
  });
};

export const useMarkChatRoomReadMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markChatRoomRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useAddChatRoomMembersMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addChatRoomMembers,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
    },
  });
};

export const useLeaveChatRoomMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: leaveChatRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
      // 나가기 시 서버가 해당 방의 알림 row도 함께 삭제하므로 알림 목록도 갱신한다.
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useRenameChatRoomMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: renameChatRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
    },
  });
};

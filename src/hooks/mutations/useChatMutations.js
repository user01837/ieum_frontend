import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createChatRoom, markChatRoomRead, addChatRoomMembers, leaveChatRoom } from '../../api/chat';

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
    },
  });
};

import { useQuery } from '@tanstack/react-query';
import { getChatRooms, getChatRoomMessages } from '../../api/chat';

export const useChatRoomsQuery = () => {
  return useQuery({
    queryKey: ['chatRooms'],
    queryFn: getChatRooms,
  });
};

export const useChatRoomMessagesQuery = (roomId) => {
  return useQuery({
    queryKey: ['chatRoomMessages', roomId],
    queryFn: () => getChatRoomMessages({ roomId }),
    enabled: !!roomId,
  });
};

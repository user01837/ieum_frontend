import { useEffect, useRef, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import useAuthStore from '../store/useAuthStore';

const getWsBaseUrl = () => {
  const httpBase = import.meta.env.VITE_API_BASE_URL || '';
  return httpBase.replace(/^http/, 'ws');
};

export const useChatSocket = () => {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const wsRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token) return undefined;

    const ws = new WebSocket(`${getWsBaseUrl()}/ws/chat?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'new_message') {
        const { room_id: roomId, message } = data;
        queryClient.setQueryData(['chatRoomMessages', roomId], (old = []) => [message, ...old]);
        queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
      }

      if (data.type === 'notification') {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
      }
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [token, queryClient]);

  const sendMessage = useCallback((roomId, content) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'send_message', room_id: roomId, content }));
    }
  }, []);

  const setActiveRoom = useCallback((roomId) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'active_room', room_id: roomId }));
    }
  }, []);

  return { isConnected, sendMessage, setActiveRoom };
};

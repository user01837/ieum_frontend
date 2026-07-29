import { useEffect, useRef, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import useAuthStore from '../store/useAuthStore';

const getWsBaseUrl = () => {
  const httpBase = import.meta.env.VITE_API_BASE_URL || '';
  return httpBase.replace(/^http/, 'ws');
};

const RECONNECT_BASE_DELAY_MS = 1000;
const RECONNECT_MAX_DELAY_MS = 15000;

export const useChatSocket = () => {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const wsRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token) return undefined;

    let cancelled = false;
    let reconnectTimer = null;
    let reconnectDelay = RECONNECT_BASE_DELAY_MS;

    const connect = () => {
      if (cancelled) return;

      const ws = new WebSocket(`${getWsBaseUrl()}/ws/chat?token=${token}`);
      wsRef.current = ws;

      ws.onopen = () => {
        if (cancelled) return;
        setIsConnected(true);
        // 재연결 성공 시 백오프 간격을 초기화합니다.
        reconnectDelay = RECONNECT_BASE_DELAY_MS;
      };

      ws.onerror = (event) => {
        console.error('[chat] WebSocket 오류가 발생했습니다.', event);
      };

      ws.onclose = () => {
        wsRef.current = null;
        if (cancelled) return;
        setIsConnected(false);
        // 우리가 의도적으로 닫은 경우(unmount, 토큰 변경)가 아니라면 자동 재연결을 시도합니다.
        reconnectTimer = setTimeout(() => {
          reconnectDelay = Math.min(reconnectDelay * 2, RECONNECT_MAX_DELAY_MS);
          connect();
        }, reconnectDelay);
      };

      ws.onmessage = (event) => {
        let data;
        try {
          data = JSON.parse(event.data);
        } catch (err) {
          console.error('[chat] WebSocket 메시지 파싱에 실패했습니다.', event.data, err);
          return;
        }

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
    };

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [token, queryClient]);

  const sendMessage = useCallback((roomId, content) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'send_message', room_id: roomId, content }));
      return true;
    }
    return false;
  }, []);

  const setActiveRoom = useCallback((roomId) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'active_room', room_id: roomId }));
    }
  }, []);

  return { isConnected, sendMessage, setActiveRoom };
};

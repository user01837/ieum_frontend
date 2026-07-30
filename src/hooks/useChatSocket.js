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
  // 토큰 "값"이 아니라 로그인 여부(boolean)에만 반응합니다.
  // access token은 주기적인 silent refresh로 값이 자주 바뀌는데, 그때마다 이 effect가
  // 재실행되어 소켓을 통째로 재생성하면 재연결 경쟁 상태(아래 onclose 참고)가 그만큼 자주 발생합니다.
  // 로그인 상태 자체는 로그인/로그아웃 때만 바뀌므로 재연결 빈도를 최소화할 수 있습니다.
  const isLoggedIn = useAuthStore((state) => !!state.token);
  const wsRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return undefined;

    let cancelled = false;
    let reconnectTimer = null;
    let reconnectDelay = RECONNECT_BASE_DELAY_MS;
    // 이 effect 인스턴스에서 최초 연결이 이미 한 번 성공했는지 추적합니다.
    // true인 상태에서 다시 onopen이 불리면 "재연결"이므로 캐시를 무효화합니다(Fix 3).
    let hasConnectedOnce = false;

    const connect = () => {
      if (cancelled) return;

      // 클로저에 캡처된 값이 아니라, 연결을 여는 바로 그 순간의 최신 토큰을 읽습니다.
      // 이렇게 하면 silent refresh로 토큰이 바뀌어도 이 effect를 재실행할 필요 없이,
      // 기존 재연결 백오프 로직이 다음 연결 시도에서 자연스럽게 최신 토큰을 사용합니다.
      const currentToken = useAuthStore.getState().token;
      if (!currentToken) return;

      const ws = new WebSocket(`${getWsBaseUrl()}/ws/chat?token=${currentToken}`);
      wsRef.current = ws;

      ws.onopen = () => {
        if (cancelled) return;
        setIsConnected(true);
        // 재연결 성공 시 백오프 간격을 초기화합니다.
        reconnectDelay = RECONNECT_BASE_DELAY_MS;
        // 재연결(최초 연결이 아님)인 경우, 끊겨 있던 동안 놓쳤을 수 있는 메시지/방 목록을
        // 다시 불러옵니다. 최초 연결에서는 어차피 쿼리들이 처음 fetch되므로 불필요합니다.
        if (hasConnectedOnce) {
          queryClient.invalidateQueries({ queryKey: ['chatRoomMessages'] });
          queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
        }
        hasConnectedOnce = true;
      };

      ws.onerror = (event) => {
        console.error('[chat] WebSocket 오류가 발생했습니다.', event);
      };

      ws.onclose = () => {
        // 이 소켓이 여전히 "현재" 소켓으로 참조되고 있을 때만 null로 초기화합니다.
        // effect가 재실행되어 새 소켓(ws2)이 이미 wsRef.current를 차지한 뒤에
        // 이전 소켓(ws1)의 close 이벤트가 뒤늦게 도착하는 경우, 여기서 무조건 null을 대입하면
        // 멀쩡히 연결된 ws2에 대한 참조를 지워버려 전송이 영구히 막히는 경쟁 상태가 발생합니다.
        if (wsRef.current === ws) wsRef.current = null;
        if (cancelled) return;
        setIsConnected(false);
        // 우리가 의도적으로 닫은 경우(unmount, 로그아웃)가 아니라면 자동 재연결을 시도합니다.
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
  }, [isLoggedIn, queryClient]);

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

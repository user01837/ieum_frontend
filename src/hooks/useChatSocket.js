import { useEffect, useRef, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import useAuthStore from '../store/useAuthStore';
import api from '../api/axios';

const getWsBaseUrl = () => {
  const httpBase = import.meta.env.VITE_API_BASE_URL || '';
  return httpBase.replace(/^http/, 'ws');
};

const RECONNECT_BASE_DELAY_MS = 1000;
const RECONNECT_MAX_DELAY_MS = 15000;
// access token 만료 판단에 여유를 두는 시간(초). 만료 직전(이 값 이내)이거나 이미
// 만료된 토큰은 어차피 서버가 거부할 것이므로 미리 갱신한다.
const TOKEN_EXPIRY_BUFFER_SECONDS = 30;

// axios 인터셉터는 REST 요청이 401을 받아야만 반응하는 "사후" 방식이라, 웹소켓처럼
// axios를 거치지 않는 연결에는 적용되지 않는다. 채팅 페이지를 access token 유효
// 시간(30분)보다 오래 열어두면 이 토큰은 조용히 만료되고, 그 뒤로는 재연결을
// 시도할 때마다 서버가 4401로 거부해 "웹소켓 오류가 발생했습니다"가 반복되며
// REST 요청이 우연히 하나 실패해 인터셉터가 토큰을 갱신해줄 때까지 복구되지
// 않는다. exp 클레임만 디코딩해(서명 검증 없이, 만료 여부만 확인) 연결 직전에
// 미리 걸러낸다.
const isTokenExpired = (token, bufferSeconds = TOKEN_EXPIRY_BUFFER_SECONDS) => {
  try {
    // JWT는 base64url(RFC 7515, '-'/'_' 사용, 패딩 없음)로 인코딩되어 있어
    // atob()가 기대하는 표준 base64('+'/'/' , '=' 패딩)로 먼저 바꿔줘야 한다.
    let base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) base64 += '=';
    const payload = JSON.parse(atob(base64));
    if (!payload.exp) return false;
    return payload.exp * 1000 <= Date.now() + bufferSeconds * 1000;
  } catch {
    return true;
  }
};

export const useChatSocket = () => {
  const queryClient = useQueryClient();
  // 토큰 "값"이 아니라 로그인 여부(boolean)에만 반응합니다.
  // access token은 아래 connect()에서 매 연결 시도 직전에 필요하면 직접 갱신하는데,
  // 그때마다 이 effect가 재실행되어 소켓을 통째로 재생성하면 재연결 경쟁 상태(아래
  // onclose 참고)가 그만큼 자주 발생합니다. 로그인 상태 자체는 로그인/로그아웃
  // 때만 바뀌므로 재연결 빈도를 최소화할 수 있습니다.
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

    const connect = async () => {
      if (cancelled) return;

      // 클로저에 캡처된 값이 아니라, 연결을 여는 바로 그 순간의 최신 토큰을 읽습니다.
      // 이렇게 하면 토큰이 바뀌어도 이 effect를 재실행할 필요 없이, 기존 재연결
      // 백오프 로직이 다음 연결 시도에서 자연스럽게 최신 토큰을 사용합니다.
      let currentToken = useAuthStore.getState().token;
      if (!currentToken) return;

      if (isTokenExpired(currentToken)) {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (refreshToken) {
          try {
            const { data } = await api.post('/auth/refresh', { refreshToken });
            useAuthStore.getState().setToken(data.accessToken);
            currentToken = data.accessToken;
          } catch (err) {
            // 갱신에 실패해도(예: refresh token마저 만료) 일단 현재 토큰으로 시도한다.
            // 서버가 거부하면 onclose의 재연결 루프가 다음 시도에서 다시 갱신을 시도한다.
            console.error('[chat] WS 연결 전 access token 갱신 실패', err);
          }
        }
      }

      // await 도중 컴포넌트가 언마운트되었을 수 있으니 다시 확인한다.
      if (cancelled) return;

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

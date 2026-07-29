import { useEffect } from 'react';
import { requestFcmToken, listenForForegroundMessages } from '../firebase/firebaseConfig';
import { registerDeviceToken, unregisterDeviceToken } from '../api/notification';
import useAuthStore from '../store/useAuthStore';

export function useFcmToken() {
  // 토큰 "값"이 아니라 로그인 여부(boolean)에만 반응합니다.
  // access token은 silent refresh로 값이 자주 바뀌는데, 이 effect가 token 값에 의존하면
  // 토큰이 바뀔 때마다 cleanup(unregisterDeviceToken)과 재실행(registerDeviceToken)이 연달아
  // 발생해 같은 device-token row에 대해 DELETE/POST가 경쟁하게 됩니다. 실제 API 호출들은
  // (axios 인터셉터가 최신 토큰을 알아서 헤더에 실어주므로) 로그인 여부만 알면 충분합니다.
  const isLoggedIn = useAuthStore((state) => !!state.token);

  useEffect(() => {
    if (!isLoggedIn) return undefined;

    let currentFcmToken = null;

    (async () => {
      currentFcmToken = await requestFcmToken();
      if (currentFcmToken) {
        try {
          await registerDeviceToken(currentFcmToken);
        } catch (error) {
          console.error('FCM 토큰 등록 실패:', error);
        }
      }
    })();

    const unsubscribe = listenForForegroundMessages((payload) => {
      console.log('포그라운드 메시지 수신:', payload);
    });

    return () => {
      unsubscribe();
      if (currentFcmToken) {
        unregisterDeviceToken(currentFcmToken).catch(() => {});
      }
    };
  }, [isLoggedIn]);
}

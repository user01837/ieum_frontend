import { useEffect } from 'react';
import { requestFcmToken, listenForForegroundMessages } from '../firebase/firebaseConfig';
import { registerDeviceToken, unregisterDeviceToken } from '../api/notification';
import useAuthStore from '../store/useAuthStore';

export function useFcmToken() {
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (!token) return undefined;

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
  }, [token]);
}

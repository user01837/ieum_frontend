import { useEffect, useState } from 'react';
import useAuthStore from './useAuthStore';

/**
 * 앱이 처음 로드될 때 인증 상태를 확인하고,
 * 확인이 끝날 때까지 로딩 화면을 보여주는 역할을 합니다.
 * 이 컴포넌트는 MainLayout과 같은 보호된 라우트의 최상위에서 사용되어야 합니다.
 */
function AuthLoader({ children }) {
  // 1. 스토어에서 필요한 값을 개별적으로 선택하여 불필요한 리렌더링을 방지합니다.
  const token = useAuthStore((state) => state.token);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  // 2. 이 컴포넌트의 역할은 '초기화가 완료되었는지'만 추적하는 것입니다.
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      // 토큰이 있을 경우에만 인증 상태를 확인합니다.
      if (token) {
        try {
          await checkAuth();
        } catch (e) {
          // checkAuth 내부에서 이미 로그아웃 처리를 하므로 여기서는 에러만 기록합니다.
          console.error("Auth initialization failed:", e);
        }
      }
      // 인증 시도가 끝났으므로, 초기화 완료 상태로 변경합니다.
      setIsInitialized(true);
    };

    initialize();
    // 3. 이 effect는 앱이 처음 마운트될 때 딱 한 번만 실행되어야 합니다.
  }, []); // 최초 1회만 실행합니다.

  if (!isInitialized) {
    return <div>애플리케이션을 불러오는 중입니다...</div>; // 또는 스피너 컴포넌트
  }

  return children;
}

export default AuthLoader;
import { create } from 'zustand';
import { getMe } from '../api/auth';

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('accessToken') || null, // 초기값 설정 시 localStorage 확인

  login: (backendUser, accessToken) => {
    // 백엔드(position_code)와 프론트엔드(deptName)의 필드명을 맞춰줍니다.
    const frontendUser = {
      ...backendUser,
      deptName: backendUser.position_code,
    };
    set({ user: frontendUser, token: accessToken });
    localStorage.setItem('accessToken', accessToken); // 토큰을 localStorage에 저장
  },

  logout: () => {
    set({ user: null, token: null });
    localStorage.removeItem('accessToken'); // localStorage에서 토큰 제거
  },

  // 앱 로드 시 토큰 유효성을 검사하고 사용자 정보를 가져오는 함수
  checkAuth: async () => {
    console.log('[checkAuth] 시작: 토큰 확인 중...');
    const token = get().token;
    if (token) {
      console.log('[checkAuth] 토큰 발견. 사용자 정보 요청을 시작합니다.');
      try {
        const response = await getMe();
        console.log('[checkAuth] API 응답 받음:', response.data);

        const backendUser = response.data;
        // 백엔드(position_code)와 프론트엔드(deptName)의 필드명을 맞춰줍니다.
        const frontendUser = {
          ...backendUser,
          deptName: backendUser.position_code,
        };
        console.log('[checkAuth] 프론트엔드용으로 변환된 사용자 정보:', frontendUser);

        set({ user: frontendUser });
        console.log('[checkAuth] 스토어에 사용자 정보 저장 완료.');
      } catch (error) {
        console.error('[checkAuth] 사용자 정보 요청 실패. 토큰이 유효하지 않거나 API에 문제가 있을 수 있습니다.', error);
        get().logout(); // 토큰이 유효하지 않으면 로그아웃 처리
      }
    } else {
      console.log('[checkAuth] 토큰이 없어 인증 절차를 건너뜁니다.');
    }
  },
}));

// 앱이 로드될 때 checkAuth를 호출하여 로그인 상태를 복원합니다.
useAuthStore.getState().checkAuth();

export default useAuthStore;

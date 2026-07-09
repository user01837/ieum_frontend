import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('accessToken') || null, // 초기값 설정 시 localStorage 확인
  
  login: (userData, accessToken) => {
    set({ user: userData, token: accessToken });
    localStorage.setItem('accessToken', accessToken); // 토큰을 localStorage에 저장
  },

  logout: () => {
    set({ user: null, token: null });
    localStorage.removeItem('accessToken'); // localStorage에서 토큰 제거
  },

  // 초기 로드 시 localStorage에 토큰이 있다면 유효성 검사 (필요에 따라 추가)
  // fetchUser: async () => {
  //   const token = localStorage.getItem('accessToken');
  //   if (token) {
  //     // 토큰 유효성 검사 및 사용자 정보 가져오는 API 호출 로직 추가
  //     // 예: const response = await api.get('/user/me', { headers: { Authorization: `Bearer ${token}` }});
  //     // set({ user: response.data, token });
  //   }
  // }
}));

export default useAuthStore;

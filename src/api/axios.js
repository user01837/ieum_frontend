import axios from "axios";
import useAuthStore from "../store/useAuthStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, //백엔드 주소를 env파일에서 설정된 내용으로 가지고옴
});

// 요청 인터셉터: 모든 API 요청이 보내지기 전에 호출됩니다.
api.interceptors.request.use(
  (config) => {
    // Zustand 스토어에서 토큰을 가져옵니다.
    const token = useAuthStore.getState().token;
    if (token) {
      // 토큰이 있으면 Authorization 헤더에 'Bearer' 방식의 토큰을 추가합니다.
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config; // 수정된 config를 반환하여 요청을 계속 진행합니다.
  },
  (error) => {
    // 요청 에러 처리
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 401 에러 발생 시 토큰 재발급 시도
api.interceptors.response.use(
  (response) => {
    // 2xx 범위의 상태 코드는 이 함수를 트리거합니다.
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const { logout, refreshToken, setToken } = useAuthStore.getState();

    // 401 에러이고, 재시도한 요청이 아닐 경우에만 토큰 재발급을 시도합니다.
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // 무한 재시도를 방지하기 위한 플래그

      // 토큰 재발급 요청 자체에서 401이 발생하면 무한 루프에 빠지므로,
      // 이 경우는 즉시 로그아웃 처리합니다.
      if (originalRequest.url === '/auth/refresh') {
        console.error('Refresh token is invalid or expired. Logging out.');
        logout();
        window.location.href = '/login'; // 로그인 페이지로 강제 이동
        return Promise.reject(error);
      }

      if (refreshToken) {
        try {
          console.log('Access token expired. Attempting to refresh...');
          // 새 Access Token 요청
          const { data } = await api.post('/auth/refresh', { refreshToken });
          const newAccessToken = data.accessToken;

          // 스토어와 localStorage에 새 토큰 저장
          setToken(newAccessToken);

          // 원래 요청의 헤더에 새 토큰으로 교체
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

          // 원래 실패했던 요청을 새로운 토큰으로 재시도
          console.log('Token refreshed. Retrying original request...');
          return api(originalRequest);
        } catch (refreshError) {
          console.error('Failed to refresh token. Logging out.', refreshError);
          logout();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
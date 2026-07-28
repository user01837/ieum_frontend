import axios from "axios";
import useAuthStore from "../store/useAuthStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, //백엔드 주소를 env파일에서 설정된 내용으로 가지고옴
});

// 토큰 재발급 중인지 여부와 대기 중인 요청을 관리하기 위한 변수
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

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

    // 로그인 필요 없는 공개 요청(예: 민원 접수 공개 폼)은 401이어도 로그인 페이지로 보내지 않음
    if (originalRequest?.skipAuthRedirect) {
      return Promise.reject(error);
    }

    // 401 에러이고, 재시도된 요청이 아닐 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 이미 토큰 재발급이 진행 중인 경우, 현재 요청을 큐에 추가하고 대기

      if (originalRequest.url === '/auth/refresh') {
        logout();
        window.location.href = '/login';
        return Promise.reject(error);
      }
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return api(originalRequest); // 새 토큰으로 재시도
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const { refreshToken, setToken, logout } = useAuthStore.getState();

      // 리프레시 토큰이 없거나, 재발급 요청 자체가 실패한 경우 즉시 로그아웃
      if (originalRequest.url === '/auth/refresh' || !refreshToken) {
        console.error('Refresh token is invalid, expired, or missing. Logging out.');
        processQueue(error, null);
        isRefreshing = false;
        logout();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        console.log('Access token expired. Attempting to refresh...');
        const { data } = await api.post('/auth/refresh', { refreshToken });
        const newAccessToken = data.accessToken;

        setToken(newAccessToken);
        processQueue(null, newAccessToken); // 대기열의 모든 요청에 새 토큰 전파

        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return api(originalRequest); // 원래 요청 재시도
      } catch (refreshError) {

        console.log("===== REFRESH CATCH 진입 =====");

        console.error(
          'Failed to refresh token. Logging out.',
          refreshError
        );

        processQueue(refreshError, null);

        console.log("logout 실행 전");

        logout();

        console.log("logout 실행 후");

        window.location.href = '/login';

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
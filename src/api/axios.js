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

export default api;
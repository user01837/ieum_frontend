import { create } from 'zustand';
import { getMe } from '../api/auth';
import { getDepartments } from '../api/dept';
import { queryClient } from '../main';

const POSITION_MAP = {
  "01": "부장",
  "02": "팀장",
  "03": "주무관",
};

// Helper function to map backend user data to frontend format
const mapBackendUserToFrontend = async (backendUser) => {
  if (!backendUser) {
    return null;
  }

  // Fetch all departments to find the name for the user's department code
  // This will use react-query's cache if available
  const departments = await queryClient.fetchQuery({
    queryKey: ['departments'],
    queryFn: getDepartments,
    staleTime: Infinity,
  });

  const userDept = departments.find(d => d.code === backendUser.department_code);

  return {
    ...backendUser,
    deptName: userDept ? userDept.name : backendUser.department_code, // Map code to name, fallback to code
    positionName: POSITION_MAP[backendUser.position_code] || '직책없음',
  };
};

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('accessToken') || null, // Access Token
  refreshToken: localStorage.getItem('refreshToken') || null, // Refresh Token
  mustChangePassword: false, // 비밀번호 변경 필요 여부 상태

  login: async (backendUser, accessToken, refreshToken, mustChangePassword) => {
    const frontendUser = await mapBackendUserToFrontend(backendUser);
    set({ user: frontendUser, token: accessToken, refreshToken: refreshToken, mustChangePassword: mustChangePassword });
    localStorage.setItem('accessToken', accessToken); // 토큰을 localStorage에 저장
    localStorage.setItem('refreshToken', refreshToken);
  },

  logout: () => {
    set({ user: null, token: null, refreshToken: null, mustChangePassword: false });
    localStorage.removeItem('accessToken'); // localStorage에서 토큰 제거
    localStorage.removeItem('refreshToken');
  },

  // 비밀번호 변경 필요 상태만 업데이트하는 액션
  setMustChangePassword: (mustChange) => {
    set({ mustChangePassword: mustChange });
  },

  // Access Token만 업데이트하는 액션
  setToken: (accessToken) => {
    set({ token: accessToken });
    localStorage.setItem('accessToken', accessToken);
  },

  // 앱 로드 시 토큰 유효성을 검사하고 사용자 정보를 가져오는 함수
  checkAuth: async () => {
    const token = get().token;
    if (token) {
      try {
        const response = await getMe();

        const backendUser = response.data;
        const frontendUser = await mapBackendUserToFrontend(backendUser);

        // 백엔드 /auth/me 응답에 mustChangePassword가 포함되어 있는지 확인합니다.
        // 백엔드에서 boolean (true/false) 또는 숫자 (1/0)로 올 수 있으므로 !!를 사용해 boolean으로 변환합니다.
        const mustChangePassword = !!backendUser.mustChangePassword;

        set({ user: frontendUser, mustChangePassword });
      } catch (error) {
        console.error('[checkAuth] 사용자 정보 요청 실패. 토큰이 유효하지 않거나 API에 문제가 있을 수 있습니다.', error);
        get().logout(); // 토큰이 유효하지 않으면 로그아웃 처리
        throw error;
      }
    }
  },
}));

export default useAuthStore;

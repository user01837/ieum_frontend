import { useMutation } from '@tanstack/react-query';
import { login, logout } from '../../api/auth'; // api/auth.js에서 login 함수를 가져옴
import useAuthStore from '../../store/useAuthStore'; // Auth Store 가져옴
import { useNavigate } from 'react-router-dom'; // 페이지 이동을 위한 useNavigate

// 이 파일에서는 @tanstack/react-query의 useMutation을 사용하여 
// login 및 logout API 함수를 호출하는 useLoginMutation과 useLogoutMutation Hook을 만들 것입니다. 
// 로그인 성공 시에는 useAuthStore를 통해 사용자 정보를 저장하고 페이지를 이동하도록 처리하며, 
// 실패 시에는 에러 메시지를 보여줄 것입니다.

/**
 * 로그인 뮤테이션 Hook
 */
export const useLoginMutation = () => {
  const navigate = useNavigate();
  const authLogin = useAuthStore((state) => state.login); // Zustand store의 login 액션

  return useMutation({
    mutationFn: login, // api/auth.js의 login 함수 사용
    onSuccess: (response) => {
      // 로그인 성공 시 처리
      console.log('Login successful:', response.data);
      // 서버 응답에서 사용자 데이터와 토큰 추출 (API 응답 형식에 따라 수정 필요)
      const userData = response.data.user; // 예시: { id: 1, name: '사용자명', ... }
      const accessToken = response.data.accessToken; // 예시: 'eyJ...'

      if (userData && accessToken) {
        authLogin(userData, accessToken); // Zustand store에 로그인 정보 저장
        navigate('/home'); // 메인 페이지로 이동
      } else {
        // 응답 데이터가 예상과 다를 경우 처리
        console.error('Login successful, but user data or token missing in response.', response.data);
        alert('로그인에 성공했지만, 사용자 정보를 불러올 수 없습니다. 다시 시도해주세요.');
      }
    },
    onError: (error) => {
      // 로그인 실패 시 처리
      console.error('Login failed:', error);
      alert('로그인 실패: 아이디 또는 비밀번호를 확인해주세요.');
    },
  });
};

/**
 * 로그아웃 뮤테이션 Hook
 */
export const useLogoutMutation = () => {
  return useMutation({
    mutationFn: logout, // api/auth.js의 logout 함수 사용
    // onSuccess 및 onError 처리는 이 훅을 사용하는 컴포넌트에서 직접 정의합니다.
  });
};

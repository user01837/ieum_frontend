import { createBrowserRouter, redirect } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import AuthLoader from "../store/AuthLoader"; // 1. AuthLoader를 올바른 경로에서 가져옵니다.
import useAuthStore from "../store/useAuthStore";
import { getMe } from "../api/auth";

import Login from "../pages/Login/Login";
import PetitionList from "../pages/Petition/Petition_list";
import DetailPetition from "../pages/Petition/Detail_petition";
import Home from "../pages/Home/Home";
import NotFound from "../pages/NotFound/NotFound";
import OrgChart from "../pages/OrgChart/OrgChart";
import ProjectList from "../pages/Project/ProjectList";
import ProjectCreate from "../pages/Project/ProjectCreate";
import ProjectDetail from "../pages/Project/ProjectDetail";
import DepartmentList from "../pages/Department/DepartmentList";
import Admin from "../pages/Admin/Admin";
import Knowl from "../pages/knowledge/knowl";
import DetailKnowl from "../pages/knowledge/KnowlDetail";
import KnowlCreate from "../pages/knowledge/KnowlCreate";

/**
 * 보호된 라우트를 위한 loader 함수.
 * 컴포넌트가 렌더링되기 전에 실행되어 인증 상태를 확인.
 */
function protectedLoader() {
  const { token } = useAuthStore.getState();
  if (!token) {
    // 토큰이 없으면 로그인 페이지로 리디렉션합니다.
    return redirect("/login");
  }
  return null; // 인증된 경우 null을 반환하여 자식 라우트 렌더링을 허용.
}

/**
 * 관리자 전용 라우트를 위한 loader 함수.
 * 사용자가 시스템 관리자(02) 역할인지 확인합니다.
 */
async function adminLoader() {
  // protectedLoader가 먼저 실행되므로 토큰 존재는 보장됩니다.
  let { user } = useAuthStore.getState();

  // 스토어에 사용자 정보가 아직 없는 경우 (예: 페이지 새로고침 직후)
  // API를 직접 호출하여 사용자 정보를 가져옵니다.
  if (!user) {
    try {
      const response = await getMe();
      user = response.data; // 검사를 위해 임시로 사용자 정보 할당
    } catch (error) {
      // getMe API 호출 실패 시 (예: 유효하지 않은 토큰) 로그인 페이지로 리디렉션
      console.error("Admin check failed: Could not fetch user.", error);
      return redirect("/login");
    }
  }

  // 사용자 역할 코드 확인
  if (user?.system_role_code !== '02') {
    alert('관리자만 접근할 수 있는 페이지입니다.');
    return redirect("/petitions"); // 권한이 없으면 홈으로 리디렉션
  }

  return null; // 접근 허용
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
    errorElement: <NotFound />,
  },
  {
    path: "/login", // /login 경로 추가
    element: <Login />,
  },

  // 일반 인증
  {
    // 2. MainLayout을 AuthLoader로 감싸줍니다.
    // 이렇게 하면 보호된 페이지에 접근하기 전에 항상 인증 상태 확인이 먼저 완료됩니다.
    element: (
      <AuthLoader><MainLayout /></AuthLoader>
    ),
    loader: protectedLoader,
    children: [
      {
        path: "petitions",
        element: <PetitionList //isAdmin={true}
        />,
      },
      {
        path: "petitions/:id",
        element: <DetailPetition //isAdmin={true} 
        />,
      },
      {
        path: "orgchart",
        element: <OrgChart />,
      },
      {
        path: "projects",
        element: <ProjectList />,
      },
      {
        path: "projects/new",
        element: <ProjectCreate />,
      },
      {
        path: "projects/:id",
        element: <ProjectDetail />,
      },
      {
        path: "knowledge",
        element: <Knowl />,
      },
      {
        path: "knowledge/new",
        element: <KnowlCreate />,
      },
      {
        path: "knowledge/:id",
        element: <DetailKnowl />,
      },
      {
        path: "departments",
        element: <DepartmentList />,
      },
      {
        path: "admin",
        element: <Admin />,
        loader: adminLoader, // 관리자 전용 loader 적용
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
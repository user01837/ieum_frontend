import { createBrowserRouter, redirect } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import useAuthStore from "../store/useAuthStore";

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

/**
 * 보호된 라우트를 위한 loader 함수.
 * 컴포넌트가 렌더링되기 전에 실행되어 인증 상태를 확인.
 */
const protectedLoader = () => {
  const { token } = useAuthStore.getState();
  if (!token) {
    // 토큰이 없으면 로그인 페이지로 리디렉션합니다.
    return redirect("/login");
  }
  return null; // 인증된 경우 null을 반환하여 자식 라우트 렌더링을 허용.
};

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
    element: <MainLayout />,
    loader: protectedLoader, // MainLayout과 그 모든 자식 페이지에 loader를 적용합니다.
    children: [
      {
        path: "home",
        element: <Home />,
      },
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
        path: "departments",
        element: <DepartmentList />,
      },
      {
        path: "admin",
        element: <Admin />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
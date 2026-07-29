import { createBrowserRouter, redirect } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import AuthLoader from "../store/AuthLoader";
import useAuthStore from "../store/useAuthStore";
import { getMe } from "../api/auth";

import Login from "../pages/Login/Login";
import Apply from "../pages/Apply/Apply";
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
import ChatPage from "../pages/Chat/ChatPage";

function protectedLoader() {
  const { token } = useAuthStore.getState();
  if (!token) return redirect("/login");
  return null;
}

async function adminLoader() {
  let { user } = useAuthStore.getState();
  if (!user) {
    try {
      const response = await getMe();
      user = response.data;
    } catch (error) {
      console.error("Admin check failed: Could not fetch user.", error);
      return redirect("/login");
    }
  }
  if (user?.system_role_code !== '02') {
    alert('관리자만 접근할 수 있는 페이지입니다.');
    return redirect("/petitions");
  }
  return null;
}

async function nonAdminLoader() {
  let { user } = useAuthStore.getState();
  if (!user) {
    try {
      const response = await getMe();
      user = response.data;
    } catch (error) {
      console.error("Non-admin check failed: Could not fetch user.", error);
      return redirect("/login");
    }
  }
  if (user?.system_role_code === '02') {
    alert('관리자는 프로젝트를 생성할 수 없습니다.');
    return redirect("/projects");
  }
  return null;
}

async function deptManagerLoader() {
  let { user } = useAuthStore.getState();
  if (!user) {
    try {
      const response = await getMe();
      user = response.data;
    } catch (error) {
      console.error("Dept manager check failed: Could not fetch user.", error);
      return redirect("/login");
    }
  }
  const isAdmin = user?.system_role_code === '02';
  const isDeptManager = user?.position_code === '01';
  if (!isAdmin && !isDeptManager) {
    alert('부서장만 접근할 수 있는 페이지입니다.');
    return redirect("/petitions");
  }
  return null;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/apply",
    element: <Apply />,
  },
  {
    element: (
      <AuthLoader><MainLayout /></AuthLoader>
    ),
    loader: protectedLoader,
    errorElement: <NotFound />,
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
        loader: nonAdminLoader 
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
        path: "chat",
        element: <ChatPage />,
      },
      {
        path: "departments",
        element: <DepartmentList />,
        loader: deptManagerLoader
      },
      {
        path: "admin",
        element: <Admin />,
        loader: adminLoader // 관리자 전용 loader 적용
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
import { createBrowserRouter } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

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

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
    errorElement: <NotFound />,
  },
  {
    element: <MainLayout />,
    children: [
      {
        path: "home",
        element: <Home />,
      },
      {
        path: "petitions",
        element: <PetitionList />,
      },
      {
        path: "petitions/:id",
        element: <DetailPetition />,
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
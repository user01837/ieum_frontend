import { createBrowserRouter } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import Login from "../pages/Login/Login";
import PetitionList from "../pages/Petition/Petition_list";
import DetailPetition from "../pages/Petition/Detail_petition";
import Home from "../pages/Home/Home";
import NotFound from "../pages/NotFound/NotFound";
import OrgChart from "../pages/OrgChart/OrgChart";

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
      }
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
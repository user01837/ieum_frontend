import Sidebar from "../components/sidebar/Sidebar";
import { Outlet, useLocation } from "react-router-dom";
import "../styles/global.css";
import Header from "../components/header/Header";
import { format } from 'date-fns';

function MainLayout() {
  const location = useLocation();
  const formattedDate = format(new Date(), 'yyyy년 M월 d일 (E)');

  const getTitle = () => {
    const path = location.pathname;
    if (path.startsWith("/petitions")) {
      return "민원 처리";
    }
    if (path.startsWith("/orgchart")) {
      return "조직도";
    }
    if (path.startsWith("/home")) {
      return "홈";
    }
    return "IEUM";
  };

  return (
    <div className="layout">
      <Sidebar />

      <main className="content">
        <Header title={getTitle()} userName="박주임" currentDate={formattedDate} />
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
import Sidebar from "../components/sidebar/Sidebar";
import { Outlet, useLocation, useOutlet } from "react-router-dom";
import "../styles/global.css";
import Header from "../components/header/Header";
import { format } from 'date-fns';

function MainLayout() {
  const outlet = useOutlet();
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

  // DetailPetition 컴포넌트의 분할 화면 상태를 감지하여 main 태그의 스타일을 제어
  const isSplitViewActive =
    location.pathname.startsWith("/petitions/") &&
    outlet?.props?.children?.props?.isCaseDetailOpen === true;

  return (
    <div className="layout">
      <Sidebar />

      {/* isSplitViewActive가 true일 때 'no-max-width' 클래스 추가 */}
      <main className={`content ${isSplitViewActive ? 'no-max-width' : ''}`}>
        <Header title={getTitle()} userName="박주임" currentDate={formattedDate} />
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
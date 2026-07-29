import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";
import { useAnnouncementsQuery, useDeleteAnnouncementMutation } from "../../hooks/queries/useAnnouncementQuery";
import Pagination from "../../components/Pagination/Pagination";
import "./AnnouncementList.css";

export default function AnnouncementList() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.system_role_code === "02";
  const isHead = user?.position_code === "01";
  const canWrite = isAdmin || isHead;

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const { data, isLoading } = useAnnouncementsQuery({
    page: currentPage - 1,
    size: ITEMS_PER_PAGE,
  });

  const { mutate: deleteAnnouncement } = useDeleteAnnouncementMutation();

  const list = data?.content ?? [];
  const totalItems = data?.totalElements ?? 0;

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (!window.confirm("공지사항을 삭제하시겠습니까?")) return;
    deleteAnnouncement(id);
  };

  return (
    <div className="ann-content">
      <div className="pagehead">
        <div>
          <h2>공지사항</h2>
          <div className="sub">전체 공지사항을 조회합니다.</div>
        </div>
      </div>

      <div className="ann-toolbar">
        {canWrite && (
          <div className="ann-newbtn" onClick={() => navigate("/announcements/new")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
              <path d="M12 5v14M5 12h14" />
            </svg>
            공지 작성
          </div>
        )}
      </div>

      <div className="tablewrap">
        <div className="ann-trow head">
          <span>번호</span>
          <span>제목</span>
          <span>작성자</span>
          <span>작성일</span>
          {canWrite && <span></span>}
        </div>

        {list.length === 0 ? (
          <div className="ann-empty">등록된 공지사항이 없습니다.</div>
        ) : (
          list.map((a, index) => (
            <div
              key={a.announcementId}
              className="ann-trow"
              style={index === list.length - 1 ? { borderBottom: 'none' } : {}}
              onClick={() => navigate(`/announcements/${a.announcementId}`)}
            >
              <span className="ann-num">
                {a.isPinned
                  ? <span className="ann-pin">📌</span>
                  : totalItems - (currentPage - 1) * ITEMS_PER_PAGE - index
                }
              </span>
              <span className="ann-title">{a.title}</span>
              <span className="ann-meta">{a.createdByName}</span>
              <span className="ann-meta">{a.createdAt?.slice(0, 10)}</span>
              {canWrite && (
                <span className="ann-actions" onClick={(e) => e.stopPropagation()}>
                  <button className="ann-edit-btn" onClick={(e) => { e.stopPropagation(); navigate(`/announcements/${a.announcementId}/edit`); }}>수정</button>
                  <button className="ann-del-btn" onClick={(e) => handleDelete(e, a.announcementId)}>삭제</button>
                </span>
              )}
            </div>
          ))
        )}
        <div className="ann-tablefoot">
          <Pagination
            totalItems={totalItems}
            itemsPerPage={ITEMS_PER_PAGE}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}
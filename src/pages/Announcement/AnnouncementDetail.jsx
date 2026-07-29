import { useNavigate, useParams } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";
import { useAnnouncementDetailQuery, useDeleteAnnouncementMutation } from "../../hooks/queries/useAnnouncementQuery";
import "./AnnouncementList.css";

export default function AnnouncementDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const canWrite = user?.system_role_code === "02" || user?.position_code === "01";

    const { data: a, isLoading } = useAnnouncementDetailQuery(id);
    const { mutate: deleteAnnouncement } = useDeleteAnnouncementMutation();

    if (isLoading) return <div className="ann-content">불러오는 중...</div>;
    if (!a) return <div className="ann-content">존재하지 않는 공지사항입니다.</div>;

    const handleDelete = () => {
        if (!window.confirm("공지사항을 삭제하시겠습니까?")) return;
        deleteAnnouncement(id, { onSuccess: () => navigate("/announcements") });
    };

    return (
        <div className="ann-content">
            <div className="backrow">
                <div className="backbtn" onClick={() => navigate("/announcements")}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                        <path d="m15 18-6-6 6-6" />
                    </svg>
                    목록으로
                </div>
            </div>

            <div className="tablewrap" style={{ padding: '28px 32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {a.isPinned && <span className="ann-pin">📌</span>}
                        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{a.title}</h2>
                    </div>
                    {canWrite && (
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button className="ann-edit-btn" onClick={() => navigate(`/announcements/${id}/edit`)}>수정</button>
                            <button className="ann-del-btn" onClick={handleDelete}>삭제</button>
                        </div>
                    )}
                </div>

                <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 24 }}>
                    {a.departmentName} · {a.createdByName} · {a.createdAt?.slice(0, 10)}
                    {a.updatedByName && ` · 수정: ${a.updatedByName}`}
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--line)', marginBottom: 24 }} />

                <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--ink)', whiteSpace: 'pre-wrap' }}>
                    {a.content}
                </div>
            </div>
        </div>
    );
}
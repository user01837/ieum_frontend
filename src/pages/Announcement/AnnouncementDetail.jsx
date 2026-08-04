import { useNavigate, useParams } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";
import { useAnnouncementDetailQuery, useDeleteAnnouncementMutation } from "../../hooks/queries/useAnnouncementQuery";
import "./AnnouncementList.css";
import "../knowledge/KnowlDetail.css"; // 첨부파일 UI/스타일 재사용

export default function AnnouncementDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);

    const { data: a, isLoading } = useAnnouncementDetailQuery(id);
    const { mutate: deleteAnnouncement } = useDeleteAnnouncementMutation();

    if (isLoading) return <div className="ann-content">불러오는 중...</div>;
    if (!a) return <div className="ann-content">존재하지 않는 공지사항입니다.</div>;

    const isAuthor = a.createdBy === Number(user?.userId);
    const canEdit = isAuthor;
    const canDelete = isAuthor;

    const handleDelete = () => {
        if (!window.confirm("공지사항을 삭제하시겠습니까?")) return;
        deleteAnnouncement(id, { onSuccess: () => navigate("/announcements") });
    };

    return (
        <div className="ann-detail-content">
            <div className="backrow">
                <div className="backbtn" onClick={() => navigate("/announcements")}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                        <path d="m15 18-6-6 6-6" />
                    </svg>
                    목록으로
                </div>
            </div>
            <div className="crumb">
                공지사항 목록 &gt; 상세
            </div>

            <div className="tablewrap" style={{ padding: '28px 32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {a.isPinned && <span className="ann-pin">📌</span>}
                        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{a.title}</h2>
                    </div>
                    {(canEdit || canDelete) && (
                        <div style={{ display: 'flex', gap: 8 }}>
                            {canEdit && (
                                <button className="ann-edit-btn" onClick={() => navigate(`/announcements/${id}/edit`)}>수정</button>
                            )}
                            {canDelete && (
                                <button className="ann-del-btn" onClick={handleDelete}>삭제</button>
                            )}
                        </div>
                    )}
                </div>

                <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 24 }}>
                    {a.departmentName} · {a.createdByName} · {a.createdAt?.slice(0, 10)}
                    {a.updatedByName && ` · 수정: ${a.updatedByName}`}
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--line)', marginBottom: 24 }} />

                <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--ink)', whiteSpace: 'pre-wrap', minHeight: 200, marginBottom: 40 }}>
                    {a.content}
                </div>

                {a.attachments && a.attachments.length > 0 && (
                    <div className="section-card" style={{ padding: '20px', border: '1px solid var(--line-light)', borderRadius: 12, background: 'var(--surface-alt)' }}>
                        <h2 className="section-title" style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, marginTop: 0 }}>첨부파일</h2>
                        <div className="attach-list">
                            {a.attachments.map(att => (
                                <div key={att.attachmentId} className="reply-attach-chip">
                                    <svg className="ic" viewBox="0 0 24 24"><path fill="currentColor" d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 0 1 5 0v10.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c-1.93 0-3.5 1.57-3.5 3.5v11.5c0 2.76 2.24 5 5 5s5-2.24 5-5V6h-1.5z"></path></svg>
                                    <a href={att.fileUrl} target="_blank" rel="noopener noreferrer" download={att.fileName} style={{ flex: '1' }}>
                                        {att.fileName}
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
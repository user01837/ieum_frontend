import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAnnouncementDetailQuery, useCreateAnnouncementMutation, useUpdateAnnouncementMutation } from "../../hooks/queries/useAnnouncementQuery";
import "./AnnouncementList.css";

export default function AnnouncementForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: existing } = useAnnouncementDetailQuery(id);
  const { mutate: create, isPending: isCreating } = useCreateAnnouncementMutation();
  const { mutate: update, isPending: isUpdating } = useUpdateAnnouncementMutation(id);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    if (existing) {
      setTitle(existing.title);
      setContent(existing.content);
      setIsPinned(existing.isPinned);
    }
  }, [existing]);

  const handleSubmit = () => {
    if (!title.trim()) { alert("제목을 입력해 주세요."); return; }
    if (!content.trim()) { alert("내용을 입력해 주세요."); return; }

    const body = { title, content, is_pinned: isPinned };

    if (isEdit) {
      update(body, { onSuccess: () => navigate(`/announcements/${id}`) });
    } else {
      create(body, { onSuccess: (data) => navigate(`/announcements/${data.announcementId}`) });
    }
  };

  return (
    <div className="ann-content">
      <div className="backrow">
        <div className="backbtn" onClick={() => navigate(isEdit ? `/announcements/${id}` : "/announcements")}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
            <path d="m15 18-6-6 6-6" />
          </svg>
          {isEdit ? "상세로" : "목록으로"}
        </div>
      </div>

      <div className="tablewrap" style={{ padding: '28px 32px' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 24 }}>
          {isEdit ? "공지사항 수정" : "공지사항 작성"}
        </h2>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13.5, fontWeight: 700, display: 'block', marginBottom: 8 }}>제목</label>
          <input
            style={{ width: '100%', padding: '11px 13px', border: '1px solid var(--line-strong)', borderRadius: 9, fontSize: 14, fontFamily: 'inherit', outline: 'none' }}
            placeholder="제목을 입력하세요."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13.5, fontWeight: 700, display: 'block', marginBottom: 8 }}>내용</label>
          <textarea
            style={{ width: '100%', minHeight: 300, padding: '11px 13px', border: '1px solid var(--line-strong)', borderRadius: 9, fontSize: 14, fontFamily: 'inherit', outline: 'none', resize: 'vertical', lineHeight: 1.7 }}
            placeholder="내용을 입력하세요."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <input
            type="checkbox"
            id="isPinned"
            checked={isPinned}
            onChange={(e) => setIsPinned(e.target.checked)}
          />
          <label htmlFor="isPinned" style={{ fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>상단 고정</label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button
            style={{ padding: '11px 20px', border: '1px solid var(--line-strong)', borderRadius: 8, background: 'var(--surface)', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
            onClick={() => navigate(isEdit ? `/announcements/${id}` : "/announcements")}
          >
            취소
          </button>
          <button
            style={{ padding: '11px 20px', border: 'none', borderRadius: 8, background: 'var(--navy)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
            onClick={handleSubmit}
            disabled={isCreating || isUpdating}
          >
            {isCreating || isUpdating ? "저장 중..." : isEdit ? "수정 완료" : "등록"}
          </button>
        </div>
      </div>
    </div>
  );
}
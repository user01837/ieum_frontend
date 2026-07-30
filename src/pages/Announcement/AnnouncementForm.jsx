import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";
import { useDepartmentsQuery } from "../../hooks/queries/useDeptQuery";
import { useAnnouncementDetailQuery, useCreateAnnouncementMutation, useUpdateAnnouncementMutation } from "../../hooks/queries/useAnnouncementQuery";
import "./AnnouncementList.css";

export default function AnnouncementForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.system_role_code === "02";
  const { data: departments = [] } = useDepartmentsQuery();

  const { data: existing } = useAnnouncementDetailQuery(id);
  const { mutate: create, isPending: isCreating } = useCreateAnnouncementMutation();
  const { mutate: update, isPending: isUpdating } = useUpdateAnnouncementMutation(id);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [departmentCode, setDepartmentCode] = useState(
    isAdmin ? null : user?.department_code ?? null
  );
  const [isDeptOpen, setIsDeptOpen] = useState(false);
  const deptRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (deptRef.current && !deptRef.current.contains(e.target)) {
        setIsDeptOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (existing) {
      setTitle(existing.title);
      setContent(existing.content);
      setIsPinned(existing.isPinned);
      setDepartmentCode(existing.departmentCode ?? null);
    }
  }, [existing]);

  const handleSubmit = () => {
    if (!title.trim()) { alert("제목을 입력해 주세요."); return; }
    if (!content.trim()) { alert("내용을 입력해 주세요."); return; }

    const body = { title, content, is_pinned: isPinned, department_code: departmentCode };

    if (isEdit) {
      update(body, { onSuccess: () => navigate(`/announcements/${id}`) });
    } else {
      create(body, { onSuccess: (data) => navigate(`/announcements/${data.announcementId}`) });
    }
  };

  const selectedDeptName = departmentCode
    ? departments.find(d => d.code === departmentCode)?.name
    : "전체 공지";

  return (
    <div className="ann-detail-content">
      <div className="backrow">
        <div className="crumb">
          공지사항 목록 &gt; {isEdit ? "수정" : "작성"}
        </div>
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

        {isAdmin && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13.5, fontWeight: 700, display: 'block', marginBottom: 8 }}>공지 대상</label>
            <div className={`dropdown-wrap ${isDeptOpen ? "open" : ""}`} ref={deptRef} style={{ width: '100%' }}>
              <div
                className="dropdown"
                style={{ width: '100%', boxSizing: 'border-box', justifyContent: 'space-between', color: 'var(--ink)', fontSize: 14 }}
                onClick={() => setIsDeptOpen(p => !p)}
              >
                <span>{selectedDeptName}</span>
                <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
              <div className="dropdown-menu" style={{ width: '100%' }}>
                <div
                  className={`dropdown-item ${departmentCode === null ? "active" : ""}`}
                  onClick={() => { setDepartmentCode(null); setIsDeptOpen(false); }}
                >
                  전체 공지
                </div>
                {departments
                  .filter(d => d.code !== "09")
                  .map(d => (
                    <div
                      key={d.code}
                      className={`dropdown-item ${departmentCode === d.code ? "active" : ""}`}
                      onClick={() => { setDepartmentCode(d.code); setIsDeptOpen(false); }}
                    >
                      {d.name}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

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

        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 80 }}>
          <button
            style={{ padding: '11px 20px', border: 'none', borderRadius: 8, background: 'var(--navy)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
            onClick={handleSubmit}
            disabled={isCreating || isUpdating}
          >
            {isCreating || isUpdating ? "저장 중..." : isEdit ? "수정 완료" : "등록"}
          </button>
          <button
            style={{ padding: '11px 20px', border: '1px solid var(--line-strong)', borderRadius: 8, background: 'var(--surface)', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
            onClick={() => navigate(isEdit ? `/announcements/${id}` : "/announcements")}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import useAuthStore from "../../store/useAuthStore";
import { useDepartmentsQuery } from "../../hooks/queries/useDeptQuery";
import { useAnnouncementDetailQuery, useCreateAnnouncementMutation, useUpdateAnnouncementMutation } from "../../hooks/queries/useAnnouncementQuery";
import "./AnnouncementList.css";
import "../knowledge/KnowlDetail.css"; // 첨부파일 UI/스타일 재사용

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

  // 첨부파일 상태
  const [attachments, setAttachments] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [deletedFileIds, setDeletedFileIds] = useState([]);

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
      setAttachments(existing.attachments || []);
    }
  }, [existing]);

  // --- 파일 업로드 (react-dropzone) 설정 ---
  const onDrop = useCallback(acceptedFiles => {
    setNewFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: true });

  const removeNewFile = (fileToRemove) => {
    setNewFiles(prevFiles => prevFiles.filter(file => file !== fileToRemove));
  };
  const removeExistingFile = (attachmentId) => {
    if (window.confirm('이 첨부파일을 삭제하시겠습니까? (저장 시 반영됩니다)')) {
      setAttachments(prev => prev.filter(att => att.attachmentId !== attachmentId));
      setDeletedFileIds(prevIds => [...prevIds, attachmentId]);
    }
  };

  const handleSubmit = () => {
    if (!title.trim()) { alert("제목을 입력해 주세요."); return; }
    if (!content.trim()) { alert("내용을 입력해 주세요."); return; }

    const formData = new FormData();

    // 1. 텍스트 데이터를 JSON 문자열로 변환하여 'request_data' 필드에 추가
    const requestData = { title, content, is_pinned: isPinned, department_code: departmentCode };
    formData.append('request_data', JSON.stringify(requestData));

    if (isEdit) {
      // 2. 새로 추가할 파일들을 'new_files' 필드에 추가
      newFiles.forEach(file => {
        formData.append('new_files', file);
      });
      // 3. 삭제할 기존 첨부파일 ID 목록을 'deleted_file_ids' 필드에 추가 (쉼표로 구분된 문자열)
      if (deletedFileIds.length > 0) {
        formData.append('deleted_file_ids', deletedFileIds.join(','));
      }
      update(formData, { onSuccess: () => navigate(`/announcements/${id}`) });
    } else {
      // 2. 새로 추가할 파일들을 'files' 필드에 추가
      newFiles.forEach(file => {
        formData.append('files', file);
      });
      create(formData, { onSuccess: (data) => navigate(`/announcements/${data.announcementId}`) });
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

        {/* 첨부파일 섹션 추가 */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 13.5, fontWeight: 700, display: 'block', marginBottom: 8 }}>첨부파일</label>
          <div {...getRootProps({ className: `attach-addbtn ${isDragActive ? 'dropzone-active' : ''}` })} style={{ justifyContent: 'center', flexDirection: 'column', maxWidth: '100%', marginBottom: '12px' }}>
            <input {...getInputProps()} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
              파일을 드래그하거나 클릭하여 업로드
            </div>
          </div>
          {(attachments.length > 0 || newFiles.length > 0) && (
            <div className="attach-list" style={{ marginTop: '12px' }}>
              {attachments.map(att => (
                <div key={att.attachmentId} className="reply-attach-chip">
                  <svg className="ic" viewBox="0 0 24 24"><path fill="currentColor" d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 0 1 5 0v10.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c-1.93 0-3.5 1.57-3.5 3.5v11.5c0 2.76 2.24 5 5 5s5-2.24 5-5V6h-1.5z"></path></svg>
                  <a href={att.fileUrl} target="_blank" rel="noopener noreferrer" style={{ flex: '1' }}>
                    {att.fileName}
                  </a>
                  <button type="button" className="rm" onClick={() => removeExistingFile(att.attachmentId)}>
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"></path></svg>
                  </button>
                </div>
              ))}
              {newFiles.map((file, index) => (
                <div key={index} className="reply-attach-chip">
                  <svg className="ic" viewBox="0 0 24 24"><path fill="currentColor" d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 0 1 5 0v10.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c-1.93 0-3.5 1.57-3.5 3.5v11.5c0 2.76 2.24 5 5 5s5-2.24 5-5V6h-1.5z"></path></svg>
                  <span>{file.name} - {(file.size / 1024).toFixed(2)} KB</span>
                  <button type="button" className="rm" onClick={() => removeNewFile(file)}>
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"></path></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
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
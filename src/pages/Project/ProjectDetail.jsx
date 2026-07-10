import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import EmpSearchModal from "../../components/EmpSearchModal/EmpSearchModal";
import "./ProjectDetail.css";
import "./Tiptap.css";

const TiptapToolbar = ({ editor }) => {
  if (!editor) return null;
  return (
    <div className="tiptap-toolbar">
      <button type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`t-tool ${editor.isActive('bold') ? 'is-active' : ''}`}>
        <b>B</b>
      </button>
      <button type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`t-tool ${editor.isActive('italic') ? 'is-active' : ''}`}>
        <i>I</i>
      </button>
      <button type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={`t-tool ${editor.isActive('strike') ? 'is-active' : ''}`}>
        <s>S</s>
      </button>
    </div>
  );
};

export default function ProjectDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [teamMembers, setTeamMembers] = useState([]);
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [aiDraft, setAiDraft] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const exportRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: isLocked ? '승인 완료된 기획서입니다.' : '기획서 본문을 작성하세요.',
      }),
    ],
    content: '',
    editable: !isLocked,
  });

  useEffect(() => {
    if (editor) {
      editor.setEditable(!isLocked);
    }
  }, [isLocked, editor]);

  const handleAddMember = (employee) => {
    const isDuplicate = teamMembers.some((m) => m.id === employee.id);
    if (isDuplicate) return;
    setTeamMembers((prev) => [...prev, employee]);
    setIsEmpModalOpen(false);
  };

  const handleRemoveMember = (id) => {
    setTeamMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleGenDraft = () => {
    if (!title.trim()) { alert("사업명을 먼저 입력해 주세요."); return; }
    setIsAiLoading(true);
    setAiDraft("");
    // TODO: AI API 연결
    setTimeout(() => {
      setAiDraft(
        `[${title}] 사업 기획서 초안입니다.\n\n` +
        `본 사업은 관련 업무 효율화 및 서비스 개선을 목적으로 추진하며, ` +
        `관계 부서와의 협의를 통해 단계적으로 진행할 예정입니다.\n\n` +
        `추진 과정에서 발생하는 사항은 담당자를 통해 안내드리겠습니다.\n\n` +
        `감사합니다.`
      );
      setIsAiLoading(false);
    }, 2000);
  };

  const handleApplyDraft = () => {
    if (editor) {
      editor.commands.setContent(aiDraft);
    }
  };

  const handleSave = () => {
    // TODO: useProjectMutation 연결
    console.log({ id, title, desc, content: editor?.getHTML(), teamMembers });
    alert("저장되었습니다.");
  };

  const handleComplete = () => {
    if (!window.confirm("승인 완료 처리하면 더 이상 수정할 수 없습니다. 계속하시겠습니까?")) return;
    setIsLocked(true);
    // TODO: useProjectMutation 연결
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setIsExportOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="detail-content">
      <div className="backrow">
        <div className="backbtn" onClick={() => navigate("/projects")}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
            <path d="m15 18-6-6 6-6" />
          </svg>
          목록으로
        </div>
      </div>
      <div className="crumb">
        홈 &gt; 사업/프로젝트 기획 &gt; <b>{title || "기획서 수정"}</b>

      </div>

      {isLocked && (
        <div className="locked-banner">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="4" y="10" width="16" height="10" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          </svg>
          승인 완료된 기획서입니다. 더 이상 수정할 수 없습니다.
        </div>
      )}

      {/* 사업명 / 개요 */}
      <div className="dcard">
        <div className="dcard-title-row">
          <div className="section-title" style={{ margin: 0 }}>사업명</div>
          {!isLocked && (
            <div className="delbtn" onClick={() => setIsDeleteModalOpen(true)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', borderBottom: '1.5px solid #C1503D', paddingBottom: '0px' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14H6L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4h6v2" />
                </svg>
                삭제
              </div>
            </div>
          )}
        </div>
        <input
          className="dtitle-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isLocked}
          placeholder="사업명을 입력하세요."
        />
        <div className="section-title">사업 개요</div>
        <textarea
          className="desc-input"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          disabled={isLocked}
          placeholder="사업 목적, 배경, 주요 내용을 간략히 작성하세요."
        />
        <div className="formrow2">
          <div>
            <div className="section-title">시작일</div>
            <input
              type="date"
              className="dtitle-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={isLocked}
            />
          </div>
          <div>
            <div className="section-title">목표일</div>
            <input
              type="date"
              className="dtitle-input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={isLocked}
            />
          </div>
        </div>
      </div>  {/* dcard 닫기 */}

      {/* 참여 부서 */}
      <div className="dcard">
        <div className="dept-head-row">
          <div className="section-title" style={{ margin: 0 }}>참여 부서</div>
          {!isLocked && (
            <div
              className="addteam-inline"
              style={{ marginLeft: "auto", marginTop: 0 }}
              onClick={() => setIsEmpModalOpen(true)}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                <path d="M12 5v14M5 12h14" />
              </svg>
              팀원 추가
            </div>
          )}
        </div>
        <div className="participant-summary">총 {teamMembers.length}명</div>
        <div className="member-chips">
          {teamMembers.map((m) => (
            <div key={m.id} className="member-chip">
              <span className="mname">{m.name}</span>
              <span className="mdept">{m.dept}</span>
              {!isLocked && (
                <button className="rm" onClick={() => handleRemoveMember(m.id)}>
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* AI 초안 */}
      <div className="panel">
        <div className="panel-head">
          <svg width="15" height="15" style={{ marginTop: '5px' }} viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2">
            <path d="m12 3 1.9 4.9L19 9.5l-4.9 1.9L12 16l-1.9-4.9L5 9.5l4.9-1.9L12 3Z" />
          </svg>
          <span className="panel-title">AI 기획서 초안 생성</span>
        </div>
        <div className="panel-body" style={{ marginTop: '8px' }}>
          <p style={{ fontSize: '12.5px', color: 'var(--ink-soft)', lineHeight: '1.7', marginBottom: '15px' }}>
            AI가 사업명과 개요를 바탕으로 기획서 초안을 생성합니다. 초안은 참고용이며, 검토 후 작성란에 반영할 수 있습니다.
          </p>
          {isAiLoading ? (
            <div className="spinner"></div>
          ) : aiDraft ? (
            <>
              <div className="draftbox">{aiDraft}</div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <div className="applybtn" onClick={handleApplyDraft}>답변 초안 사용</div>
                <div className="applybtn" onClick={handleGenDraft}>다시 생성</div>
              </div>
            </>
          ) : (
            <div className="applybtn" onClick={handleGenDraft}>AI 답변 초안 생성</div>
          )}
        </div>
      </div>

      {/* 기획서 작성 */}
      <div className="tiptap-wrapper">
        <h3 className="dtitle" style={{ fontSize: '15px', margin: '16px 20px' }}>기획서 작성</h3>
        <div className="tiptap-editor-wrapper">
          <TiptapToolbar editor={editor} />
          <EditorContent editor={editor} className="tiptap-editor" />
        </div>
        <div className="bottomrow" style={{ padding: '0 20px 16px' }}>
          <div className={`export-wrap${isExportOpen ? " open" : ""}`} ref={exportRef}>
            <button className="btn btn-ghost" onClick={() => setIsExportOpen((p) => !p)}>
              내보내기
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {isExportOpen && (
              <div className="export-menu">
                {[
                  { label: "Word (.docx)", color: "#2453D8" },
                  { label: "한글 (.hwp)", color: "#189A5C" },
                  { label: "PDF (.pdf)", color: "#C1503D" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="export-item"
                    onClick={() => { console.log(item.label); setIsExportOpen(false); }}
                  >
                    <span className="dot" style={{ background: item.color, width: 8, height: 8, borderRadius: "50%", display: "inline-block" }} />
                    {item.label}로 내보내기
                  </div>
                ))}
              </div>
            )}
          </div>
          {!isLocked && (
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="btn btn-ghost" onClick={handleSave}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
                  <path d="M17 21v-8H7v8M7 3v5h8" />
                </svg>
                저장
              </button>
              <button className="btn btn-navy" onClick={handleComplete}>
                승인 완료
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {isDeleteModalOpen && (
        <div className="del-modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="del-modal" onClick={(e) => e.stopPropagation()}>
            <div className="del-modal-title">기획서를 삭제하시겠습니까?</div>
            <div className="del-modal-desc">삭제 후에는 복구할 수 없습니다.</div>
            <div className="del-modal-btns">
              <button className="btn btn-ghost" onClick={() => setIsDeleteModalOpen(false)}>취소</button>
              <button className="btn del-confirm-btn" onClick={() => {
                // TODO: useProjectMutation 연결
                console.log("delete", id);
                navigate("/projects");
              }}>삭제</button>
            </div>
          </div>
        </div>
      )}
      {isEmpModalOpen && (
        <EmpSearchModal
          onSelect={handleAddMember}
          onClose={() => setIsEmpModalOpen(false)}
        />
      )}
    </div>
  );
}
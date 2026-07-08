import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EmpSearchModal from "../../components/EmpSearchModal/EmpSearchModal";
import "./ProjectDetail.css";

export default function ProjectDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [teamMembers, setTeamMembers] = useState([]);
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [aiDraft, setAiDraft] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

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
      setAiDraft(`[${title}] 사업 기획서 초안입니다. 실제 AI 응답으로 교체 예정입니다.`);
      setIsAiLoading(false);
    }, 2000);
  };

  const handleApplyDraft = () => {
    setEditorContent(aiDraft);
  };

  const handleSave = () => {
    // TODO: useProjectMutation 연결
    console.log({ id, title, desc, editorContent, teamMembers });
    alert("저장되었습니다.");
  };

  const handleComplete = () => {
    if (!window.confirm("승인 완료 처리하면 더 이상 수정할 수 없습니다. 계속하시겠습니까?")) return;
    setIsLocked(true);
    // TODO: useProjectMutation 연결
  };

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
        사업/프로젝트 기획 <b>&nbsp;›&nbsp; {title || "기획서"}</b>
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
        <div className="field-label">사업명</div>
        <input
          className="dtitle-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isLocked}
          placeholder="사업명을 입력하세요."
        />
        <div className="field-label">사업 개요</div>
        <textarea
          className="desc-input"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          disabled={isLocked}
          placeholder="사업 목적, 배경, 주요 내용을 간략히 작성하세요."
        />
      </div>

      {/* 참여 부서 */}
      <div className="dcard">
        <div className="dept-head-row">
          <div className="field-label" style={{ margin: 0 }}>참여 부서</div>
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
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2">
            <path d="m12 3 1.9 4.9L19 9.5l-4.9 1.9L12 16l-1.9-4.9L5 9.5l4.9-1.9L12 3Z" />
          </svg>
          <span className="panel-title">AI 기획서 초안 생성</span>
        </div>
        <div className="panel-body">
          사업명과 개요를 바탕으로 AI가 기획서 초안을 생성합니다. 초안은 참고용이며, 검토 후 작성란에 적용할 수 있습니다.
          <br />
          <button
            className="draftbtn"
            onClick={handleGenDraft}
            disabled={isAiLoading}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m12 3 1.9 4.9L19 9.5l-4.9 1.9L12 16l-1.9-4.9L5 9.5l4.9-1.9L12 3Z" />
            </svg>
            AI 초안 생성
          </button>
          {isAiLoading && (
            <div className="ai-loading">
              <div className="ai-spinner" />
              초안을 생성하고 있습니다...
            </div>
          )}
          {aiDraft && !isAiLoading && (
            <>
              <div className="draftbox">{aiDraft}</div>
              <button className="applybtn" onClick={handleApplyDraft}>
                이 초안 기획서 작성란에 적용
              </button>
            </>
          )}
        </div>
      </div>

      {/* 기획서 작성 */}
      <div className="dcard">
        <div className="field-label">기획서 작성</div>
        <div className="editor-toolbar">
          <div className="etool" style={{ fontWeight: 800 }}>B</div>
          <div className="etool" style={{ fontStyle: "italic" }}>I</div>
          <div className="etool" style={{ textDecoration: "underline" }}>U</div>
          <div className="etool sep" />
          <div className="etool">≡</div>
          <div className="etool">"</div>
        </div>
        {/* TODO: TipTap 에디터로 교체 */}
        <div
          className={`editor-body${isLocked ? " locked" : ""}`}
          contentEditable={!isLocked}
          suppressContentEditableWarning
          data-placeholder="기획서 본문을 작성하세요."
        />

        <div className="bottomrow">
          <div className={`export-wrap${isExportOpen ? " open" : ""}`}>
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
              <button className="btn btn-good" onClick={handleComplete}>
                승인 완료
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {isEmpModalOpen && (
        <EmpSearchModal
          onSelect={handleAddMember}
          onClose={() => setIsEmpModalOpen(false)}
        />
      )}
    </div>
  );
}
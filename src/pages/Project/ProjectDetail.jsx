import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useProjectDetailQuery } from "../../hooks/queries/useProjectQuery";
import { useUpdateProjectMutation, useApproveProjectMutation, useDeleteProjectMutation } from "../../hooks/mutations/useProjectMutation";
import { exportProject, getAiDraft } from '../../api/project';
import useAuthStore from "../../store/useAuthStore";
import EmpSearchModal from "../../components/EmpSearchModal/EmpSearchModal";
import SectionEditor from "./SectionEditor";
import "./ProjectDetail.css";
import '../Petition/Detail_petition.css';
import '../../styles/global.css';
import StickySideBarButton from "../../components/StickySideBar/StickySideBarButton";
import KnowhowPanel from "../../components/knowhow/KnowhowPanel";
import CoverPage from "./CoverPage";

export default function ProjectDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: project, isLoading } = useProjectDetailQuery(id);
  const { mutate: updateProject } = useUpdateProjectMutation(id);
  const { mutate: approveProject } = useApproveProjectMutation(id);
  const { mutate: deleteProject } = useDeleteProjectMutation();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [teamMembers, setTeamMembers] = useState([]);
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [aiDraft, setAiDraft] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiChecked, setAiChecked] = useState({
    secOverview: true, secBackground: true, secGoals: true,
    secDetailedPlan: true, secSchedule: true, secExecutionSystem: true,
    secBudget: true, secExpectedEffect: true, secPostManagement: true,
  });
  const [sections, setSections] = useState({
    secOverview: "", secBackground: "", secGoals: "",
    secDetailedPlan: "", secSchedule: "", secExecutionSystem: "",
    secBudget: "", secExpectedEffect: "", secPostManagement: "",
  });
  const [openSections, setOpenSections] = useState({
    secOverview: false, secBackground: false, secGoals: false,
    secDetailedPlan: false, secSchedule: false, secExecutionSystem: false,
    secBudget: false, secExpectedEffect: false, secPostManagement: false,
  });
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const [isOverwriteModalOpen, setIsOverwriteModalOpen] = useState(false);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const exportRef = useRef(null);
  const pendingDraftRef = useRef(null);
  const isInitialized = useRef(false);
  const user = useAuthStore((state) => state.user);
  const [isKnowhowPanelOpen, setIsKnowhowPanelOpen] = useState(false);
  const [coverTitle, setCoverTitle] = useState("");

  const SECTION_LIST = [
    { key: "secOverview", label: "Ⅰ. 사업 개요" },
    { key: "secBackground", label: "Ⅱ. 추진 배경 및 필요성" },
    { key: "secGoals", label: "Ⅲ. 사업 목표" },
    { key: "secDetailedPlan", label: "Ⅳ. 세부 추진 계획" },
    { key: "secSchedule", label: "Ⅴ. 추진 일정" },
    { key: "secExecutionSystem", label: "Ⅵ. 사업 추진 체계" },
    { key: "secBudget", label: "Ⅶ. 예산 계획" },
    { key: "secExpectedEffect", label: "Ⅷ. 기대 효과" },
    { key: "secPostManagement", label: "Ⅸ. 사후 관리 계획" },
  ];

  const AI_KEY_MAP = {
    secOverview: "overview", secBackground: "background", secGoals: "goals",
    secDetailedPlan: "detailed_plan", secSchedule: "schedule",
    secExecutionSystem: "execution_system", secBudget: "budget",
    secExpectedEffect: "expected_effect", secPostManagement: "post_management",
  };

  useEffect(() => {
    if (project) {
      isInitialized.current = false;
      setTitle(project.name);
      setDesc(project.businessContent || "");
      setStartDate(project.startDate || "");
      setDueDate(project.deadline || "");
      const approved = project.stageCode === "02";
      const myRole = project.members.find((m) => String(m.userId) === String(user?.userId));
      const isOwner = myRole?.roleName === "주관";
      setIsApproved(approved);
      const isAdmin = user?.system_role_code === "02";
      setIsLocked(approved || !isOwner || isAdmin);
      setTeamMembers(
        project.members.map((m) => ({ userId: m.userId, name: m.name, departmentName: m.departmentName || "", roleName: m.roleName }))
      );
      setSections({
        secOverview: project.secOverview || "",
        secBackground: project.secBackground || "",
        secGoals: project.secGoals || "",
        secDetailedPlan: project.secDetailedPlan || "",
        secSchedule: project.secSchedule || "",
        secExecutionSystem: project.secExecutionSystem || "",
        secBudget: project.secBudget || "",
        secExpectedEffect: project.secExpectedEffect || "",
        secPostManagement: project.secPostManagement || "",
      });
      setCoverTitle(project.coverTitle || "");
      setTimeout(() => { isInitialized.current = true; }, 0);
    }
  }, [project]);

  useEffect(() => {
    if (!isInitialized.current) return;
    setIsSaved(false);
  }, [title, desc, sections, startDate, dueDate, teamMembers]);

  const handleAddMember = (employee) => {
    const isDuplicate = teamMembers.some((m) => String(m.userId) === String(employee.userId));
    if (isDuplicate) return;
    setTeamMembers((prev) => [...prev, employee]);
    setIsEmpModalOpen(false);
  };

  const handleRemoveMember = (id) => {
    setTeamMembers((prev) => prev.filter((m) => m.userId !== id));
  };

  const applyDraft = (draft, checkedKeys, keyMap) => {
    setSections((prev) => {
      const next = { ...prev };
      checkedKeys.forEach((k) => {
        const aiKey = keyMap[k];
        if (!draft[aiKey]) return;
        if (k === "secOverview") {
          // 사업 개요는 기본 틀 뒤에 AI 내용 추가
          const baseContent = prev[k]; // 현재 에디터 내용 (기본 틀)
          next[k] = baseContent + draft[aiKey];
        } else {
          next[k] = draft[aiKey];
        }
      });
      return next;
    });
    setOpenSections((prev) => {
      const next = { ...prev };
      checkedKeys.forEach((k) => { next[k] = true; });
      return next;
    });
  };

  const handleGenDraft = async () => {
    if (!title.trim()) { alert("사업명을 먼저 입력해 주세요."); return; }
    const checkedKeys = Object.keys(aiChecked).filter((k) => aiChecked[k]);
    if (checkedKeys.length === 0) { alert("적용할 섹션을 하나 이상 선택해 주세요."); return; }
    setIsAiLoading(true);
    setAiDraft(null);
    try {
      const res = await getAiDraft(id);
      if (res.data.guardrail_triggered) {
        alert("참고할 기존 사업 자료가 없어 AI 초안을 작성할 수 없습니다. 직접 사업 내용을 작성해 주세요.");
        return;
      }
      setAiDraft(res.data.draft);
    } catch {
      alert("AI 초안 생성에 실패했습니다.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleApplyDraft = () => {
    const checkedKeys = Object.keys(aiChecked).filter((k) => aiChecked[k]);
    const willOverwrite = checkedKeys.filter((k) => {
      const current = sections[k];
      return current && current.trim() !== '' && current !== '<p></p>';
    });
    if (willOverwrite.length > 0) {
      pendingDraftRef.current = { draft: aiDraft, checkedKeys, AI_KEY_MAP };
      setIsOverwriteModalOpen(true);
    } else {
      applyDraft(aiDraft, checkedKeys, AI_KEY_MAP);
    }
  };

  const handleSave = () => {
    if (!title.trim()) { alert("사업명을 입력해 주세요."); return; }
    if (!desc.trim()) { alert("사업 설명을 입력해 주세요."); return; }
    if (startDate && dueDate && new Date(dueDate) < new Date(startDate)) {
      alert("목표일은 시작일 이후여야 합니다.");
      return;
    }
    updateProject(
      {
        name: title,
        businessContent: desc,
        startDate: startDate,
        deadline: dueDate,
        overview: desc,
        secOverview: sections.secOverview,
        secBackground: sections.secBackground,
        secGoals: sections.secGoals,
        secDetailedPlan: sections.secDetailedPlan,
        secSchedule: sections.secSchedule,
        secExecutionSystem: sections.secExecutionSystem,
        secBudget: sections.secBudget,
        secExpectedEffect: sections.secExpectedEffect,
        secPostManagement: sections.secPostManagement,
        coverTitle: coverTitle,
        memberUserIds: teamMembers
          .filter((m) => m.roleName !== "주관")
          .map((m) => m.userId),
      },
      {
        onSuccess: () => { isInitialized.current = false; setIsSaved(true); alert("저장되었습니다."); },
        onError: () => alert("저장에 실패했습니다."),
      }
    );
  };

  const handleComplete = () => {
    if (!window.confirm("승인 완료 처리하면 더 이상 수정할 수 없습니다. 계속하시겠습니까?")) return;
    approveProject(undefined, {
      onSuccess: () => {
        setIsLocked(true);
        setIsApproved(true);
      },
      onError: () => alert("승인 처리에 실패했습니다."),
    });
  };

  const handleExport = async (format) => {
    if (!isSaved) {
      alert("저장 완료 후 내보내기를 이용할 수 있습니다.");
      return;
    }
    try {
      const response = await exportProject(id, format);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('내보내기에 실패했습니다.');
    }
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

  // ESC 키로 노하우 패널 닫기
  useEffect(() => {
    if (!isKnowhowPanelOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsKnowhowPanelOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isKnowhowPanelOpen]);

  // 노하우 패널 열릴 때 body 스크롤 고정
  useEffect(() => {
    if (isKnowhowPanelOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      if (scrollY) window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
  }, [isKnowhowPanelOpen]);

  if (isLoading) {
    return (
      <div className="detail-content" style={{ textAlign: 'center', padding: '50px' }}>
        <h2>기획서 정보를 불러오는 중입니다...</h2>
      </div>
    );
  }

  return (
    <div className={`split-layout${isKnowhowPanelOpen ? ' split-active' : ''}`}>
      <div className="detail-content">
        {user?.system_role_code !== '02' && !isKnowhowPanelOpen && (
          <StickySideBarButton onClick={() => setIsKnowhowPanelOpen(true)} />
        )}
        <div className="backrow">
          <div className="backbtn" onClick={() => navigate("/projects")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
              <path d="m15 18-6-6 6-6" />
            </svg>
            목록으로
          </div>
        </div>
        <div className="crumb">
          홈 &gt; 사업/프로젝트 기획 &gt; <b>기획서 작성</b>
        </div>

        {isLocked && (
          <div className="locked-banner">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="10" width="16" height="10" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
            {isApproved && user?.system_role_code !== "02"
              ? "승인 완료된 기획서입니다. 더 이상 수정할 수 없습니다."
              : user?.system_role_code === "02"
                ? "관리자 계정은 열람만 가능합니다."
                : "열람 전용입니다. 기획서 수정은 주관자만 가능합니다."}
          </div>
        )}

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
            placeholder="사업명을 입력하세요. (예: 지역 행사 유치)"
          />
          <div className="section-title">사업 개요</div>
          <textarea
            className="desc-input"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            disabled={isLocked}
            placeholder="이 사업의 목적, 배경, 주요 내용을 작성해 주세요."
          />
          <div className="formrow2">
            <div>
              <div className="section-title">시작일</div>
              <input type="date" className="dtitle-input" value={startDate}
                onChange={(e) => setStartDate(e.target.value)} disabled={isLocked} />
            </div>
            <div>
              <div className="section-title">목표일</div>
              <input type="date" className="dtitle-input" value={dueDate}
                onChange={(e) => setDueDate(e.target.value)} disabled={isLocked} />
            </div>
          </div>
        </div>

        <div className="dcard">
          <div className="dept-head-row">
            <div className="section-title" style={{ margin: 0 }}>참여 부서원</div>
            {!isLocked && (
              <div className="addteam-inline" style={{ marginLeft: "auto", marginTop: 0 }}
                onClick={() => setIsEmpModalOpen(true)}>
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
              <div key={m.userId} className={`member-chip${m.roleName === "주관" ? " member-chip--owner" : ""}`}>
                {m.roleName === "주관" && <span className="member-chip__badge">작성자</span>}
                <div style={{ textAlign: 'center' }}>
                  <span className="mdept" style={{ fontSize: '11px' }}>{m.userId}</span>
                  <div>
                    <span className="mname" style={{ fontSize: '12px' }}>{m.name}</span>
                    <span className="mdept" style={{ marginLeft: '5px', fontSize: '12px' }}>{m.departmentName}</span>
                  </div>
                </div>
                {!isLocked && m.roleName !== "주관" && (
                  <button className="rm" onClick={() => handleRemoveMember(m.userId)}>
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {user?.system_role_code !== "02" && !isLocked && (
          <div className="panel">
            <div className="panel-head" onClick={() => setIsAiPanelOpen((p) => !p)}
              style={{ cursor: 'pointer', userSelect: 'none' }}>
              <svg width="15" height="15" style={{ marginTop: '5px' }} viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2">
                <path d="m12 3 1.9 4.9L19 9.5l-4.9 1.9L12 16l-1.9-4.9L5 9.5l4.9-1.9L12 3Z" />
              </svg>
              <span className="panel-title">AI 기획서 초안 생성</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3"
                style={{ marginLeft: 'auto', transition: 'transform 0.2s', transform: isAiPanelOpen ? 'rotate(180deg)' : 'rotate(0deg)', color: 'var(--ink-tertiary)' }}>
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
            <div className="panel-body" style={{ marginTop: '8px' }}>
              <p style={{ fontSize: '12.5px', color: 'var(--ink-soft)', lineHeight: '1.7', marginBottom: isAiPanelOpen ? '8px' : '0' }}>
                적용할 섹션을 선택하고 초안을 생성하세요. 체크한 섹션만 미리보기에 표시됩니다.
              </p>
              {isAiPanelOpen && (
                <>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <label className="ai-check-label">
                        <input
                          type="checkbox"
                          className="ai-checkbox"
                          checked={Object.values(aiChecked).every(Boolean)}
                          ref={(el) => {
                            if (el) el.indeterminate =
                              Object.values(aiChecked).some(Boolean) && !Object.values(aiChecked).every(Boolean);
                          }}
                          onChange={(e) => {
                            const val = e.target.checked;
                            setAiChecked(Object.fromEntries(Object.keys(aiChecked).map((k) => [k, val])));
                          }}
                        />
                        전체 선택
                      </label>
                      <span style={{ width: '1px', height: '12px', background: 'var(--line-strong)', display: 'inline-block', verticalAlign: 'middle' }} />
                      <span style={{ fontSize: '11.5px', color: 'var(--ink-tertiary)' }}>
                        <b style={{ color: 'var(--ink)', fontWeight: 600 }}>
                          {Object.values(aiChecked).filter(Boolean).length}
                        </b>
                        {' '}/ {SECTION_LIST.length} 선택
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 155px)', gap: '4px 0' }}>
                      {SECTION_LIST.map(({ key, label }) => (
                        <label key={key} className="ai-check-label">
                          <input
                            type="checkbox"
                            className="ai-checkbox"
                            checked={aiChecked[key]}
                            onChange={(e) => setAiChecked((prev) => ({ ...prev, [key]: e.target.checked }))}
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>
                  {isAiLoading ? (
                    <div className="spinner"></div>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div
                        className="applybtn"
                        onClick={!isLocked ? handleGenDraft : undefined}
                        style={{ opacity: isLocked ? 0.4 : 1, cursor: isLocked ? 'not-allowed' : 'pointer' }}
                      >
                        AI 초안 생성
                      </div>
                      {aiDraft && (
                        <div
                          className="applybtn"
                          onClick={!isLocked ? handleGenDraft : undefined}
                          style={{ opacity: isLocked ? 0.4 : 1, cursor: isLocked ? 'not-allowed' : 'pointer' }}
                        >
                          다시 생성
                        </div>
                      )}
                    </div>
                  )}
                  {aiDraft && (
                    <div style={{ marginTop: '14px', borderTop: '1px solid #D7E3FC', paddingTop: '14px' }}>
                      <div style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--ink)', marginBottom: '10px' }}>
                        AI 초안 미리보기
                      </div>
                      {SECTION_LIST.map(({ key, label }) => {
                        if (!aiChecked[key]) return null;
                        const aiKey = AI_KEY_MAP[key];
                        return (
                          <div key={key} style={{
                            background: 'var(--surface)', border: '1px solid #D7E3FC',
                            borderRadius: '9px', padding: '12px 14px', marginBottom: '8px'
                          }}>
                            <div style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--blue)', marginBottom: '6px' }}>
                              {label}
                            </div>
                            <div
                              style={{ fontSize: '12px', color: 'var(--ink)', lineHeight: '1.8' }}
                              dangerouslySetInnerHTML={{ __html: aiDraft[aiKey] || '<p style="color:var(--ink-tertiary)">내용 없음</p>' }}
                            />
                          </div>
                        );
                      })}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                        <button className="btn btn-navy" style={{ fontSize: '12px', padding: '8px 16px' }}
                          onClick={handleApplyDraft}>
                          답변 적용
                        </button>
                        <span style={{ fontSize: '11.5px', color: 'var(--ink-soft)' }}>
                          체크한 섹션({Object.keys(aiChecked).filter(k => aiChecked[k]).length}개)에만 적용됩니다.
                        </span>
                      </div>
                      <div style={{
                        marginTop: '8px', fontSize: '11.5px', color: 'var(--ink-tertiary)'
                      }}>
                        ※ AI 초안은 참고용입니다. 내용을 반드시 검토 후 활용하세요.
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        <div className="tiptap-wrapper">
          <h3 className="dtitle" style={{ fontSize: '15px', margin: '16px 20px' }}>기획서 작성</h3>
          <CoverPage
            coverTitle={coverTitle}
            onChange={(val) => { setCoverTitle(val); setIsSaved(false); }}
            isLocked={isLocked}
            projectData={project}
          />
          {SECTION_LIST.map(({ key, label }) => (
            <SectionEditor
              key={key}
              label={label}
              content={sections[key]}
              onChange={(html) => setSections((prev) => ({ ...prev, [key]: html }))}
              isLocked={isLocked}
              isOpen={openSections[key]}
              onToggle={() => setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))}
              projectData={project}
            />
          ))}
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
                    { label: "Word (.docx)", color: "#2B579A", format: "docx" },
                    { label: "한글 (.hwpx)", color: "#4CAF50", format: "hwpx" },
                    { label: "PDF (.pdf)", color: "#EC1C24", format: "pdf" },
                  ].map((item) => (
                    <div key={item.label} className="export-item"
                      onClick={() => { handleExport(item.format); setIsExportOpen(false); }}>
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
                  deleteProject(id, {
                    onSuccess: () => navigate("/projects"),
                    onError: () => alert("삭제에 실패했습니다."),
                  });
                }}>삭제</button>
              </div>
            </div>
          </div>
        )}
        {isOverwriteModalOpen && (
          <div className="del-modal-overlay" onClick={() => setIsOverwriteModalOpen(false)}>
            <div className="del-modal" onClick={(e) => e.stopPropagation()}>
              <div className="del-modal-title">기존 내용을 덮어쓰시겠습니까?</div>
              <div className="del-modal-desc">
                이미 작성된 섹션이 있습니다. AI 초안을 적용하면 해당 내용이 교체됩니다.
              </div>
              <div className="del-modal-btns">
                <button className="btn btn-ghost" onClick={() => {
                  setIsOverwriteModalOpen(false);
                  pendingDraftRef.current = null;
                }}>취소</button>
                <button className="btn btn-navy" onClick={() => {
                  const { draft, checkedKeys, AI_KEY_MAP: keyMap } = pendingDraftRef.current;
                  applyDraft(draft, checkedKeys, keyMap);
                  setIsOverwriteModalOpen(false);
                  pendingDraftRef.current = null;
                }}>적용</button>
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
      {/* ▼ 노하우 작성 패널 */}
      <div className={`case-detail-panel ${isKnowhowPanelOpen ? 'open' : ''}`}>
        {isKnowhowPanelOpen && (
          <KnowhowPanel onClose={() => setIsKnowhowPanelOpen(false)} />
        )}
      </div>

    </div>
  );
}
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./ProjectList.css";
import { useProjectsQuery } from "../../hooks/queries/useProjectQuery";
import Pagination from "../../components/Pagination/Pagination";


export default function ProjectList() {
  const navigate = useNavigate();

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isScopeOpen, setIsScopeOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [statusFilter, setStatusFilter] = useState("01");
  const [scopeFilter, setScopeFilter] = useState("MY");
  const STATUS_OPTIONS = ["01", "02"];
  const STATUS_LABEL = { "01": "저장", "02": "승인완료" };
  const SCOPE_OPTIONS = ["MY", "JOINED", "PREDECESSOR"];
  const SCOPE_LABEL = { "MY": "주관", "JOINED": "참여", "PREDECESSOR": "전임자" };
  const scopeRef = useRef(null);
  const statusRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (scopeRef.current && !scopeRef.current.contains(e.target)) {
        setIsScopeOpen(false);
      }
      if (statusRef.current && !statusRef.current.contains(e.target)) {
        setIsStatusOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data, isLoading } = useProjectsQuery({
    scope: scopeFilter,
    stage: statusFilter,
    page: currentPage - 1,
    size: ITEMS_PER_PAGE,
  });

  const projectList = data?.content ?? [];
  const totalItems = data?.totalElements ?? 0;


  return (
    <div className="project-content">
      <div className="pagehead">
        <div>
          <h2>기획서 목록</h2>
          <div className="sub">
            개인 작성 중인 사업/프로젝트 기획서를 관리합니다. 항목을 클릭하면 기획서 작성 화면으로 이동합니다.
          </div>
        </div>
      </div>

      <div className="toolbar">
        {/* scope 드롭다운 */}
        <div className={`dropdown-wrap ${isScopeOpen ? "open" : ""}`} ref={scopeRef}>
          <div className="dropdown" onClick={() => setIsScopeOpen((p) => !p)}>
            <span>{SCOPE_LABEL[scopeFilter]}</span>
            <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
          <div className="dropdown-menu">
            {SCOPE_OPTIONS.map((s) => (
              <div
                key={s}
                className={`dropdown-item ${scopeFilter === s ? "active" : ""}`}
                onClick={() => { setScopeFilter(s); setIsScopeOpen(false); setCurrentPage(1); }}
              >
                {SCOPE_LABEL[s]}
              </div>
            ))}
          </div>
        </div>
        {/* stage 드롭다운 */}
        <div className={`dropdown-wrap ${isStatusOpen ? "open" : ""}`} ref={statusRef}>
          <div className="dropdown" onClick={() => setIsStatusOpen((p) => !p)}>
            <span>{STATUS_LABEL[statusFilter]}</span>
            <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
          <div className="dropdown-menu">
            {STATUS_OPTIONS.map((s) => (
              <div
                key={s}
                className={`dropdown-item ${statusFilter === s ? "active" : ""}`}
                onClick={() => { setStatusFilter(s); setIsStatusOpen(false); setCurrentPage(1); }}
              >
                {STATUS_LABEL[s]}
              </div>
            ))}

          </div>
        </div>

        <div className="project-newbtn" onClick={() => navigate("/projects/new")}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
            <path d="M12 5v14M5 12h14" />
          </svg>
          새 프로젝트 생성
        </div>
      </div>
      <div className="tablewrap">
        <div className="project-trow head">
          <span>시작일</span>
          <span>목표일</span>
          <span>프로젝트명 / 부서명</span>
          <span>구분</span>
          <span>진행상태</span>
          <span></span>
        </div>

        {projectList.length === 0 ? (
          <div className="project-emptystate">등록된 프로젝트가 없습니다.</div>
        ) : (
          projectList.map((project, index) => (
            <div
              key={project.projectId}
              className="project-trow"
              style={index === projectList.length - 1 ? { borderBottom: 'none' } : {}}
              onClick={() => navigate(`/projects/${project.projectId}`)}
            >
              <span className="project-datecell">{project.startDate}</span>
              <span className="project-datecell">{project.deadline}</span>
              <div>
                <div className="project-title">{project.name}</div>
                <div className="project-subline">{project.departmentName}</div>
              </div>
              <span className="status">
                <span className="dot" style={{
                  background: project.roleType === "MY" ? "var(--blue)" :
                    project.roleType === "JOINED" ? "var(--good)" :
                      "var(--warn)"
                }} />
                {SCOPE_LABEL[project.roleType]}
              </span>
              <span className="status">
                <span
                  className="dot"
                  style={{
                    background: project.stageName === "승인완료" ? "var(--good)" : "var(--blue)"
                  }}
                />
                {project.stageName}
              </span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </div>
          ))
        )}
        <div className="project-tablefoot">
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
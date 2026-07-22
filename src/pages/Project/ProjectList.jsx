import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./ProjectList.css";
import { useProjectsQuery } from "../../hooks/queries/useProjectQuery";
import Pagination from "../../components/Pagination/Pagination";
import useAuthStore from "../../store/useAuthStore";
import { useDepartmentsQuery } from "../../hooks/queries/useDeptQuery";


export default function ProjectList() {
  const navigate = useNavigate();

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isScopeOpen, setIsScopeOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [statusFilter, setStatusFilter] = useState("01");
  const [scopeFilter, setScopeFilter] = useState("MY");
  const STATUS_OPTIONS = ["01", "02"];
  const STATUS_LABEL = { "01": "저장", "02": "승인완료" };
  const SCOPE_OPTIONS = ["MY", "JOINED", "PREDECESSOR"];
  const SCOPE_LABEL = { "MY": "주관", "JOINED": "참여", "PREDECESSOR": "전임자", "ADMIN": "전체" };
  const scopeRef = useRef(null);
  const statusRef = useRef(null);
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.system_role_code === "02";
  const { data: departments = [] } = useDepartmentsQuery();
  const [deptFilter, setDeptFilter] = useState(null);
  const [isDeptOpen, setIsDeptOpen] = useState(false);
  const deptRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (scopeRef.current && !scopeRef.current.contains(e.target)) {
        setIsScopeOpen(false);
      }
      if (statusRef.current && !statusRef.current.contains(e.target)) {
        setIsStatusOpen(false);
      }
      if (deptRef.current && !deptRef.current.contains(e.target)) {
        setIsDeptOpen(false);
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
    keyword: searchKeyword,
    departmentCode: deptFilter,
  });

  const projectList = data?.content ?? [];
  const totalItems = data?.totalElements ?? 0;


  return (
    <div className="project-content">
      <div className="pagehead">
        <div>
          <h2>기획서 목록</h2>
          <div className="sub">
            개인이 작성 중인 사업 및 프로젝트 기획서를 관리합니다. 목록 선택 시 해당 기획서 작성 화면으로 이동하며, 시작일 기준으로 정렬됩니다.
          </div>
        </div>
      </div>

      <div className="project-toolbar">
        {/* 윗줄: 새 프로젝트 생성 버튼 */}
        <div className="project-toolbar-top">
          {!isAdmin && (
            <div className="project-newbtn" onClick={() => navigate("/projects/new")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                <path d="M12 5v14M5 12h14" />
              </svg>
              새 프로젝트 생성
            </div>
          )}
        </div>

        {/* 아랫줄: 드롭다운 + 검색 */}
        <div className="project-toolbar-bottom">
          {/* scope 드롭다운 */}
          {isAdmin ? null : (
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
                    onClick={() => {
                      setScopeFilter(s);
                      setIsScopeOpen(false);
                      setCurrentPage(1);
                      if (s === "PREDECESSOR") setStatusFilter("02");
                    }}
                  >
                    {SCOPE_LABEL[s]}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 부서 드롭다운 - 관리자만 */}
          {isAdmin && (
            <div className={`dropdown-wrap ${isDeptOpen ? "open" : ""}`} ref={deptRef}>
              <div className="dropdown" onClick={() => setIsDeptOpen((p) => !p)}>
                <span>{deptFilter ? departments.find(d => d.code === deptFilter)?.name : "전체 부서"}</span>
                <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
              <div className="dropdown-menu">
                <div
                  className={`dropdown-item ${deptFilter === null ? "active" : ""}`}
                  onClick={() => { setDeptFilter(null); setIsDeptOpen(false); setCurrentPage(1); }}
                >
                  전체 부서
                </div>
                {departments
                  .filter(d => d.code !== "09")
                  .map((d) => (
                    <div
                      key={d.code}
                      className={`dropdown-item ${deptFilter === d.code ? "active" : ""}`}
                      onClick={() => { setDeptFilter(d.code); setIsDeptOpen(false); setCurrentPage(1); }}
                    >
                      {d.name}
                    </div>
                  ))}
              </div>
            </div>
          )}

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

          {/* 검색 영역 */}
          <div className="project-search-area">
            <div className="project-search-wrap" style={{ position: 'relative' }}>
              <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--ink-tertiary)' }}>
                <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
              </svg>
              <input
                placeholder="제목으로 검색"
                style={{ width: 240, padding: '9px 12px 9px 36px', border: '1px solid var(--line-strong)', borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit', outline: 'none' }}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setSearchKeyword(searchInput);
                    setCurrentPage(1);
                  }
                }}
              />
            </div>
            <button
              className="project-search-btn"
              onClick={() => { setSearchKeyword(searchInput); setCurrentPage(1); }}
            >
              검색
            </button>
            <button
              className="project-search-reset"
              onClick={() => { setSearchInput(""); setSearchKeyword(""); setCurrentPage(1); }}
            >
              초기화
            </button>
          </div>
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
              <span className="project-datecell deadline">{project.deadline}</span>
              <div>
                <div className="project-title">{project.name}</div>
                <div className="project-subline">{project.departmentName}</div>
              </div>
              <span className="status">
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
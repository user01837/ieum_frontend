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
  const [scopeFilter, setScopeFilter] = useState("ALL");
  const [roleFilter, setRoleFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const SCOPE_OPTIONS = ["ALL", "MY", "PREDECESSOR"];
  const SCOPE_LABEL = { "ALL": "전체", "MY": "내 사업", "PREDECESSOR": "전임자" };
  const ROLE_OPTIONS = [null, "01", "02"];
  const ROLE_LABEL = { null: "전체", "01": "주관", "02": "협력" };
  const STATUS_OPTIONS = [null, "01", "02"];
  const STATUS_LABEL = { null: "전체", "01": "저장", "02": "승인완료" };
  const scopeRef = useRef(null);
  const statusRef = useRef(null);
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.system_role_code === "02";
  const { data: departments = [] } = useDepartmentsQuery();
  const [deptFilter, setDeptFilter] = useState(null);
  const [isDeptOpen, setIsDeptOpen] = useState(false);
  const deptRef = useRef(null);
  const roleRef = useRef(null);
  const [isRoleOpen, setIsRoleOpen] = useState(false);

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
      if (roleRef.current && !roleRef.current.contains(e.target)) {
        setIsRoleOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data, isLoading } = useProjectsQuery({
    scope: scopeFilter,
    role: roleFilter,
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
            사업 및 프로젝트 기획서를 조회·관리합니다. 항목을 선택하면 상세 기획 화면으로 이동하며, 시작일 기준으로 정렬됩니다.
          </div>
        </div>
      </div>

      <div className="project-toolbar">
        {/* 윗줄: 새 프로젝트 생성 버튼 */}
        {!isAdmin && (
          <div className="project-toolbar-top">
            <div className="project-newbtn" onClick={() => navigate("/projects/new")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                <path d="M12 5v14M5 12h14" />
              </svg>
              새 프로젝트 생성
            </div>
          </div>
        )}

        {/* 아랫줄: 드롭다운 + 검색 */}
        <div className="project-toolbar-bottom">
          {/* scope 드롭다운 */}
          {isAdmin ? null : (
            <div className={`dropdown-wrap ${isScopeOpen ? "open" : ""}`} ref={scopeRef}>
              <div className="dropdown" onClick={() => setIsScopeOpen((p) => !p)}>
                <span>범위: {SCOPE_LABEL[scopeFilter]}</span>
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

          {/* 역할 드롭다운 */}
          {!isAdmin && (
            <div className={`dropdown-wrap ${isRoleOpen ? "open" : ""}`} ref={roleRef}>
              <div className="dropdown" onClick={() => setIsRoleOpen((p) => !p)}>
                <span>역할: {ROLE_LABEL[roleFilter]}</span>
                <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
              <div className="dropdown-menu">
                {ROLE_OPTIONS.map((r) => (
                  <div
                    key={String(r)}
                    className={`dropdown-item ${roleFilter === r ? "active" : ""}`}
                    onClick={() => {
                      setRoleFilter(r);
                      setIsRoleOpen(false);
                      setCurrentPage(1);
                    }}
                  >
                    {ROLE_LABEL[r]}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* stage 드롭다운 */}
          <div className={`dropdown-wrap ${isStatusOpen ? "open" : ""}`} ref={statusRef}>
            <div className="dropdown" onClick={() => setIsStatusOpen((p) => !p)}>
              <span>상태: {STATUS_LABEL[statusFilter]}</span>
              <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
            <div className="dropdown-menu">
              {STATUS_OPTIONS.map((s) => (
                <div
                  key={String(s)}
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
          <span>역할</span>
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
              <span className="status" style={{ justifyContent: 'center' }}>
                {isAdmin ? "전체" : (ROLE_LABEL[project.roleType] ?? "-")}
              </span>
              <span className="status" style={{ justifyContent: 'flex-start' }}>
                <span className="dot" style={{ background: project.stageName === "승인완료" ? "var(--good)" : "var(--blue)" }} />
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
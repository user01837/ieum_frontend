import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProjectList.css";
import { PROJECTS } from "./data"; // ← 추가

export default function ProjectList() {
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState("저장");
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  const STATUS_OPTIONS = ["저장", "승인완료"];

  // 필터 적용
  const projectList = PROJECTS.filter((p) => p.status === statusFilter);

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
        <div className={`dropdown-wrap ${isStatusOpen ? "open" : ""}`}>
          <div className="dropdown" onClick={() => setIsStatusOpen((p) => !p)}>
            <span>{statusFilter}</span>
            <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
          <div className="dropdown-menu">
            {STATUS_OPTIONS.map((s) => (
              <div
                key={s}
                className={`dropdown-item ${statusFilter === s ? "active" : ""}`}
                onClick={() => { setStatusFilter(s); setIsStatusOpen(false); }}
              >
                {s}
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
          <span>프로젝트명 / 부서</span>
          <span>시작일</span>
          <span>기한</span>
          <span>상태</span>
          <span></span>
        </div>

        {projectList.length === 0 ? (
          <div className="project-emptystate">등록된 프로젝트가 없습니다.</div>
        ) : (
          projectList.map((project) => (
            <div
              key={project.id}
              className="project-trow"
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <div>
                <div className="project-title">{project.title}</div>
                <div className="project-subline">{project.dept}</div>
              </div>
              <span className="project-datecell">{project.startDate}</span>
              <span className="project-datecell">{project.dueDate}</span>
              <span className="status">
                <span
                  className="dot"
                  style={{
                    background: project.status === "승인완료" ? "var(--good)" : "var(--blue)",
                  }}
                />
                {project.status}
              </span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
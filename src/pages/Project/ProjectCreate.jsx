import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateProjectMutation } from "../../hooks/mutations/useProjectMutation";
import EmpSearchModal from "../../components/EmpSearchModal/EmpSearchModal";
import useAuthStore from "../../store/useAuthStore";
import "./ProjectCreate.css";

export default function ProjectCreate() {

  const user = useAuthStore((state) => state.user);
  const { mutate: createProject, isPending } = useCreateProjectMutation();

  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [teamMembers, setTeamMembers] = useState([]);
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);

  const handleAddMember = (employee) => {
    const isDuplicate = teamMembers.some((m) => m.id === employee.id);
    if (isDuplicate) return;
    setTeamMembers((prev) => [...prev, employee]);
    setIsEmpModalOpen(false);
  };

  const handleRemoveMember = (id) => {
    setTeamMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSubmit = () => {
    if (!title.trim()) { alert("사업명을 입력해 주세요."); return; }
    if (!startDate || !dueDate) { alert("시작일과 목표일을 입력해 주세요."); return; }

    createProject(
      {
        name: title,
        businessContent: desc,
        startDate: startDate,
        deadline: dueDate,
        memberUserIds: teamMembers.map((m) => m.userId),
      },
      {
        onSuccess: () => {
          navigate("/projects");
        },
        onError: () => {
          alert("프로젝트 생성에 실패했습니다.");
        },
      }
    );
  };

  return (
    <div className="create-content">
      <div className="backrow">
        <div className="backbtn" onClick={() => navigate("/projects")}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
            <path d="m15 18-6-6 6-6" />
          </svg>
          목록으로
        </div>
      </div>
      <div className="crumb">
        홈 &gt; 사업/프로젝트 기획 &gt; <b>새 프로젝트 생성</b>
      </div>

      <div className="formcard">
        <div className="field">
          <label>사업명</label>
          <input
            className="input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="사업명을 입력하세요. (예: 지역 행사 유치)"
          />
        </div>

        <div className="field">
          <label>사업 설명</label>
          <textarea
            className="input"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="이 사업의 목적과 추진 배경을 간략히 작성해 주세요."
          />
        </div>

        <div className="field">
          <label>주관 부서</label>
          <input
            className="input"
            type="text"
            value={user?.deptName || ""}
            readOnly
          />
          {/* TODO: useAuth()로 로그인 유저 부서 표시 */}
        </div>

        <div className="formrow2">
          <div className="field">
            <label>시작일</label>
            <input
              className="input"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="field">
            <label>목표일</label>
            <input
              className="input"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <div className="field">
          <label>협업 부서 팀원 추가</label>
          <div className="hint">
            함께 참고할 팀원을 표시용으로 추가합니다. 기획서에 참여 정보로만 표시됩니다.
          </div>
          <div className="addteam-inline" onClick={() => setIsEmpModalOpen(true)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
              <path d="M12 5v14M5 12h14" />
            </svg>
            팀원 추가
          </div>
          <div className="teamchips">
            {teamMembers.map((m) => (
              <div key={m.id} className="teamchip">
                {m.name} ({m.dept})
                <button className="rm" onClick={() => handleRemoveMember(m.id)}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="formfoot">
          <button className="btn btn-ghost" onClick={() => navigate("/projects")}>
            취소
          </button>
          <button className="btn btn-navy" onClick={handleSubmit} disabled={isPending}>
            {isPending ? "생성 중..." : "프로젝트 생성"}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
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
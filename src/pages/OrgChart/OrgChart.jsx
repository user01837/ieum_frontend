import React, { useState } from 'react';
import './OrgChart.css';

// ====== 더미 데이터 ======
const MOCK_DATA = {
  "행정복지과": [
    { position: "과장", name: "김철수", id: "2001" },
    { position: "팀장", name: "이영희", id: "2101" },
    { position: "팀장", name: "홍길동", id: "2110" },
    { position: "팀장", name: "김도윤", id: "2120" },
    { position: "주무관", name: "박민수", id: "2102" },
    { position: "주무관", name: "최지은", id: "2103" },
    { position: "주무관", name: "김민준", id: "2104" },
    { position: "주무관", name: "김하늘", id: "2111" },
    { position: "주무관", name: "이민호", id: "2112" },
    { position: "주무관", name: "정유진", id: "2113" },
    { position: "주무관", name: "오세훈", id: "2121" },
    { position: "주무관", name: "이소영", id: "2122" }
  ],
  "도로교통과": [
    { position: "과장", name: "서지훈", id: "3001" },
    { position: "팀장", name: "한서준", id: "3101" },
    { position: "주무관", name: "임채원", id: "3102" },
    { position: "주무관", name: "송지호", id: "3103" }
  ],
  "문화도시과": [
    { position: "과장", name: "노태우", id: "4001" },
    { position: "팀장", name: "권나라", id: "4101" },
    { position: "팀장", name: "장민재", id: "4110" },
    { position: "주무관", name: "박주임", id: "4102" },
    { position: "주무관", name: "윤서연", id: "4111" },
    { position: "주무관", name: "고은지", id: "4112" },
    { position: "계장", name: "천용택", id: "4130" }
  ],
  "환경과": [
    { position: "과장", name: "문가영", id: "5001" },
    { position: "팀장", name: "배수지", id: "5101" },
    { position: "주무관", name: "안유진", id: "5102" }
  ],
  "건설과": [
    { position: "과장", name: "유재석", id: "6001" },
    { position: "팀장", name: "강호동", id: "6101" },
    { position: "팀장", name: "이수근", id: "6110" },
    { position: "주무관", name: "김종국", id: "6102" },
    { position: "주무관", name: "송지효", id: "6111" }
  ],
  "기획예산과": [
    { position: "과장", name: "정형돈", id: "7001" },
    { position: "팀장", name: "하하", id: "7101" },
    { position: "주무관", name: "지석진", id: "7102" }
  ]
};

// 화이트리스트: 이 3개 값만 정식 티어로 인식
const KNOWN_POSITIONS = ["과장", "팀장", "주무관"];

export default function OrgChart() {
  const [selectedDept, setSelectedDept] = useState("행정복지과");

  // 부서 변경 핸들러
  const handleDeptChange = (e) => {
    setSelectedDept(e.target.value);
  };

  // 이름 이니셜 추출 함수 (뒤의 2글자 반환)
  const getInitials = (name) => {
    return name.length >= 2 ? name.slice(-2) : name;
  };

  const members = MOCK_DATA[selectedDept] || [];

  // 직급별 데이터 분류
  const manager = members.find(m => m.position === "과장");
  const leads = members.filter(m => m.position === "팀장");
  const staff = members.filter(m => m.position === "주무관");
  const others = members.filter(m => !KNOWN_POSITIONS.includes(m.position));

  return (
    <>
      <div className="org-panel">
        <div className="org-panel-header">
          <h2>조직 구성</h2>
          <div className="org-panel-controls">
            <select id="deptSelect" value={selectedDept} onChange={handleDeptChange}>
              <option value="행정복지과">행정복지과</option>
              <option value="도로교통과">도로교통과</option>
              <option value="문화도시과">문화도시과</option>
              <option value="환경과">환경과</option>
              <option value="건설과">건설과</option>
              <option value="기획예산과">기획예산과</option>
            </select>
            <span className="org-total-count">총 <strong>{members.length}</strong>명</span>
          </div>
        </div>

        <div className="org-tree">
          {members.length === 0 ? (
            <div className="org-empty-state">등록된 인원이 없습니다.</div>
          ) : (
            <>
              {/* 과장 (Manager) */}
              {manager && (
                <>
                  <div className="org-node-manager">
                    <div className="org-avatar">{getInitials(manager.name)}</div>
                    <div>
                      <div className="org-rank">과장</div>
                      <div className="org-name">{manager.name}</div>
                    </div>
                  </div>
                  {leads.length > 0 && <div className="org-stem"></div>}
                </>
              )}

              {/* 팀장 (Leads) */}
              {leads.length > 0 && (
                <div className="org-lead-row">
                  {leads.map(p => (
                    <div className="org-node-lead" key={p.id}>
                      <div className="org-avatar">{getInitials(p.name)}</div>
                      <div>
                        <div className="org-rank">팀장</div>
                        <div className="org-name">{p.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 주무관 (Staff) */}
              {staff.length > 0 && (
                <div className="org-staff-section">
                  <div className="org-staff-label">주무관 · {staff.length}명</div>
                  <div className="org-staff-chips">
                    {staff.map(p => (
                      <span className="org-chip" key={p.id}>
                        <span className="org-avatar">{getInitials(p.name)}</span>
                        {p.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 기타 그룹 폴백 (Others) */}
              {others.length > 0 && (
                <div className="org-other-section">
                  <div className="org-other-label">기타 · {others.length}명 — 직급 매핑이 필요한 인원입니다</div>
                  <div className="org-other-chips">
                    {others.map(p => (
                      <span className="org-chip-other" key={p.id}>
                        <span className="org-avatar">{getInitials(p.name)}</span>
                        {p.name}
                        <span className="org-raw-position">({p.position})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

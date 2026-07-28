import React, { useState, useEffect, useMemo, useRef } from 'react';
import './OrgChart.css';
import '../Petition/Petition_list.css'; // 공용 드롭다운 스타일 추가
import { useDepartmentsQuery, useDepartmentMembersQuery } from '../../hooks/queries/useDeptQuery';

// 화이트리스트: 이 값들만 정식 직책으로 인식 (관리자 추가)
const KNOWN_POSITIONS = ["부장", "팀장", "주무관", "관리자"];

export default function OrgChart() {
  const [selectedDeptCode, setSelectedDeptCode] = useState(null);
  const [isDeptOpen, setIsDeptOpen] = useState(false);
  const deptDropdownRef = useRef(null);

  const { data: departments, isLoading: isLoadingDepts } = useDepartmentsQuery();

  // 부서 목록이 로드되면 첫 번째 부서를 기본으로 선택
  useEffect(() => {
    if (!selectedDeptCode && departments && departments.length > 0) {
      setSelectedDeptCode(departments[0].code);
    }
  }, [departments, selectedDeptCode]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (deptDropdownRef.current && !deptDropdownRef.current.contains(e.target)) {
        setIsDeptOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: members, isLoading: isLoadingMembers } = useDepartmentMembersQuery(selectedDeptCode);

  // 부서 변경 핸들러
  const handleDeptSelect = (deptCode) => {
    setSelectedDeptCode(deptCode);
    setIsDeptOpen(false);
  };

  // 이름 이니셜 추출 함수 (뒤의 2글자 반환)
  const getInitials = (name) => {
    return name.length >= 2 ? name.slice(-2) : name;
  };

  // 직급별 데이터 분류 (useMemo로 캐싱)
  const { manager, leads, staff, others } = useMemo(() => {
    if (!members) return { manager: null, leads: [], staff: [], others: [] };

    let topManager = null;
    let remainingMembers = [...members];

    
    // 다른 부서인 경우, '부장'을 최상위 관리자로 찾습니다.
    topManager = members.find((m) => m.positionName === '부장');
    if (topManager) {
      remainingMembers = members.filter((m) => m.userId !== topManager.userId);
    }

    const leads = remainingMembers.filter((m) => m.positionName === '팀장');
    const staff = remainingMembers.filter((m) => m.positionName === '주무관' || !m.positionName);
    const others = remainingMembers.filter(
      (m) => m.positionName && !KNOWN_POSITIONS.includes(m.positionName)
    );

    return { manager: topManager, leads, staff, others };
  }, [members, selectedDeptCode]);

  return (
    <>
      <div className="org-panel">
        <div className="org-panel-header">
          <h2>조직 구성</h2>
          <div className="org-panel-controls">
            <div className={`dropdown-wrap ${isDeptOpen ? "open" : ""}`} ref={deptDropdownRef} style={{ minWidth: 'fit-content' }}>
              <div className="dropdown" onClick={() => !isLoadingDepts && setIsDeptOpen(p => !p)}>
                <span>
                  {isLoadingDepts
                    ? '부서 로딩중...'
                    : departments?.find(d => d.code === selectedDeptCode)?.name || '부서 선택'
                  }
                </span>
                <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6" /></svg>
              </div>
              <div className="dropdown-menu">
                {departments?.map(dept => (
                  <div
                    key={dept.code}
                    className={`dropdown-item ${selectedDeptCode === dept.code ? 'active' : ''}`}
                    onClick={() => handleDeptSelect(dept.code)}
                  >
                    {dept.name}
                  </div>
                ))}
              </div>
            </div>
            <span className="org-total-count">총 <strong>{members?.length || 0}</strong>명</span>
          </div>
        </div>

        <div className="org-tree">
          {isLoadingMembers ? (
            <div className="org-empty-state">조직원 정보를 불러오는 중입니다...</div>
          ) : !members || members.length === 0 ? (
            <div className="org-empty-state">등록된 인원이 없습니다.</div>
          ) : (
            <>
              {/* 부장 (Manager) */}
              {manager && (
                <>
                  <div className="org-node-manager">
                    <div className="org-avatar">{getInitials(manager.name)}</div>
                    <div>
                      <div className="org-rank">{manager.positionName}</div>
                      <div className="org-name">{manager.name} <span className="org-userid">({manager.userId})</span></div>
                    </div>
                  </div>
                  {(leads.length > 0 || staff.length > 0 || others.length > 0) && <div className="org-stem"></div>}
                </>
              )}

              {/* 팀장 (Leads) */}
              {leads.length > 0 && (
                <div className="org-lead-row">
                  {leads.map(p => (
                    <div className="org-node-lead" key={p.userId}>
                      <div className="org-avatar">{getInitials(p.name)}</div>
                      <div>
                        <div className="org-rank">{p.positionName}</div>
                        <div className="org-name">{p.name} <span className="org-userid">({p.userId})</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 주무관 (Staff) */}
              {staff.length > 0 && (
                <div className={`org-staff-section ${selectedDeptCode === '09' ? 'no-border' : ''}`}>
                  {selectedDeptCode !== '09' && <div className="org-staff-label">주무관 · {staff.length}명</div>}
                  <div className="org-staff-chips">
                    {staff.map(p => (
                      <span className="org-chip" key={p.userId}>
                        <span className="org-avatar">{getInitials(p.name)}</span>{p.name} <span className="org-userid">({p.userId})</span>
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
                      <span className="org-chip-other" key={p.userId}>
                        <span className="org-avatar">{getInitials(p.name)}</span>{p.name} <span className="org-userid">({p.userId})</span>
                        <span className="org-raw-position">({p.positionName || '미지정'})</span>
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

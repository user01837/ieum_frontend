// [변경] useCallback, useEffect, useRef 제거 → useUserSearch hook으로 대체
import React, { useState } from 'react';
import './EmpSearchModal.css';
// [변경] useUserSearch hook import 추가
import { useUserSearch } from '../../hooks/queries/useUserQuery';
import { useDepartmentsQuery } from '../../hooks/queries/useDeptQuery';

function getInitials(name) {
  return name.slice(-2);
}

function EmployeeSearchModal({ currentDept = '문화도시과', onSelect, onClose, forceDeptScope }) {
  const [scope, setScope] = useState(forceDeptScope ? 'dept' : 'dept');
  const [query, setQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');

  // [변경] fetchEmployees + useEffect + debounce 제거 → hook으로 대체
  const actualScope = forceDeptScope ? 'dept' : scope;

  const { data: employees = [], isLoading, isError } = useUserSearch({
    scope: actualScope,
    departmentCode: deptFilter !== 'all' ? deptFilter : undefined,
    keyword: query || undefined,
  });

  // [변경] 하드코딩 DEPT_OPTIONS 제거 → API로 교체
  const { data: deptList = [] } = useDepartmentsQuery();

  // [변경] error state 제거 → isError로 대체
  const error = isError ? '직원 목록을 불러오지 못했습니다.' : null;

  const handleSelect = (employee) => {
    if (onSelect) onSelect(employee);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container" role="dialog" aria-modal="true">
        <div className="modal-header">
          <div>
            <p className="modal-title">직원 검색</p>
            <p className="modal-subtitle">
              {forceDeptScope || scope === 'dept'
                ? `${currentDept} 소속 직원만 검색됩니다.`
                : '전체 부서에서 검색할 수 있습니다.'}
            </p>
          </div>
          <button aria-label="닫기" className="modal-close-btn" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3"><path d="M18 6 6 18M6 6l12 12" /></svg>
            <i className="ti ti-x ic" aria-hidden="true"></i>
          </button>
        </div>

        <div className="modal-search-area">
          <div className="modal-search-input-wrap">
            <i className="ti ti-search modal-search-input-icon" aria-hidden="true"></i>
            <input
              type="text"
              placeholder="이름 또는 사번으로 검색"
              className="modal-search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          {(!forceDeptScope && scope === 'all') && (
            <select
              className="modal-select-filter"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              <option value="all">전체 부서</option>
              {/* [변경] 하드코딩 DEPT_OPTIONS 제거 → deptList API 데이터로 교체 */}
              {deptList.map((d) => (
                <option key={d.code} value={d.code}>{d.name}</option>
              ))}
            </select>
          )}
        </div>

        {(forceDeptScope || scope === 'dept') && (
          <div className="modal-scope-badge-wrap">
            <span className="modal-scope-badge">
              <i className="ti ti-lock ic" aria-hidden="true"></i>
              담당자/조직 변경은 같은 과 내에서만 가능
            </span>
          </div>
        )}

        <div className="modal-results-divider">
          <div className="result-list">
            {isLoading ? (
              <div className="modal-spinner"></div>
            ) : error ? (
              <div className="modal-empty-results">{error}</div>
            ) : employees.length === 0 ? (
              <div className="modal-empty-results">검색 결과가 없습니다.</div>
            ) : (
              employees.map((emp) => (
                // [변경] key: emp.id → emp.userId (API 응답 필드명 변경)
                <div
                  key={emp.userId}
                  className="modal-result-row"
                  onClick={() => handleSelect(emp)}
                >
                  <div className="modal-avatar">{getInitials(emp.name)}</div>
                  <div className="modal-result-info">
                    <p className="modal-employee-name">
                      {emp.name}
                      {/* [변경] emp.role → emp.positionName (API 응답 필드명 변경) */}
                      <span className="modal-employee-role">{emp.positionName}</span>
                    </p>
                    {/* [변경] emp.id → emp.userId (API 응답 필드명 변경) */}
                    <p className="modal-employee-id">{emp.userId}</p>
                  </div>
                  {(!forceDeptScope && scope === 'all') && (
                    // [변경] emp.dept → emp.departmentName (API 응답 필드명 변경)
                    <span className="modal-employee-dept">{emp.departmentName}</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="modal-footer">
          {!forceDeptScope && (
            <div className="modal-footer-left-btns">
              <button
                className={`modal-footer-btn ${scope === 'dept' ? 'active' : ''}`}
                onClick={() => setScope('dept')}
              >
                범위: 같은 과
              </button>
              <button
                className={`modal-footer-btn ${scope === 'all' ? 'active' : ''}`}
                onClick={() => setScope('all')}
              >
                범위: 전체 부서
              </button>
            </div>
          )}
          <button className="modal-footer-btn" onClick={onClose}>취소</button>
        </div>
      </div>
    </div>
  );
}

export default EmployeeSearchModal;
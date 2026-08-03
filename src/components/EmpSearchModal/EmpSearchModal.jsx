import React, { useState, useMemo, useEffect } from 'react';
import './EmpSearchModal.css';
import { useUserSearch } from '../../hooks/queries/useUserQuery';
import { useDepartmentsQuery } from '../../hooks/queries/useDeptQuery';
import useAuthStore from '../../store/useAuthStore';

function getInitials(name) {
  return name ? name.slice(-2) : '';
}

function EmployeeSearchModal({ currentDept, onSelect, onConfirm, onClose, forceDeptScope = false, multiSelect = false, excludeUserIds = [] }) {
  const { data: deptList = [] } = useDepartmentsQuery();

  // 전달받은 부서 이름(currentDept)으로 부서 코드를 찾습니다.
  const initialDeptCode = useMemo(() => {
    if (!deptList.length || !currentDept) return undefined;
    return deptList.find(d => d.name === currentDept)?.code;
  }, [deptList, currentDept]);

  const [scope, setScope] = useState(forceDeptScope ? 'dept' : 'dept');
  const [query, setQuery] = useState('');
  // 부서 필터 상태. 초기값은 'all'
  const [deptFilter, setDeptFilter] = useState('all');
  const [selectedMap, setSelectedMap] = useState({}); // multiSelect일 때만 사용: { [userId]: emp }

  // API에 전달할 최종 부서 코드를 결정합니다.
  const apiDeptCode = useMemo(() => {
    if (scope === 'dept') {
      return initialDeptCode;
    }
    return deptFilter === 'all' ? undefined : deptFilter;
  }, [scope, initialDeptCode, deptFilter]);

  const { data: rawEmployees = [], isLoading, isError } = useUserSearch({
    scope: 'all',
    departmentCode: apiDeptCode,
    keyword: query || undefined,
    enabled: scope === 'all' || apiDeptCode !== undefined,
  });

  const currentUser = useAuthStore((state) => state.user);

  const POSITION_ORDER = { '부장': 1, '팀장': 2, '주무관': 3 };


  // multiSelect(예: 채팅 상대 선택)에서는 본인을 선택할 수 없어야 합니다.
  // 본인만 선택한 채로 확인하면 백엔드가 "채팅 상대를 1명 이상 지정해야 합니다"로 거부하므로,
  // 애초에 목록에서 본인을 제외해 그런 선택 자체가 불가능하도록 막습니다.
  const employees = useMemo(() => {
    let list = rawEmployees;
    if (multiSelect && currentUser?.userId) {
      list = list.filter((emp) => String(emp.userId) !== String(currentUser.userId));
    }
    if (excludeUserIds.length > 0) {
      const excludeSet = new Set(excludeUserIds.map(String));
      list = list.filter((emp) => !excludeSet.has(String(emp.userId)));
    }
    return [...list].sort((a, b) =>
      (POSITION_ORDER[a.positionName] ?? 99) - (POSITION_ORDER[b.positionName] ?? 99)
    );
  }, [rawEmployees, multiSelect, currentUser, excludeUserIds]);

  const error = isError ? '직원 목록을 불러오지 못했습니다.' : null;

  return (
    <div className="modal-overlay">
      <div className="modal-container" role="dialog" aria-modal="true">
        <div className="modal-header">
          <div>
            <p className="modal-title">직원 검색</p>
            <p className="modal-subtitle">
              {scope === 'dept'
                ? `${currentDept || '현재'} 소속 직원만 검색됩니다.`
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
          {!forceDeptScope && scope === 'all' && (
            <select
              className="modal-select-filter"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              <option value="all">전체 부서</option>
              {deptList.map((d) => (
                <option key={d.code} value={d.code}>{d.name}</option>
              ))}
            </select>
          )}
        </div>

        {forceDeptScope && (
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
              employees.map((emp) => {
                const isSelected = multiSelect && !!selectedMap[emp.userId];
                return (
                  <div
                    key={emp.userId}
                    className={`modal-result-row ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      if (multiSelect) {
                        setSelectedMap((prev) => {
                          const next = { ...prev };
                          if (next[emp.userId]) {
                            delete next[emp.userId];
                          } else {
                            next[emp.userId] = emp;
                          }
                          return next;
                        });
                      } else {
                        onSelect(emp);
                      }
                    }}
                  >
                    <div className="modal-avatar">{getInitials(emp.name)}</div>
                    <div className="modal-result-info">
                      <p className="modal-employee-name">
                        {emp.name}
                        <span className="modal-employee-role">{emp.positionName}</span>
                      </p>
                      <p className="modal-employee-id">{emp.userId}</p>
                    </div>
                    {scope === 'all' && deptFilter === 'all' && (
                      <span className="modal-employee-dept">{emp.departmentName}</span>
                    )}
                    {multiSelect && isSelected && (
                      <div className="modal-selected-check">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </div>
                    )}
                    {multiSelect && !isSelected && (
                      <div style={{ width: 15, height: 15, borderRadius: 3, border: '1.5px solid var(--line-strong)', flexShrink: 0 }} />
                    )}
                  </div>
                );
              })
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
          {multiSelect && (
            <button
              className="modal-footer-btn active"
              onClick={() => onConfirm(Object.values(selectedMap))}
              disabled={Object.keys(selectedMap).length === 0}
            >
              선택 완료 ({Object.keys(selectedMap).length})
            </button>
          )}
          <button className="modal-footer-btn" onClick={onClose}>취소</button>
        </div>
      </div>
    </div>
  );
}

export default EmployeeSearchModal;
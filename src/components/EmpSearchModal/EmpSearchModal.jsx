import React, { useState, useEffect, useCallback, useRef } from 'react';
import './EmpSearchModal.css';

/**
 * ===== Mock API =====
 * 실제 연동 시 이 함수 내부만 axios.get('/api/employees', { params }) 등으로 교체하면 됩니다.
 * scope: 'dept' | 'all'
 * currentDept: 현재 사용자 소속 부서 (scope=dept일 때 서버에서 필터링된다고 가정)
 * dept: scope=all일 때 부서 필터값 ('all' 포함)
 * query: 검색어 (이름 또는 사번)
 */
const MOCK_EMPLOYEES = [
  { id: 'P-2210', name: '박주임', dept: '문화도시과', role: '주무관' },
  { id: 'P-2144', name: '김하늘', dept: '문화도시과', role: '주무관' },
  { id: 'P-2098', name: '이도현', dept: '문화도시과', role: '팀장' },
  { id: 'P-2311', name: '정수민', dept: '도시계획과', role: '주무관' },
  { id: 'P-2287', name: '최유진', dept: '정보통신과', role: '주무관' },
  { id: 'P-2055', name: '한서준', dept: '총무과', role: '팀장' },
  { id: 'P-2179', name: '오세현', dept: '도시계획과', role: '주무관' },
  { id: 'P-2402', name: '강민지', dept: '정보통신과', role: '팀장' },
];

const DEPT_OPTIONS = ['문화도시과', '도시계획과', '정보통신과', '총무과'];

function fetchEmployees({ scope, currentDept, dept, query }) {
  return new Promise((resolve) => {
    setTimeout(() => {
      let pool = MOCK_EMPLOYEES;

      if (scope === 'dept') {
        pool = pool.filter((e) => e.dept === currentDept);
      } else if (dept && dept !== 'all') {
        pool = pool.filter((e) => e.dept === dept);
      }

      if (query && query.trim()) {
        const q = query.trim().toLowerCase();
        pool = pool.filter(
          (e) => e.name.toLowerCase().includes(q) || e.id.toLowerCase().includes(q)
        );
      }

      resolve(pool);
    }, 400); // 네트워크 지연 흉내
  });
}

function getInitials(name) {
  return name.slice(-2);
}

/**
 * EmployeeSearchModal
 * @param {string} currentDept - 현재 사용자 소속 부서 (scope=dept 기준)
 * @param {function} onSelect - 직원 선택 시 콜백 (employee 객체 전달)
 * @param {function} onClose - 모달 닫기 콜백
 */
function EmployeeSearchModal({ currentDept = '문화도시과', onSelect, onClose, forceDeptScope }) {
  const [scope, setScope] = useState(forceDeptScope ? 'dept' : 'dept'); // 'dept' | 'all'
  const [query, setQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 검색어 debounce 처리용
  const debounceRef = useRef(null);

  const loadEmployees = useCallback(async (params) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchEmployees(params);
      setEmployees(data);
    } catch (err) {
      setError('직원 목록을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // scope, deptFilter 변경 시 즉시 조회
  useEffect(() => {
    // forceDeptScope가 true이면 scope는 항상 'dept'로 고정
    const actualScope = forceDeptScope ? 'dept' : scope;
    loadEmployees({ scope: actualScope, currentDept, dept: deptFilter, query });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, deptFilter, forceDeptScope]);

  // 검색어 입력은 debounce 적용
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      // forceDeptScope가 true이면 scope는 항상 'dept'로 고정
      const actualScope = forceDeptScope ? 'dept' : scope;
      loadEmployees({ scope: actualScope, currentDept, dept: deptFilter, query });
    }, 250);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, scope, deptFilter, forceDeptScope]);

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
              {DEPT_OPTIONS.map((d) => (
                <option key={d} value={d}>{d}</option>
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
                <div
                  key={emp.id}
                  className="modal-result-row"
                  onClick={() => handleSelect(emp)}
                >
                  <div className="modal-avatar">{getInitials(emp.name)}</div>
                  <div className="modal-result-info">
                    <p className="modal-employee-name">
                      {emp.name} <span className="modal-employee-role">{emp.role}</span>
                    </p>
                    <p className="modal-employee-id">{emp.id}</p>
                  </div>
                  {(!forceDeptScope && scope === 'all') && (
                    <span className="modal-employee-dept">{emp.dept}</span>
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
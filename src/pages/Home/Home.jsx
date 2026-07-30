import React, { useState, useMemo, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';
import useAuthStore from '../../store/useAuthStore';
import { useHomeDashboardQuery } from '../../hooks/queries/useDashboardQuery';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function Home() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = useMemo(() => user?.system_role_code === '02', [user]);
  const navigate = useNavigate();

  // 클라이언트 사이드 렌더링 시점에서만 UI를 그리도록 하여
  // 서버/클라이언트 간 불일치(hydration mismatch) 오류를 방지합니다.
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  // --- API 데이터 로드 ---
  const { data: dashboardData, isLoading, isError } = useHomeDashboardQuery({
    enabled: isClient && !!user, // 사용자 정보가 있을 때 쿼리를 실행합니다.
  });

  // useMemo를 사용하여 API 데이터를 역할에 맞게 가공하고, 차트 데이터를 생성합니다.
  const {
    isReady,
    // Staff data
    myPetitionSummary,
    staffAnnouncements,
    urgentPetitions = [],
    recentPetitions = [],
    myProjects = [],
    staffChartData,
    // Admin data
    stats,
    employeeStatus,
    adminMonthlyPetitionSummary,
    totalDelayedOrUrgentPetitions,
    knowledgeSummary,
    adminAnnouncements,
    adminDelayedOrUrgentPetitions,
    recentUsers,
    adminDeptChartData,
    adminDeptKbData,
  } = useMemo(() => {
    if (!dashboardData) {
      return { isReady: false };
    }

    if (isAdmin) {
      const {
        stats = { totalUsers: 0, activeDepartments: 0 },
        employeeStatus = { active: 0, onLeave: 0, resigned: 0 },
        monthlyPetitionSummary = { total: 0, percentageChange: 0.0 },
        totalDelayedOrUrgentPetitions = 0,
        departmentPetitionStatus = [],
        knowledgeSummary = { total: 0, byDepartment: [] },
        announcements = [],
        delayedOrUrgentPetitions = [],
        recentUsers = [],
      } = dashboardData;

      const adminDeptChartData = {
        labels: departmentPetitionStatus.map(d => d.departmentName),
        datasets: [
          { label: '대기', data: departmentPetitionStatus.map(d => d.waiting), backgroundColor: '#919191' },
          { label: '확인중', data: departmentPetitionStatus.map(d => d.checked), backgroundColor: '#f59e0b' },
          { label: '진행중', data: departmentPetitionStatus.map(d => d.inProgress), backgroundColor: '#2563eb' },
          { label: '완료', data: departmentPetitionStatus.map(d => d.completed), backgroundColor: '#10b981' },
          { label: '지연', data: departmentPetitionStatus.map(d => d.delayed), backgroundColor: '#ef4444' },
        ],
      };

      const adminDeptKbData = {
        labels: knowledgeSummary.byDepartment.map(d => d.departmentName),
        datasets: [{
          label: '등록 건수',
          data: knowledgeSummary.byDepartment.map(d => d.count),
          backgroundColor: '#6366f1',
          borderRadius: 4,
        }],
      };

      return {
        isReady: true,
        stats,
        employeeStatus,
        adminMonthlyPetitionSummary: monthlyPetitionSummary,
        totalDelayedOrUrgentPetitions,
        knowledgeSummary,
        adminAnnouncements: announcements,
        adminDelayedOrUrgentPetitions: delayedOrUrgentPetitions,
        recentUsers,
        adminDeptChartData,
        adminDeptKbData,
      };
    } else { // Staff
      const {
        myPetitionSummary = { total: 0, waiting: 0, checked: 0, inProgress: 0, completed: 0, delayed: 0 },
        announcements = [],
        urgentPetitions = [],
        recentPetitions = [],
        myProjects = [],
      } = dashboardData;

      const staffChartData = {
        labels: ['대기중', '확인중', '처리중', '완료'],
        datasets: [{
          data: [
            myPetitionSummary.waiting,
            myPetitionSummary.checked,
            myPetitionSummary.inProgress,
            myPetitionSummary.completed,
          ],
          backgroundColor: ['#919191', '#E08A2B', '#2563eb', '#10b981'],
          borderWidth: 0,
        }],
      };

      return {
        isReady: true,
        myPetitionSummary,
        staffAnnouncements: announcements,
        urgentPetitions,
        recentPetitions,
        myProjects,
        staffChartData,
      };
    }
  }, [dashboardData, isAdmin]);

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    cutout: '65%',
  };

  const adminBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
    },
    scales: {
      x: { stacked: true },
      y: { stacked: true },
    },
  };

  const adminKbBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
  };

  // --- 상태별 색상/클래스 맵 ---
  const STATUS_CLASS_MAP = {
    '대기중': 'wait',
    '확인중': 'check',
    '처리중': 'progress',
    '완료': 'done',
  };

  const projectStageMap = {
    '저장': { className: 'planning', text: '기획중' },
    '승인완료': { className: 'in-progress', text: '진행중' },
  };

  // 사용자 정보가 로드되기 전까지 로딩 상태를 표시합니다.
  if (!isClient || !user) {
    return (
      <div className="dashboard-container" style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-tertiary)' }}>
        사용자 정보를 불러오는 중입니다...
      </div>
    );
  }

  // 데이터 로딩/에러 처리
  if (isLoading || !isReady) return <div className="dashboard-container" style={{ padding: '40px', textAlign: 'center' }}>대시보드 데이터를 불러오는 중입니다...</div>;
  if (isError) return <div className="dashboard-container" style={{ padding: '40px', textAlign: 'center', color: 'var(--danger)' }}>데이터 로딩 중 오류가 발생했습니다.</div>;


  return (
    <div className="dashboard-container">
      <div className="content-wrapper">
        <main className="dashboard-main">

          {/* ========================================================================= */}
          {/* A. 관리자 전용 대시보드 (ADMIN VIEW)                                      */}
          {/* ========================================================================= */}
          {isAdmin ? (
            <>
              {/* 관리자 1행: 조직 및 민원 현황 KPI 카운터 4개 */}
              <div className="grid-row-kpi" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
                <div className="card" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>전체 직원 수</div>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a', marginTop: '6px' }}>
                    {stats.totalUsers}<span style={{ fontSize: '16px', fontWeight: 400 }}> 명</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>● 활성 부서 {stats.activeDepartments}개</div>
                </div>

                <div className="card" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>직원 상태 현황</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginTop: '10px' }}>
                    재직 <strong className="text-dark">{employeeStatus.active}</strong> / 휴직 <strong className="text-amber">{employeeStatus.onLeave}</strong> / 퇴직 <strong className="text-danger">{employeeStatus.resigned}</strong>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>총 계정 {stats.totalUsers}개 기준</div>
                </div>

                <div className="card" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>금월 전체 민원</div>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: '#2563eb', marginTop: '6px' }}>
                    {adminMonthlyPetitionSummary.total.toLocaleString()}<span style={{ fontSize: '16px', fontWeight: 400 }}> 건</span>
                  </div>
                  <div style={{ fontSize: '12px', color: adminMonthlyPetitionSummary.percentageChange >= 0 ? '#10b981' : '#ef4444', marginTop: '4px' }}>{adminMonthlyPetitionSummary.percentageChange >= 0 ? '▲' : '▼'} 전월 대비 {Math.abs(adminMonthlyPetitionSummary.percentageChange)}%</div>
                </div>

                <div className="card" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>전체 부서 처리 지연/임박 민원</div>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: '#ef4444', marginTop: '6px' }}>
                    {totalDelayedOrUrgentPetitions}<span style={{ fontSize: '16px', fontWeight: 400 }}> 건</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>⚠️ 즉시 관제 및 독촉 필요</div>
                </div>
              </div>

              {/* 관리자 2행: 부서별 민원 처리 현황 (9개 부서 100% 가로 풀 너비) */}
              <div className="grid-row-full" style={{ marginBottom: '20px' }}>
                <div className="card">
                  <h3 className="card-title">부서별 민원 처리 현황 (월별)</h3>
                  <div style={{ height: '280px', marginTop: '10px' }}>
                    <Bar data={adminDeptChartData} options={adminBarOptions} />
                  </div>
                </div>
              </div>

              {/* 관리자 3행: 부서별 지식베이스 등록 현황 & 공지사항 */}
              <div className="grid-row-two" style={{ marginBottom: '20px' }}>
                {/* 부서별 지식베이스 등록 현황 */}
                <div className="card">
                  <div className="card-header-flex">
                    <h3 className="card-title">부서별 지식베이스 등록 현황</h3>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>총 {knowledgeSummary.total}건 등록됨</span>
                  </div>
                  <div style={{ height: '200px', marginTop: '10px' }}>
                    <Bar data={adminDeptKbData} options={adminKbBarOptions} />
                  </div>
                </div>

                {/* 공지사항 */}
                <div className="card">
                  <div className="card-header-flex">
                    <h3 className="card-title">공지사항</h3>
                    <Link to="/announcements" className="more-btn">더보기 +</Link>
                  </div>
                  <ul className="simple-list">
                    {adminAnnouncements.length > 0 ? (
                      adminAnnouncements.map((notice, index) => (
                        <li key={index}>
                          <span className="list-title">{notice.title}</span>
                          <span className="list-date">{notice.date}</span>
                        </li>
                      ))
                    ) : (
                      <li style={{ textAlign: 'center', color: 'var(--ink-tertiary)', fontSize: '12px', padding: '20px 0' }}>등록된 공지사항이 없습니다.</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* 관리자 4행: 처리 지연/임박 민원 현황 & 최근 등록/수정 직원 현황 */}
              <div className="grid-row-two">
                {/* 처리 지연/임박 민원 현황 */}
                <div className="card">
                  <div className="card-header-flex">
                    <h3 className="card-title" style={{ color: '#ef4444' }}>🚨 처리 지연 / 임박 민원 현황</h3>
                    <Link to="/petitions" className="more-btn">전체보기 +</Link>
                  </div>
                  <table className="recent-table">
                    <thead>
                      <tr>
                        <th>담당 부서</th>
                        <th>담당자</th>
                        <th>민원 제목</th>
                        <th>기한</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminDelayedOrUrgentPetitions.length > 0 ? (
                        adminDelayedOrUrgentPetitions.map((p, index) => (
                          <tr key={index}>
                            <td>{p.departmentName || '-'}</td>
                            <td>{p.assigneeName || '-'}</td>
                            <td className="font-semibold text-dark">{p.title}</td>
                            <td className="text-danger font-medium">{p.dueDate}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" style={{ textAlign: 'center', color: 'var(--ink-tertiary)', fontSize: '12px', padding: '20px 0' }}>
                            처리 지연/임박 민원이 없습니다.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* 최근 등록/수정 직원 현황 */}
                <div className="card">
                  <div className="card-header-flex">
                    <h3 className="card-title">최근 등록 / 수정 직원 현황</h3>
                    <a href="admin" className="more-btn">직원 관리 페이지 +</a>
                  </div>
                  <table className="recent-table">
                    <thead>
                      <tr>
                        <th>사번</th>
                        <th>이름</th>
                        <th>부서</th>
                        <th>상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUsers.length > 0 ? (
                        recentUsers.map(u => (
                          <tr key={u.userId}>
                            <td>{u.userId}</td>
                            <td className="font-semibold text-dark">{u.name}</td>
                            <td>{u.departmentName || '-'}</td>
                            <td><span className={`status-badge ${u.statusName === '재직' ? 'active' : 'leave'}`}>{u.statusName}</span></td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" style={{ textAlign: 'center', color: 'var(--ink-tertiary)', fontSize: '12px', padding: '20px 0' }}>
                            최근 변경된 직원이 없습니다.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            
            /* ========================================================================= */
            /* B. 일반 직원용 대시보드 (STAFF VIEW)                                       */
            /* ========================================================================= */
            <>
              {/* 1행: 내 민원 현황 & 공지사항 */}
              <div className="grid-row-two">
                <div className="card">
                  <h3 className="card-title">내 민원 현황</h3>
                  <div className="status-flex">
                    <div className="status-info">
                      <div className="status-total">이번 달 총 민원 수: {myPetitionSummary.total}건</div>
                      <div className="status-item">
                        <span>대기 중</span> <span style={{ color: '#919191' }} className="font-bold">{myPetitionSummary.waiting}건</span>
                      </div>
                      <div className="status-item">
                        <span>확인 중</span> <span style={{ color: '#E08A2B' }} className="font-bold">{myPetitionSummary.checked}건</span>
                      </div>
                      <div className="status-item">
                        <span>처리 중</span> <span className="text-blue font-bold">{myPetitionSummary.inProgress}건</span>
                      </div>
                      <div className="status-item">
                        <span>처리 완료</span> <span className="text-emerald font-bold">{myPetitionSummary.completed}건</span>
                      </div>
                      {/* 지연 건수는 차트에 포함되지 않는 별도 항목으로, 시각적 구분을 위해 스타일을 조정합니다. */}
                      {myPetitionSummary.delayed > 0 && (
                        <div className="status-item" style={{ borderBottom: 'none', marginTop: '0.5rem' }}>
                          <span>🚨 이 중 처리 지연</span> <span className="text-danger font-bold">{myPetitionSummary.delayed}건</span>
                        </div>
                      )}
                    </div>
                    <div className="chart-box-sm">
                      <Doughnut data={staffChartData} options={donutOptions} />
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-header-flex">
                    <h3 className="card-title">공지사항</h3>
                    <Link to="/announcements" className="more-btn">더보기 +</Link>
                  </div>
                  <ul className="simple-list">
                    {staffAnnouncements.length > 0 ? (
                      staffAnnouncements.slice(0, 4).map((notice) => (
                        <li
                          key={notice.id}
                          onClick={() => navigate(`/announcements/${notice.id}`)}
                        >
                          <span className="list-title">{notice.title}</span>
                          <span className="list-date">{notice.date}</span>
                        </li>
                      ))
                    ) : (
                      <li style={{ textAlign: 'center', color: 'var(--ink-tertiary)', fontSize: '12px', padding: '20px 0' }}>
                        등록된 공지사항이 없습니다.
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* 2행: 긴급 및 주요 민원 */}
              <div className="grid-row-full">
                <div className="card">
                  <h3 className="card-title">처리 기한 임박 민원</h3>
                  <div className="alert-list">
                    {urgentPetitions.length > 0 ? (
                      urgentPetitions.map((p) => {
                        let urgency;
                        let badgeText;
                        if (p.dDay < 0) {
                          urgency = 'overdue';
                          badgeText = `D+${Math.abs(p.dDay)}`;
                        } else if (p.dDay === 0) {
                          urgency = 'danger';
                          badgeText = '오늘 만료';
                        } else {
                          urgency = p.dDay <= 2 ? 'warning' : 'info';
                          badgeText = `D-${p.dDay}`;
                        }
                        return (
                          <Link to={`/petitions/${p.complaintId}`} key={p.complaintId} className={`alert-item alert-${urgency}`}>
                            <span className={urgency === 'danger' || urgency === 'overdue' ? 'font-bold' : ''}>{p.title}</span>
                            <span className={`alert-badge-${urgency}`}>{badgeText}</span>
                          </Link>
                        );
                      })
                    ) : (
                      <div style={{ textAlign: 'center', color: 'var(--ink-tertiary)', fontSize: '12px', padding: '20px 0' }}>
                        기한이 임박한 민원이 없습니다.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 3행: 최근 접수 민원 & 사업/프로젝트 목록 */}
              <div className="grid-row-two">
                <div className="card">
                  <div className="card-header-flex">
                    <h3 className="card-title">최근 접수 민원</h3>
                    <Link to="/petitions" className="more-btn">전체보기 +</Link>
                  </div>
                  <table className="recent-table">
                    <thead>
                      <tr>
                        <th>접수일</th>
                        <th>처리기한</th>
                        <th>제목</th>
                        <th>상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentPetitions.length > 0 ? (
                        recentPetitions.map(p => (
                          <tr key={p.complaintId} onClick={() => navigate(`/petitions/${p.complaintId}`)} style={{ cursor: 'pointer' }}>
                            <td>{p.receivedAt?.split('T')[0]}</td>
                            <td className="font-medium">{p.dueDate?.split('T')[0]}</td>
                            <td className="font-semibold text-dark">{p.title}</td>
                            <td>
                              <span className={`status ${STATUS_CLASS_MAP[p.statusName] || ''}`}>
                                <span className="dot"></span>{p.statusName}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" style={{ textAlign: 'center', color: 'var(--ink-tertiary)', fontSize: '12px', padding: '20px 0' }}>
                            최근 접수된 민원이 없습니다.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="card">
                  <div className="card-header-flex">
                    <h3 className="card-title">사업 / 프로젝트 목록</h3>
                    <Link to="/projects" className="more-btn">전체보기 +</Link>
                  </div>
                  <div className="project-list">
                    {myProjects.length > 0 ? (
                      myProjects.map(p => {
                        const stage = projectStageMap[p.stageName] || { className: '', text: p.stageName };
                        return (
                          <div key={p.projectId} className="project-item" onClick={() => navigate(`/projects/${p.projectId}`)} style={{ cursor: 'pointer' }}>
                            <div className="project-info">
                              <span className="project-name">{p.name}</span>
                              <span className="project-dept">{p.departmentName} | {p.roleName}</span>
                            </div>
                            <span className={`project-status ${stage.className}`}>{stage.text}</span>
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ textAlign: 'center', color: 'var(--ink-tertiary)', fontSize: '12px', padding: '20px 0' }}>
                        참여중인 프로젝트가 없습니다.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

        </main>
      </div>
    </div>
  );
}
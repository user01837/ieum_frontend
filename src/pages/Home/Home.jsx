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
    enabled: isClient && !isAdmin, // 관리자가 아닐 때만 이 쿼리를 실행합니다.
  });

  // API 응답 데이터 구조 분해 할당
  const {
    myPetitionSummary = { total: 0, waiting: 0, checked: 0, inProgress: 0, completed: 0 },
    announcements = [],
    urgentPetitions = [],
    recentPetitions = [],
    myProjects = [],
  } = dashboardData || {};

  // ==========================================
  // 1. 일반 직원용 차트 데이터
  // ==========================================
  const staffChartData = {
    labels: ['대기중', '확인중', '처리중', '완료'],
    datasets: [
      {
        data: [
          myPetitionSummary.waiting,
          myPetitionSummary.checked,
          myPetitionSummary.inProgress,
          myPetitionSummary.completed,
        ],
        backgroundColor: ['#919191', '#E08A2B', '#2563eb', '#10b981'],
        borderWidth: 0,
      },
    ],
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    cutout: '65%',
  };

  // ==========================================
  // 2. 관리자용 차트 데이터
  // ==========================================
  // (1) 부서별 민원 접수 및 처리 현황 (바 차트)
  const adminDeptChartData = {
    labels: ['교통부', '문화·체육·관광부', '복지행정과', '환경위생과', '도시재생과'],
    datasets: [
      {
        label: '처리 완료',
        data: [120, 85, 95, 60, 40],
        backgroundColor: '#2563eb',
      },
      {
        label: '진행 중/지연',
        data: [25, 12, 18, 5, 8],
        backgroundColor: '#f59e0b',
      },
    ],
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

  // (2) 지식베이스 카테고리별 등록 현황 (건수 기준)
  const adminKbChartData = {
    labels: ['민원/매뉴얼', '교통/시설', '행정/서식', '기타'],
    datasets: [
      {
        data: [210, 115, 90, 67], // 단순 등록된 문서 수
        backgroundColor: ['#2563eb', '#10b981', '#6366f1', '#f59e0b'],
        borderWidth: 0,
      },
    ],
  };

  // --- 상태별 색상/클래스 맵 ---
  const statusColorClassMap = {
    '대기중': 'text-amber',
    '확인중': 'text-amber', // '확인중'도 '대기중'과 유사한 주의 상태로 간주
    '처리중': 'text-blue',
    '완료': 'text-emerald',
  };

  const projectStageMap = {
    '저장': { className: 'in-progress', text: '저장' },
    '승인완료': { className: 'planning', text: '승인완료' },
  };

  // 사용자 정보가 로드되기 전까지 로딩 상태를 표시합니다.
  if (!isClient || !user) {
    return (
      <div className="dashboard-container" style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-tertiary)' }}>
        사용자 정보를 불러오는 중입니다...
      </div>
    );
  }

  // 직원 대시보드 데이터 로딩/에러 처리
  if (!isAdmin && isLoading) return <div className="dashboard-container" style={{ padding: '40px', textAlign: 'center' }}>대시보드 데이터를 불러오는 중입니다...</div>;
  if (!isAdmin && isError) return <div className="dashboard-container" style={{ padding: '40px', textAlign: 'center', color: 'var(--danger)' }}>데이터 로딩 중 오류가 발생했습니다.</div>;


  return (
    <div className="dashboard-container">
      <div className="content-wrapper">
        <main className="dashboard-main">

          {/* ========================================================================= */}
          {/* A. 관리자 전용 대시보드 (ADMIN VIEW)                                      */}
          {/* ========================================================================= */}
          {isAdmin ? (
            <>
              {/* 관리자 1행: 조직 및 민원 현황 KPI 카운터 */}
              <div className="grid-row-kpi" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
                <div className="card" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>전체 직원 / 활성 부서</div>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a', marginTop: '6px' }}>
                    112<span style={{ fontSize: '16px', fontWeight: 400 }}> 명</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>● 9개 부서 등록됨</div>
                </div>

                <div className="card" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>휴직 중 직원</div>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: '#f59e0b', marginTop: '6px' }}>
                    2<span style={{ fontSize: '16px', fontWeight: 400 }}> 명</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>재직 중 109명 / 퇴직 1명</div>
                </div>

                <div className="card" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>금월 전체 민원</div>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: '#2563eb', marginTop: '6px' }}>
                    1,240<span style={{ fontSize: '16px', fontWeight: 400 }}> 건</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>전월 대비 +8.4%</div>
                </div>

                <div className="card" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>처리 지연/임박 민원</div>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: '#ef4444', marginTop: '6px' }}>
                    5<span style={{ fontSize: '16px', fontWeight : 400 }}> 건</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>⚠️ 기한 임박 모니터링</div>
                </div>
              </div>

              {/* 관리자 2행: 부서별 민원 처리 현황 & 지식베이스 등록 현황 */}
              <div className="grid-row-two" style={{ marginBottom: '20px' }}>
                <div className="card">
                  <h3 className="card-title">부서별 민원 처리 현황</h3>
                  <div style={{ height: '220px', marginTop: '10px' }}>
                    <Bar data={adminDeptChartData} options={adminBarOptions} />
                  </div>
                </div>

                <div className="card">
                  <h3 className="card-title">지식베이스 카테고리별 등록 현황</h3>
                  <div className="status-flex">
                    <div className="status-info">
                      <div className="status-total">전체 등록 지식: 482건</div>
                      <div className="status-item">
                        <span>민원 / 매뉴얼</span> <span className="text-blue font-bold">210건</span>
                      </div>
                      <div className="status-item">
                        <span>교통 / 시설</span> <span className="text-emerald font-bold">115건</span>
                      </div>
                      <div className="status-item">
                        <span>행정 / 서식</span> <span className="text-dark font-bold">90건</span>
                      </div>
                      <div className="status-item">
                        <span>기타 규정</span> <span className="text-amber font-bold">67건</span>
                      </div>
                    </div>
                    <div className="chart-box-sm">
                      <Doughnut data={adminKbChartData} options={donutOptions} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 관리자 3행: 지연 임박 민원 모니터링 & 최근 등록/수정 직원 목록 */}
              <div className="grid-row-two">
                <div className="card">
                  <div className="card-header-flex">
                    <h3 className="card-title" style={{ color: '#ef4444' }}>🚨 처리 지연/임박 민원 현황</h3>
                    <a href="#petitions" className="more-btn">민원 전체보기 +</a>
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
                      <tr>
                        <td>교통부</td>
                        <td>김교통 부장</td>
                        <td className="font-semibold text-dark">주차장 출입 차단기 오류</td>
                        <td className="text-danger font-medium">오늘 만료</td>
                      </tr>
                      <tr>
                        <td>문화·체육·관광부</td>
                        <td>안건호 주무관</td>
                        <td className="font-semibold text-dark">체육시설 대관 승인 요청</td>
                        <td className="text-danger font-medium">D-1</td>
                      </tr>
                      <tr>
                        <td>환경위생과</td>
                        <td>이환경 주무관</td>
                        <td className="font-semibold text-dark">야외 쓰레기통 추가 설치</td>
                        <td className="text-amber font-medium">D-2</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 최근 등록/수정된 직원 목록 (사원 DB 데이터 연동용) */}
                <div className="card">
                  <div className="card-header-flex">
                    <h3 className="card-title">최근 등록 직원 현황</h3>
                    <a href="#admin-page" className="more-btn">직원 관리 페이지 +</a>
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
                      <tr>
                        <td>20250818</td>
                        <td className="font-semibold text-dark">안건호</td>
                        <td>문화·체육·관광부</td>
                        <td><span className="status-badge active">재직</span></td>
                      </tr>
                      <tr>
                        <td>20260001</td>
                        <td className="font-semibold text-dark">김관리</td>
                        <td>관리자</td>
                        <td><span className="status-badge active">재직</span></td>
                      </tr>
                      <tr>
                        <td>20260002</td>
                        <td className="font-semibold text-dark">김교통</td>
                        <td>교통부</td>
                        <td><span className="status-badge active">재직</span></td>
                      </tr>
                      <tr>
                        <td>20260005</td>
                        <td className="font-semibold text-dark">이휴직</td>
                        <td>교통부</td>
                        <td><span className="status-badge leave">휴직</span></td>
                      </tr>
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
                    </div>
                    <div className="chart-box-sm">
                      <Doughnut data={staffChartData} options={donutOptions} />
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-header-flex">
                    <h3 className="card-title">공지사항</h3>
                    <Link to="/notice" className="more-btn">더보기 +</Link>
                  </div>
                  <ul className="simple-list">
                    {announcements.length > 0 ? (
                      announcements.slice(0, 4).map(notice => (
                        <li key={notice.id}>
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
                      urgentPetitions.map(p => {
                        const urgency = p.dDay <= 0 ? 'danger' : p.dDay <= 2 ? 'warning' : 'info';
                        const badgeText = p.dDay <= 0 ? '오늘 만료' : `D-${p.dDay}`;
                        return (
                          <Link to={`/petitions/${p.complaintId}`} key={p.complaintId} className={`alert-item alert-${urgency}`}>
                            <span className={urgency === 'danger' ? 'font-bold' : ''}>{p.title}</span>
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
                            <td className={`status-dot ${statusColorClassMap[p.statusName] || 'text-dark'}`}>● {p.statusName}</td>
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
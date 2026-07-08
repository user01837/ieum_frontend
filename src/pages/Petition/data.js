function getFutureDate(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

export const COMPLAINTS = [
  { id:'c0', title:'[테스트] 긴급 도로 보수 요청', dept:'도로교통과', status:'progress', statusText:'처리중', assignee:'한서준', received: getFutureDate(-1), deadline: getFutureDate(2), content: '긴급 도로 보수가 필요한 테스트 민원입니다.', taskId: 't-road-1' },
  { id:'c1', title:'OO거리 축제 소음 관련 민원', dept:'문화도시과', status:'wait', statusText:'대기중', assignee:'박주임', received:'2026.06.28', deadline:'2026.07.05', content: 'OO거리에서 매주 주말 열리는 축제 소음이 너무 심합니다. 스피커 볼륨을 줄여주시거나, 행사 시간을 조절해 주세요.', taskId: 't-culture-1' },
  { id:'c2', title:'지역 축제 안내 책자 오탈자 신고', dept:'문화도시과', status:'progress', statusText:'처리중', assignee:'이주임', received:'2026.06.25', deadline:'2026.07.02', content: '이번 지역 축제 안내 책자 3페이지에 오탈자가 있습니다. "환영합니다"가 "환영합니디"로 잘못 표기되어 있습니다.', taskId: 't-culture-1' },
  { id:'c3', title:'전통시장 문화행사 스피커 소음 민원', dept:'문화도시과', status:'wait', statusText:'대기중', assignee:'박주임', received:'2026.06.24', deadline:'2026.07.01', content: '전통시장에서 진행되는 문화행사의 스피커 소리가 너무 커서 상가 운영에 방해가 됩니다. 조치가 필요합니다.', taskId: 't-culture-2' },
  { id:'c4', title:'공공시설 온라인 예약시스템 오류 문의', dept:'정보통신과', status:'progress', statusText:'처리중', assignee:'윤주임', received:'2026.06.20', deadline:'2026.06.27', content: '공공시설 예약 시스템에서 특정 날짜가 선택되지 않는 오류가 발생합니다. 확인 부탁드립니다.', taskId: 't-info-1' },
  { id:'c5', title:'문화센터 강좌 신청 절차 문의', dept:'문화도시과', status:'done', statusText:'완료', assignee:'박주임', received:'2026.06.15', deadline:'2026.06.22', content: '문화센터의 신규 강좌를 신청하고 싶은데, 온라인 신청 방법을 자세히 알려주세요.', taskId: 't-culture-2' },
  { id:'c6', title:'시립박물관 무료입장 대상 문의', dept:'문화도시과', status:'done', statusText:'완료', assignee:'이주임', received:'2026.06.09', deadline:'2026.06.16', content: '시립박물관의 무료입장 대상에 미취학 아동도 포함되는지 궁금합니다.', taskId: 't-culture-2' },
  { id:'c7', title:'OO거리 축제 소음 관련 민원', dept:'문화도시과', status:'wait', statusText:'대기중', assignee:'박주임', received:'2026.06.28', deadline:'2026.07.05', content: 'OO거리에서 매주 주말 열리는 축제 소음이 너무 심합니다. 스피커 볼륨을 줄여주시거나, 행사 시간을 조절해 주세요.', taskId: 't-culture-1' },
  { id:'c8', title:'지역 축제 안내 책자 오탈자 신고', dept:'문화도시과', status:'progress', statusText:'처리중', assignee:'이주임', received:'2026.06.25', deadline:'2026.07.02', content: '이번 지역 축제 안내 책자 3페이지에 오탈자가 있습니다. "환영합니다"가 "환영합니디"로 잘못 표기되어 있습니다.', taskId: 't-culture-1' },
  { id:'c9', title:'전통시장 문화행사 스피커 소음 민원', dept:'문화도시과', status:'wait', statusText:'대기중', assignee:'박주임', received:'2026.06.24', deadline:'2026.07.01', content: '전통시장에서 진행되는 문화행사의 스피커 소리가 너무 커서 상가 운영에 방해가 됩니다. 조치가 필요합니다.', taskId: 't-culture-2' },
  { id:'c10', title:'공공시설 온라인 예약시스템 오류 문의', dept:'정보통신과', status:'progress', statusText:'처리중', assignee:'윤주임', received:'2026.06.20', deadline:'2026.06.27', content: '공공시설 예약 시스템에서 특정 날짜가 선택되지 않는 오류가 발생합니다. 확인 부탁드립니다.', taskId: 't-info-1' },
  { id:'c11', title:'문화센터 강좌 신청 절차 문의', dept:'문화도시과', status:'done', statusText:'완료', assignee:'박주임', received:'2026.06.15', deadline:'2026.06.22', content: '문화센터의 신규 강좌를 신청하고 싶은데, 온라인 신청 방법을 자세히 알려주세요.', taskId: 't-culture-2' },
  { id:'c12', title:'시립박물관 무료입장 대상 문의', dept:'문화도시과', status:'done', statusText:'완료', assignee:'이주임', received:'2026.06.09', deadline:'2026.06.16', content: '시립박물관의 무료입장 대상에 미취학 아동도 포함되는지 궁금합니다.', taskId: 't-culture-2' },
];

export const PREDECESSOR = [
  { id:'p1', title:'구도심 상권 활성화 축제 기획 민원', dept:'문화도시과', status:'wait', statusText:'대기중', assignee:'박주임', received:'2026.05.30', deadline:'2026.07.10', content: '구도심 상권 활성화를 위한 축제 기획 관련하여 아이디어를 제안합니다.', taskId: 't-culture-1' },
  { id:'p2', title:'전임자 인계 - 노후 문화시설 안전점검 민원', dept:'문화도시과', status:'progress', statusText:'처리중', assignee:'박주임', received:'2026.05.22', deadline:'2026.06.30', content: '노후된 문화시설의 안전 점검이 시급합니다. 빠른 시일 내에 점검 및 보수 계획을 수립해 주시기 바랍니다.', taskId: 't-culture-2' }
];

export const TASKS = {
  't-culture-1': { name: '지역 축제 관리' },
  't-culture-2': { name: '문화 시설 운영' },
  't-info-1': { name: '정보 시스템 유지보수' },
  't-road-1': { name: '도로 유지보수' },
};
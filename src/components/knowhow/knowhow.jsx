// useKnowledgeMemo.js
import { useState } from 'react';

export default function useKnowledgeMemo() {
  // --- 지식베이스 선택 관련 상태 ---
  const [existingCards] = useState([
    { id: 'card-1', title: '불법 주정차 단속 민원 처리' },
    { id: 'card-2', title: '카라멜마끼아또 제조 사업' },
    { id: 'card-3', title: 'CCTV 정보공개청구 대응' },
  ]);
  // 'new' 또는 카드 ID를 가질 수 있습니다.
  const [selectedCardId, setSelectedCardId] = useState(''); 
  const [newCardTitle, setNewCardTitle] = useState('');
  // --------------------------------

  // 1. 태그 목록 상태
  const [tags, setTags] = useState([
    { name: '위생', active: true },
    { name: '시설', active: false },
    { name: '주차', active: false },
    { name: '예산', active: false },
    { name: '인허가', active: false },
    { name: '민원대응', active: false },
  ]);

  // 2. 새 태그 인풋 상태
  const [newTagInput, setNewTagInput] = useState('');

  // 3. 필터링 선택 상태 ('all' 혹은 선택된 태그명)
  const [currentFilter, setCurrentFilter] = useState('all');

  // 4. 작성 중인 메모 텍스트 상태
  const [memoText, setMemoText] = useState('');

  // 5. 이전 로그 고정 데이터
  const [logs] = useState([
    { id: 1, date: '2026.05.14', author: '이OO', tag: '위생', body: '식당 위생 민원은 시설팀보다 보건소 직접 연락이 빠름. 담당자 박OO (02-xxxx).' },
    { id: 2, date: '2026.04.22', author: '김OO', tag: '주차', body: '차단기 오류는 시설팀 직통(내선 234)으로 먼저 연락. 당일 처리 가능.' },
    { id: 3, date: '2026.03.02', author: '김OO', tag: '위생', body: '점검 완료 후 결과 사진 첨부 필수 — 민원인 재문의 방지용.' },
    { id: 4, date: '2026.02.15', author: '박OO', tag: '인허가', body: '토지 소유주 동의서는 개별 면담이 공문보다 빠름. 수원시 이OO 사례 참고.' },
    { id: 5, date: '2026.01.10', author: '최OO', tag: '예산', body: '재료 발주는 최소 2주 전 선행 필요. 납기 지연 시 사업 전체 일정 밀림.' },
  ]);

  // 작성란 태그 활성/비활성 토글
  const toggleTag = (index) => {
    setTags((prevTags) =>
      prevTags.map((tag, i) => (i === index ? { ...tag, active: !tag.active } : tag))
    );
  };

  // 새 태그 추가
  const addTag = () => {
    const val = newTagInput.trim();
    if (!val) return;

    if (!tags.some((tag) => tag.name === val)) {
      setTags([...tags, { name: val, active: true }]);
    }
    setNewTagInput('');
  };

  // 메모 저장 핸들러
  const handleSave = () => {
    let cardInfo;
    if (selectedCardId === 'new') {
      if (!newCardTitle.trim()) {
        alert('새 지식베이스의 제목을 입력해주세요.');
        return;
      }
      cardInfo = { type: 'new', title: newCardTitle.trim() };
    } else if (selectedCardId) {
      const selectedCard = existingCards.find(c => c.id === selectedCardId);
      cardInfo = { type: 'existing', id: selectedCardId, title: selectedCard?.title };
    } else {
      alert('지식베이스를 선택해주세요.');
      return;
    }

    const activeTags = tags.filter((t) => t.active).map((t) => t.name);
    if (activeTags.length === 0) {
        alert('태그를 하나 이상 선택해주세요.');
        return;
    }
    if (!memoText.trim()) {
        alert('노하우 내용을 입력해주세요.');
        return;
    }

    console.log('저장 대상 카드:', cardInfo);
    console.log('저장 대상 태그:', activeTags);
    console.log('메모 본문:', memoText);
    // 필요 시 여기에 실제 API 호출이나 상위 저장 로직을 연결하세요.
    alert('저장되었습니다. (콘솔 확인)');
  };

  // 현재 필터 조건에 맞게 가공된 로그 데이터
  const filteredLogs = currentFilter === 'all'
    ? logs
    : logs.filter((log) => log.tag === currentFilter);

  return {
    existingCards,
    selectedCardId,
    setSelectedCardId,
    newCardTitle,
    setNewCardTitle,
    tags,
    newTagInput,
    setNewTagInput,
    currentFilter,
    setCurrentFilter,
    memoText,
    setMemoText,
    filteredLogs,
    toggleTag,
    addTag,
    handleSave,
    logs, // 이전 로그 데이터도 반환하여 UI에서 활용
  };
}
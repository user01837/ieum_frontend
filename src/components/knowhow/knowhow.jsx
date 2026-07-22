import { useState, useMemo, useEffect } from 'react';
import { useKnowledgeListQuery, useKnowledgeDetailQuery, useKnowledgeTagsQuery } from '../../hooks/queries/useKnowledgeQuery';
import { useCreateKnowledgeLogMutation, useCreateKnowledgeTagMutation } from '../../hooks/mutations/useKnowledgeMutations';

export default function useKnowledgeMemo() {
  // --- API Hooks ---
  const { data: knowledgeListResponse, isLoading: isLoadingList } = useKnowledgeListQuery({ page: 0, size: 100 });
  const createTagMutation = useCreateKnowledgeTagMutation();
  const createLogMutation = useCreateKnowledgeLogMutation();

  // --- 지식베이스 선택 관련 상태 ---
  const existingCards = useMemo(() => (knowledgeListResponse?.items || []).map(item => ({
    id: item.knowledge_id,
    title: item.title,
  })), [knowledgeListResponse]);

  // 'new' 또는 카드 ID를 가질 수 있습니다.
  const [selectedCardId, setSelectedCardId] = useState(''); 
  const [newCardTitle, setNewCardTitle] = useState('');
  // --------------------------------

  // --- 상세 정보 및 태그 조회 ---
  const isValidKnowledgeId = selectedCardId && selectedCardId !== 'new';
  const { data: selectedKnowledgeDetail } = useKnowledgeDetailQuery(isValidKnowledgeId ? selectedCardId : null);
  
  const departmentCode = selectedKnowledgeDetail?.department_code;
  const { data: tagsData, isLoading: isLoadingTags } = useKnowledgeTagsQuery(departmentCode);
  
  const previousLogs = useMemo(() => {
    if (!selectedKnowledgeDetail?.logs) return [];
    return selectedKnowledgeDetail.logs.map(log => ({
      id: log.log_id,
      date: log.created_at?.split('T')[0].replace(/-/g, '.'),
      author: log.user_name,
      tag: log.tags?.[0]?.name || '미분류',
      body: log.content,
    })).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [selectedKnowledgeDetail]);

  // --- 노하우 작성 관련 상태 ---
  const [tags, setTags] = useState([]); // UI용 태그 목록 { id, name, active }
  const [newTagInput, setNewTagInput] = useState('');
  const [memoText, setMemoText] = useState('');

  // API에서 태그 목록을 가져오면 UI 상태로 변환
  useEffect(() => {
    if (tagsData) {
      setTags(tagsData.map(tag => ({ id: tag.tag_id, name: tag.name, active: false })));
    } else {
      setTags([]);
    }
  }, [tagsData]);

  // --- 이전 로그 필터링 ---
  const [currentFilter, setCurrentFilter] = useState('all');
  const filteredLogs = useMemo(() => {
    if (currentFilter === 'all') return previousLogs;
    return previousLogs.filter((log) => log.tag === currentFilter);
  }, [currentFilter, previousLogs]);

  // 작성란 태그 활성/비활성 토글
  const toggleTag = (tagId) => {
    setTags((prevTags) =>
      prevTags.map((tag) => (tag.id === tagId ? { ...tag, active: !tag.active } : tag))
    );
  };

  // 새 태그 추가
  const addTag = async () => {
    const val = newTagInput.trim();
    if (!val || !departmentCode) return;

    try {
      await createTagMutation.mutateAsync({
        name: val,
        department_code: departmentCode,
      });
      setNewTagInput('');
    } catch (error) {
      // 에러는 useCreateKnowledgeTagMutation의 onError에서 처리됨
    }
  };

  // 메모 저장 핸들러
  const handleSave = async () => {
    let knowledgeIdToSave = selectedCardId;

    if (selectedCardId === 'new') {
      alert('새 지식베이스 생성 기능은 현재 지원되지 않습니다. 카테고리, 공개범위 선택 기능이 필요합니다.');
      return;
    }
    
    if (!knowledgeIdToSave) {
      alert('지식베이스를 선택해주세요.');
      return;
    }

    const activeTags = tags.filter(t => t.active);
    let tagIdsToSave = activeTags.map(t => t.id);

    if (newTagInput.trim()) {
      try {
        const createdTag = await createTagMutation.mutateAsync({
          name: newTagInput.trim(),
          department_code: departmentCode,
        });
        tagIdsToSave.push(createdTag.tag_id);
      } catch (error) {
        return; // 태그 생성 실패 시 중단
      }
    }

    if (tagIdsToSave.length === 0) {
        alert('태그를 하나 이상 선택해주세요.');
        return;
    }
    if (!memoText.trim()) {
        alert('노하우 내용을 입력해주세요.');
        return;
    }

    createLogMutation.mutate({
      knowledgeId: knowledgeIdToSave,
      data: {
        content: memoText.trim(),
        tag_ids: tagIdsToSave,
      }
    }, {
      onSuccess: () => {
        // 성공 후 폼 초기화
        setMemoText('');
        setNewTagInput('');
        setTags(tags.map(t => ({ ...t, active: false })));
      }
    });
  };

  return {
    isLoadingList,
    existingCards,
    selectedCardId,
    setSelectedCardId,
    newCardTitle,
    setNewCardTitle,
    tags,
    isLoadingTags,
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
    logs: previousLogs,
  };
}
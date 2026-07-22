import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useKnowledgeTagsQuery } from '../../hooks/queries/useKnowledgeQuery';
import { useCreateKnowledgeTagMutation } from '../../hooks/mutations/useKnowledgeMutations';
import './KnowhowLogModal.css'; // 기존 CSS 재사용

function KnowhowLogModal({ logToEdit, departmentCode, onClose, onSave }) {
    const isEditMode = !!logToEdit;

    // 부서 코드에 해당하는 태그 목록을 API로 조회
    // data의 기본값을 제거하여 무한 루프를 방지합니다.
    const { data: tagsFromApi, isLoading: isLoadingTags } = useKnowledgeTagsQuery(departmentCode);
    const createTagMutation = useCreateKnowledgeTagMutation();

    const [selectedTagId, setSelectedTagId] = useState(null);
    const [newTag, setNewTag] = useState('');
    const [memo, setMemo] = useState('');

    // 수정 모드일 때, API 데이터가 로드되면 폼을 채웁니다.
    // 또한, 모달이 열릴 때마다 (isEditMode가 변경될 때마다) 상태를 올바르게 초기화합니다.
    useEffect(() => {
        if (isEditMode && tagsFromApi) {
            // 수정 모드: 폼 데이터 미리 채우기
            setMemo(logToEdit.content || '');
            // 기존 로그에 연결된 태그 중 첫 번째 태그를 선택된 것으로 설정
            const initialTagId = logToEdit.tags?.[0]?.tag_id || null;
            setSelectedTagId(initialTagId);
            setNewTag(''); // 수정 모드에서는 새 태그 입력을 항상 비웁니다.
        } else if (!isEditMode) {
            // 추가 모드: 폼 초기화
            setMemo('');
            setSelectedTagId(null);
            setNewTag('');
        }
    }, [isEditMode, logToEdit, tagsFromApi]);

    const handleTagClick = (tagId) => {
        // 이미 선택된 태그를 다시 클릭하면 선택 해제, 다른 태그를 클릭하면 선택 변경
        setSelectedTagId(prev => (prev === tagId ? null : tagId));
        setNewTag(''); // 기존 태그 선택 시 새 태그 입력 초기화
    };

    const handleSave = async () => {
        let tagIdToSave = selectedTagId;

        // 1. 새 태그가 입력되었는지 확인
        if (newTag.trim()) {
            try {
                // 2. 새 태그 생성 API 호출 (await로 완료 대기)
                const createdTag = await createTagMutation.mutateAsync({
                    name: newTag.trim(),
                    department_code: departmentCode,
                });
                tagIdToSave = createdTag.tag_id;
            } catch (error) {
                // 태그 생성 실패 시 (e.g., 중복) 함수 종료
                console.error("Tag creation failed:", error);
                return;
            }
        }

        if (!tagIdToSave) {
            alert('태그를 선택하거나 새로 입력해주세요.');
            return;
        }
        if (!memo.trim()) {
            alert('노하우 내용을 입력해주세요.');
            return;
        }

        // 3. 부모 컴포넌트로 저장 데이터 전달
        onSave({ content: memo.trim(), tag_ids: [tagIdToSave] });
    };

    return ReactDOM.createPortal(
        <div className="dk-modal-overlay" onClick={onClose}>
            <div className="dk-modal" onClick={e => e.stopPropagation()}>
                <div className="dk-modal-header">
                    <h3>{isEditMode ? '노하우 로그 수정' : '노하우 로그 추가'}</h3>
                    <button className="dk-modal-close-btn" onClick={onClose}>&times;</button>
                </div>
                <div className="dk-modal-body">
                    <div className="dk-form-group">
                        <label>태그</label>
                        <div className="dk-tag-select">
                            {isLoadingTags ? (
                                <div>태그 목록을 불러오는 중...</div>
                            ) : (
                                (tagsFromApi || []).map(tag => (
                                    <button
                                        key={tag.tag_id}
                                        type="button"
                                        className={`dk-tag-btn ${selectedTagId === tag.tag_id ? 'active' : ''}`}
                                        onClick={() => handleTagClick(tag.tag_id)}
                                    >
                                        {tag.name}
                                    </button>
                                ))
                            )}
                        </div>
                        <input
                            type="text"
                            placeholder="또는 새 태그 입력 후 저장"
                            value={newTag}
                            onChange={e => { setNewTag(e.target.value); setSelectedTagId(null); }}
                        />
                    </div>
                    <div className="dk-form-group">
                        <label>내용</label>
                        <textarea placeholder="공유할 노하우를 작성해주세요." value={memo} onChange={e => setMemo(e.target.value)}></textarea>
                    </div>
                </div>
                <div className="dk-modal-footer">
                    <button type="button" className="dk-modal-btn" onClick={onClose}>취소</button>
                    <button
                        type="button"
                        className="dk-modal-btn primary"
                        onClick={handleSave}
                        disabled={createTagMutation.isPending}
                    >
                        {createTagMutation.isPending ? '태그 생성 중...' : (isEditMode ? '수정 완료' : '저장')}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

export default KnowhowLogModal;
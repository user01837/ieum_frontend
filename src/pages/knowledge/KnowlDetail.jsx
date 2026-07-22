import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useDropzone } from 'react-dropzone';
import { useKnowledgeDetailQuery } from '../../hooks/queries/useKnowledgeQuery';
import {
  useUpdateKnowledgeMutation,
  useCreateKnowledgeLogMutation,
  useUpdateKnowledgeLogMutation,
  useDeleteKnowledgeLogMutation,
} from "../../hooks/mutations/useKnowledgeMutations";
import useAuthStore from '../../store/useAuthStore';
import '../Petition/Detail_petition.css'; // Shared styles
import './KnowlDetail.css';
import './KnowlCreate.css'; // 생성 페이지의 카테고리 스타일을 가져오기 위해 추가
import './knowl.css'; // 목록 페이지의 뱃지 스타일을 가져오기 위해 추가
import '../../styles/global.css';
import KnowhowLogModal from './KnowhowLogModal';
import Pagination from '../../components/Pagination/Pagination';

const TiptapToolbar = ({ editor }) => {
    if (!editor) return null;
    return (
        <div className="tiptap-toolbar">
            <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} disabled={!editor.can().chain().focus().toggleBold().run()} className={`t-tool ${editor.isActive('bold') ? 'is-active' : ''}`}><b>B</b></button>
            <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} disabled={!editor.can().chain().focus().toggleItalic().run()} className={`t-tool ${editor.isActive('italic') ? 'is-active' : ''}`}><i>I</i></button>
            <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} disabled={!editor.can().chain().focus().toggleStrike().run()} className={`t-tool ${editor.isActive('strike') ? 'is-active' : ''}`}><s>S</s></button>
        </div>
    );
};

const CATEGORY_CLASS_MAP = {
    '민원처리': 'badge-new',
    '사업추진': 'badge-warn',
    '예산': 'badge-done',
    '인허가': 'badge-done',
    '실패사례': 'badge-danger',
    '기타': 'badge-soft',
};

// 백엔드 `CATEGORY_NAME_MAP` 기반 카테고리 옵션
const CATEGORY_OPTIONS = [
    { key: '01', label: '민원처리' },
    { key: '02', label: '사업추진' },
    { key: '03', label: '예산' },
    { key: '04', label: '인허가' },
    { key: '05', label: '실패사례' },
    { key: '99', label: '기타' },
];

function DetailKnowl() {
    const { id: knowledgeId } = useParams();
    const navigate = useNavigate();
    const isAdmin = useMemo(() => useAuthStore.getState().user?.system_role_code === '02', []);
    const user = useAuthStore((state) => state.user);

    // API 데이터 조회 및 수정
    const { data: knowledgeData, isLoading, isError } = useKnowledgeDetailQuery(knowledgeId);
    const updateKnowledgeMutation = useUpdateKnowledgeMutation();
    const createLogMutation = useCreateKnowledgeLogMutation();
    const updateLogMutation = useUpdateKnowledgeLogMutation();
    const deleteLogMutation = useDeleteKnowledgeLogMutation();

    const [isEditing, setIsEditing] = useState(false);
    const [activeTag, setActiveTag] = useState('전체');
    const [modalInfo, setModalInfo] = useState({ isOpen: false, log: null }); // 모달 상태 통합
    const [searchTerm, setSearchTerm] = useState(''); // 사용자가 입력하는 검색어
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(''); // 디바운스 적용된 검색어

    // 페이지네이션 관련 State 설정

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5; // 한 페이지에 보여줄 카드 개수

    // --- 수정 모드용 데이터 상태 ---
    const [summary, setSummary] = useState('');
    const [warning, setWarning] = useState('');
    const [editingTitle, setEditingTitle] = useState(''); // 수정 모드용 제목 상태
    const [editingScopeCode, setEditingScopeCode] = useState(''); // 수정 모드용 공개범위 상태
    const [editingCategoryCode, setEditingCategoryCode] = useState(''); // 수정 모드용 카테고리 상태
    const [deletedAttachmentIds, setDeletedAttachmentIds] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [newFiles, setNewFiles] = useState([]);
    // --------------------------------

    // 노하우 로그 데이터 State
    const [knowhowLogs, setKnowhowLogs] = useState([]);

    // API 데이터를 로컬 상태에 동기화
    useEffect(() => {
        if (knowledgeData) {
            setSummary(knowledgeData.summary || '');
            setEditingTitle(knowledgeData.title || '');
            setWarning(knowledgeData.warning_note || '');
            setEditingCategoryCode(knowledgeData.category_code || '');
            setEditingScopeCode(knowledgeData.scope_code || '01');
            // API 응답의 attachments를 UI 상태에 맞게 매핑
            const apiAttachments = (knowledgeData.attachments || []).map(att => ({
                id: att.attachment_id,
                name: att.file_name,
                url: att.file_url,
            }));
            setDocuments(apiAttachments);

            // API 로그 구조를 UI에서 사용하는 구조로 매핑하고 최신순으로 정렬
            const mappedLogs = (knowledgeData.logs || []).map(log => ({
                id: log.log_id,
                tags: log.tags, // 수정 모달에 전달할 전체 태그 배열
                tag: log.tags?.[0]?.name || '미분류',
                author: log.user_name,
                date: log.created_at?.split('T')[0].replace(/-/g, '.'),
                content: log.content,
                // 수정 여부 판단
                updatedBy: log.updated_at && log.updated_at !== log.created_at ? (log.updated_by_name || '수정자 정보 없음') : null,
                updateDate: log.updated_at?.split('T')[0].replace(/-/g, '.'),
        })).sort((a, b) => new Date(b.updateDate || b.date) - new Date(a.updateDate || a.date)); // 최신순 정렬

            setKnowhowLogs(mappedLogs);
        }
    }, [knowledgeData]);

    // warning_note 내용이 비어있는지 확인하여 렌더링 여부를 결정합니다.
    const isWarningVisible = useMemo(() => {
        if (!warning) return false;
        // Tiptap 에디터의 빈 콘텐츠는 '<p></p>'일 수 있으므로,
        // HTML 태그를 제거하고 남은 텍스트가 있는지 확인합니다.
        const textContent = warning.replace(/<[^>]+>/g, '').trim();
        return textContent.length > 0;
    }, [warning]);

    // 공개범위 수정 가능 여부 확인
    const canEditScope = useMemo(() => {
        if (!isEditing || !user || !knowledgeData) {
            return false;
        }
        return user.departmentCode === knowledgeData.department_code;
    }, [isEditing, user, knowledgeData]);

    const handleDownload = useCallback(async (e, fileUrl, fileName) => {
        e.preventDefault();
        e.stopPropagation();
    
        if (!fileUrl) return;
    
        try {
            const response = await fetch(fileUrl);
            if (!response.ok) throw new Error('파일을 불러오는데 실패했습니다.');
    
            const blob = await response.blob();
            
            // 1. 강제 다운로드를 위해 MIME 타입을 octet-stream으로 지정
            const downloadedBlob = new Blob([blob], { type: 'application/octet-stream' });
            const url = window.URL.createObjectURL(downloadedBlob);
    
            // 2. 보이지 않는 임시 iframe 생성
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = url;
            document.body.appendChild(iframe);
    
            // 3. 백업용 a 태그 다운로드 동시 실행
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName || 'download');
            document.body.appendChild(link);
            link.click();
    
            // 4. 메모리 정리
            setTimeout(() => {
                iframe.remove();
                link.remove();
                window.URL.revokeObjectURL(url);
            }, 1000);
    
        } catch (error) {
            console.error('Download error:', error);
            alert('다운로드 중 오류가 발생했습니다.');
        }
    }, []);

    // 노하우 추가/수정 통합 처리
    const handleSaveLog = (logData) => {
        if (modalInfo.log) { // 수정
            updateLogMutation.mutate({
                logId: modalInfo.log.id,
                knowledgeId,
                data: { content: logData.content, tag_ids: logData.tag_ids },
            });
        } else { // 추가 모드
            createLogMutation.mutate({
                knowledgeId,
                data: { content: logData.content, tag_ids: logData.tag_ids },
            });
        }
        setModalInfo({ isOpen: false, log: null }); // 모달 닫기
    };

    // 태그 목록 추출
    const allTags = useMemo(() => {
        return ['전체', ...new Set(knowhowLogs.map(log => log.tag))];
    }, [knowhowLogs]);

    // 디바운스 효과: searchTerm이 변경될 때마다 300ms 후에 debouncedSearchTerm을 업데이트
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);

        // 컴포넌트가 언마운트되거나 searchTerm이 다시 변경되면 타이머를 클리어
        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);

    // 태그 선택 또는 검색 실행 시 1페이지로 리셋
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTag, debouncedSearchTerm]);

    // 태그 필터링된 전체 로그
    const filteredLogs = useMemo(() => {
        let logs = knowhowLogs;
        // 1. 태그로 필터링
        if (activeTag !== '전체') {
            logs = logs.filter(log => log.tag === activeTag);
        }
        // 2. 검색어로 필터링 (디바운스된 값 사용)
        if (debouncedSearchTerm.trim()) {
            logs = logs.filter(log => log.content.toLowerCase().includes(debouncedSearchTerm.trim().toLowerCase()));
        }
        return logs;
    }, [activeTag, knowhowLogs, debouncedSearchTerm]);

    // ==========================================
    // 📄 페이지네이션 계산 로직
    // ==========================================
    const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);

    const currentLogs = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredLogs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredLogs, currentPage, ITEMS_PER_PAGE]);

    const handlePageChange = useCallback((pageNumber) => {
        setCurrentPage(pageNumber);
    }, []);

    // 노하우 로그 삭제 처리
    const handleDeleteLog = (logId) => {
        if (window.confirm('이 노하우 로그를 삭제하시겠습니까?')) {
            deleteLogMutation.mutate({ logId, knowledgeId });
        }
    };

    // --- Tiptap 에디터 설정 ---
    const summaryEditor = useEditor({
        extensions: [StarterKit, Placeholder.configure({ placeholder: '핵심 요약을 입력하세요...' })],
        content: summary,
        editable: isEditing,
    });

    const warningEditor = useEditor({
        extensions: [StarterKit, Placeholder.configure({ placeholder: '중요 안내사항을 입력하세요...' })],
        content: warning,
        editable: isEditing,
    });

    // --- 파일 업로드(react-dropzone) 설정 ---
    const onDrop = useCallback(acceptedFiles => {
        setNewFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
    }, []);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: true });

    const removeNewFile = (fileToRemove) => {
        setNewFiles(prevFiles => prevFiles.filter(file => file !== fileToRemove));
    };
    const removeExistingFile = (docId) => {
        // UI에서 파일을 숨기고, 저장 시 삭제할 ID 목록에 추가
        if (window.confirm('이 첨부파일을 삭제하시겠습니까? (저장 시 반영됩니다)')) {
            setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== docId));
            setDeletedAttachmentIds(prevIds => [...prevIds, docId]);
        }
    };

    // --- 수정 모드 핸들러 ---
    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        // API 데이터로 UI 상태 복원
        if (knowledgeData) {
            const apiAttachments = (knowledgeData.attachments || []).map(att => ({
                id: att.attachment_id,
                name: att.file_name,
                url: att.file_url,
            }));
            setDocuments(apiAttachments);
        }
        setNewFiles([]); // 새로 추가된 파일 목록 비우기
        setDeletedAttachmentIds([]); // 삭제 예정 목록 초기화
        setIsEditing(false);
    };

    const handleSave = () => {
        if (!editingTitle.trim()) {
            alert('제목을 입력해주세요.');
            return;
        }

        // 에디터 내용을 상태에 저장
        setSummary(summaryEditor.getHTML());
        setWarning(warningEditor.getHTML());

        const formData = new FormData();
        formData.append('title', editingTitle.trim());
        formData.append('summary', summaryEditor.getHTML());
        formData.append('warning_note', warningEditor.getHTML());
        formData.append('category_code', editingCategoryCode);
        formData.append('scope_code', editingScopeCode);

        // 새로 추가된 파일들을 FormData에 추가
        newFiles.forEach(file => {
            formData.append('files', file);
        });

        // 삭제할 첨부파일 ID들을 FormData에 추가
        deletedAttachmentIds.forEach(id => {
            formData.append('deleted_attachment_ids', id);
        });

        updateKnowledgeMutation.mutate({
            knowledgeId,
            // FormData를 전송합니다. API 함수는 이를 처리하도록 수정되어야 합니다.
            data: formData,
        }, { onSuccess: () => {
            setIsEditing(false);
            setNewFiles([]);
            setDeletedAttachmentIds([]);
        } });
    };

    // isEditing 상태가 변경될 때 에디터의 편집 가능 상태를 업데이트
    useEffect(() => {
        summaryEditor?.setEditable(isEditing);
        warningEditor?.setEditable(isEditing);

        // 수정 모드로 전환될 때, API에서 받아온 최신 데이터로 에디터 내용을 채웁니다.
        // isEditing이 true일 때만 실행하여 불필요한 업데이트를 방지합니다.
        if (isEditing && knowledgeData) {
            setEditingTitle(knowledgeData.title || '');
            setEditingScopeCode(knowledgeData.scope_code || '01');
            if (summaryEditor && !summaryEditor.isDestroyed) {
                summaryEditor.commands.setContent(knowledgeData.summary || '');
            }
            if (warningEditor && !warningEditor.isDestroyed) {
                warningEditor.commands.setContent(knowledgeData.warning_note || '');
            }
        }
    }, [isEditing, summaryEditor, warningEditor, knowledgeData]);

    if (isLoading) {
        return (
            <div className="dcontent" style={{ textAlign: 'center', padding: '50px' }}>
                <h2>지식 정보를 불러오는 중입니다...</h2>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="dcontent" style={{ textAlign: 'center', padding: '50px', color: 'var(--danger)' }}>
                <h2>오류가 발생했습니다.</h2>
            </div>
        );
    }

    return (
        <>
            {modalInfo.isOpen && (
                <KnowhowLogModal
                    logToEdit={modalInfo.log}
                    departmentCode={knowledgeData?.department_code}
                    onClose={() => setModalInfo({ isOpen: false, log: null })}
                    onSave={handleSaveLog}
                />
            )}

            <div className="dcontent">
                {/* 상단 네비게이션 */}
                <div className="top-nav">
                    <div
                        className="breadcrumb"
                        onClick={() => navigate('/knowledge')}
                        style={{ cursor: 'pointer' }}
                    >
                        &lt; 목록으로 <span>|</span> 홈 &gt; 지식베이스 &gt; 상세 조회
                    </div>

                    {!isAdmin && (
                        isEditing ? (
                            <div className="card-actions">
                                <button className="btn-edit-main" onClick={handleCancel}>
                                    취소
                                </button>
                                <button className="btn-edit-main primary" onClick={handleSave}>
                                    저장
                                </button>
                            </div>
                        ) : (
                            <button className="btn-edit-main" onClick={handleEdit}>
                                수정
                            </button>
                        )
                    )}
                </div>

                {isAdmin && (
                    <div className="locked-banner">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="4" y="10" width="16" height="10" rx="2" />
                            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                        </svg>
                        관리자 계정은 열람만 가능합니다.
                    </div>
                )}

                {/* 문서 헤더 카드 */}
                <div className="section-card">
                    {isEditing ? (
                        <div className="form-group" style={{ marginBottom: '12px' }}>
                            <label style={{ marginBottom: '10px' }}>카테고리 <span className="required">*</span></label>
                            <div className="category">
                                {CATEGORY_OPTIONS.map(opt => (
                                    <label key={opt.key}>
                                        <input
                                            type="radio"
                                            name="category"
                                            value={opt.key}
                                            checked={editingCategoryCode === opt.key}
                                            onChange={(e) => setEditingCategoryCode(e.target.value)}
                                        />
                                        {opt.label}
                                    </label>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <span className={`header-badge ${CATEGORY_CLASS_MAP[knowledgeData?.category_name] || 'badge-soft'}`}>
                            {knowledgeData?.category_name || '미분류'}
                        </span>
                    )}
                    {isEditing ? (
                        <div className="form-group" style={{ margin: '12px 0 10px' }}>
                            <input
                                type="text"
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                placeholder="제목을 입력하세요"
                                style={{ fontSize: '17px', fontWeight: '700', padding: '10px', border: '1px solid var(--line-strong)', borderRadius: '8px', width: '100%' }}
                            />
                        </div>
                    ) : (
                        <h1 className="dtitle">{knowledgeData?.title || '제목 없음'}</h1>
                    )}
                    <div className="doc-meta">
                        <span>최초 작성자: {knowledgeData?.created_by_name || '정보 없음'}</span>
                        <span>최종 수정일: {knowledgeData?.updated_at?.split('T')[0] || '정보 없음'}</span>
                    </div>
                </div>

                {/* 핵심 요약 카드 */}
                <div className="section-card">
                    <h2 className="section-title">핵심 요약</h2>
                    {isEditing ? (
                        <>
                            <div className="tiptap-bordered" style={{ marginBottom: '12px' }}>
                                <TiptapToolbar editor={summaryEditor} />
                                <EditorContent editor={summaryEditor} className="tiptap-editor" />
                            </div>
                            <div className="tiptap-bordered warning-editor">
                                <div className="alert-icon-wrapper">⚠️</div>
                                <EditorContent editor={warningEditor} className="tiptap-editor" />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="prose-content" dangerouslySetInnerHTML={{ __html: summary }} />
                            {isWarningVisible && (
                                <div className="alert-box">
                                    ⚠️ <span dangerouslySetInnerHTML={{ __html: warning }} />
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* 노하우 로그 카드 */}
                <div className="section-card">
                    <div className="knowhow-header">
                        <h2 className="section-title" style={{ marginBottom: 0 }}>노하우 로그</h2>
                        {!isAdmin && <button className="btn-add" onClick={() => setModalInfo({ isOpen: true, log: null })}>+ 노하우 추가</button>}
                    </div>
                    <p className="knowhow-sub">담당자가 직접 남기는 실무 경험 (최신순 제공 / 수정 가능)</p>

                    <div className="knowhow-controls">
                        {/* 태그 필터 칩 */}
                        <div className="tag-filters">
                            {allTags.map(tag => (
                                <button 
                                    key={tag} 
                                    className={`tag-chip ${activeTag === tag ? 'active' : ''}`}
                                    onClick={() => setActiveTag(tag)}
                                >
                                    {tag === '전체' ? `${tag} (${knowhowLogs.length})` : tag}
                                </button>
                            ))}
                        </div>
                        {/* 검색창 */}
                        <div className="search-wrapper">
                            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            <input 
                                type="text" 
                                className="search-input"
                                placeholder="로그 내용 검색..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* 노하우 카드 리스트 (현재 페이지 슬라이스된 로그 출력) */}
                    <div className="knowhow-list">
                        {currentLogs.length > 0 ? (
                            currentLogs.map(log => (
                                <div className="knowhow-card" key={log.id}>
                                    <div className="knowhow-card-header">
                                        <div className="card-tags-group">
                                            <span className={`knowhow-tag ${log.tag}`}>{log.tag}</span>
                                            <span className="knowhow-author">
                                                {log.author} · {log.updatedBy ? log.updateDate : log.date}
                                                {log.updatedBy && <span className="edited-mark">(수정됨)</span>}
                                            </span>
                                        </div>
                                        {!isAdmin && (
                                            <div className="card-actions">
                                                <button className="btn-card-edit" onClick={() => setModalInfo({ isOpen: true, log: log })}>수정</button>
                                                <button className="btn-card-delete" onClick={() => handleDeleteLog(log.id)}>삭제</button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="knowhow-content">
                                        {log.content}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: '30px 0', color: '#94a3b8', fontSize: '14px' }}>
                                해당되는 노하우 로그가 없습니다.
                            </div>
                        )}
                    </div>

                    {/* ==========================================
                       📄 페이지네이션 UI 컨트롤러
                       ========================================== */}
                    {totalPages > 1 && (
                        <div className="pagination-wrapper">
                            <Pagination
                                totalItems={filteredLogs.length}
                                itemsPerPage={ITEMS_PER_PAGE}
                                currentPage={currentPage}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </div>

                {/* 관련 문서 카드 */}
                <div className="section-card">
                    <h2 className="section-title">관련 문서 / 공문</h2>
                    <div className="related-links">
                        {isEditing && (
                            <div {...getRootProps({ className: `attach-addbtn ${isDragActive ? 'dropzone-active' : ''}` })} style={{ justifyContent: 'center', flexDirection: 'column', maxWidth: '100%', marginBottom: '12px' }}>
                                <input {...getInputProps()} />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <i className="ti ti-upload" style={{fontSize: '18px'}}></i>
                                    파일을 드래그하거나 클릭하여 업로드
                                </div>
                            </div>
                        )}
                        <div className="attach-list" style={{ marginTop: '12px' }}>
                            {documents.map(doc => (
                                <div key={doc.id} className="reply-attach-chip">
                                    <svg className="ic" viewBox="0 0 24 24"><path fill="currentColor" d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 0 1 5 0v10.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c-1.93 0-3.5 1.57-3.5 3.5v11.5c0 2.76 2.24 5 5 5s5-2.24 5-5V6h-1.5z"></path></svg>
                                    <a href={doc.url} onClick={(e) => handleDownload(e, doc.url, doc.name)} style={{ cursor: 'pointer', flex: '1' }}>
                                        {doc.name}
                                    </a>
                                    {isEditing && (
                                        <button className="rm" onClick={() => removeExistingFile(doc.id)}>
                                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"></path></svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                            {newFiles.map((file, index) => (
                                <div key={index} className="reply-attach-chip">
                                    <svg className="ic" viewBox="0 0 24 24"><path fill="currentColor" d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 0 1 5 0v10.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c-1.93 0-3.5 1.57-3.5 3.5v11.5c0 2.76 2.24 5 5 5s5-2.24 5-5V6h-1.5z"></path></svg>
                                    <span>{file.name} - {(file.size / 1024).toFixed(2)} KB</span>
                                    {isEditing && (
                                        <button className="rm" onClick={() => removeNewFile(file)}>
                                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"></path></svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {canEditScope && (
                    <div className="section-card">
                        <h2 className="section-title">공개범위 설정</h2>
                        <div className="form-group" style={{marginBottom: 0}}>
                            <div className="category">
                                <label>
                                    <input 
                                        type="radio" 
                                        name="scope" 
                                        value="01"
                                        checked={editingScopeCode === '01'}
                                        onChange={(e) => setEditingScopeCode(e.target.value)}
                                    />
                                     같은 과 공개
                                </label>
                                <label>
                                    <input type="radio" name="scope" value="02" checked={editingScopeCode === '02'} onChange={(e) => setEditingScopeCode(e.target.value)} />
                                     전체 부서 공개
                                </label>
                            </div>
                            <p className="hint">{editingScopeCode === '01' ? '같은 과 내의 직원들만 이 지식베이스를 조회할 수 있습니다.' : '모든 부서의 직원들이 이 지식베이스를 조회할 수 있습니다.'}</p>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
    
}

export default DetailKnowl;
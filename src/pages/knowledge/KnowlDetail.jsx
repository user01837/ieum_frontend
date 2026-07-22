import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useDropzone } from 'react-dropzone';
import { useKnowledgeDetailQuery } from '../../hooks/queries/useKnowledgeQuery';
import { useUpdateKnowledgeMutation } from '../../hooks/mutations/useKnowledgeMutations';
import '../Petition/Detail_petition.css'; // Shared styles
import './KnowlDetail.css';
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

function DetailKnowl() {
    const { id: knowledgeId } = useParams();
    const navigate = useNavigate();

    // API 데이터 조회 및 수정
    const { data: knowledgeData, isLoading, isError } = useKnowledgeDetailQuery(knowledgeId);
    const updateKnowledgeMutation = useUpdateKnowledgeMutation();

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
    const [documents, setDocuments] = useState([
        // { id: 1, name: '도로교통법 시행규칙 별표28.pdf', url: '#!' }, // API 연동 후 제거 예정
    ]);
    const [newFiles, setNewFiles] = useState([]);
    // --------------------------------

    // 노하우 로그 데이터 State
    const [knowhowLogs, setKnowhowLogs] = useState([]);

    // API 데이터를 로컬 상태에 동기화
    useEffect(() => {
        if (knowledgeData) {
            setSummary(knowledgeData.summary || '');
            setWarning(knowledgeData.warning_note || '');
            // TODO: API 응답에 첨부파일이 포함되면 아래 주석 해제
            // setDocuments(knowledgeData.attachments || []);

            // API 로그 구조를 UI에서 사용하는 구조로 매핑하고 최신순으로 정렬
            const mappedLogs = (knowledgeData.logs || []).map(log => ({
                id: log.log_id,
                // API에서는 태그가 여러 개일 수 있으므로, UI에서는 첫 번째 태그를 대표로 표시
                tag: log.tags[0]?.name || '미분류',
                author: log.user_name,
                date: log.created_at?.split('T')[0].replace(/-/g, '.'),
                content: log.content,
                // 수정 여부 판단
                updatedBy: log.updated_at && log.updated_at !== log.created_at ? (log.updated_by_name || '수정자 정보 없음') : null,
                updateDate: log.updated_at?.split('T')[0].replace(/-/g, '.'),
            })).sort((a, b) => new Date(b.date) - new Date(a.date)); // 최신순 정렬

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

    // 노하우 추가/수정 통합 처리
    const handleSaveLog = (logData) => {
        if (modalInfo.log) { // 수정 모드
            setKnowhowLogs(prev => prev.map(log => 
                log.id === logData.id 
                ? { 
                    ...log,
                    ...logData,
                    updatedBy: '나(테스트)',
                    updateDate: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
                  }
                : log
            ));
            alert('로그가 수정되었습니다.');
        } else { // 추가 모드
            const newLogEntry = {
                id: Date.now(),
                date: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
                author: '나(테스트)',
                tag: logData.tag || '일반',
                content: logData.body || logData.content,
                updatedBy: null,
            };
            setKnowhowLogs(prev => [newLogEntry, ...prev]);
            setCurrentPage(1);
            alert('새로운 노하우 로그가 추가되었습니다.');
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
            setKnowhowLogs(prev => prev.filter(log => log.id !== logId));
            alert('로그가 삭제되었습니다.');
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
        setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== docId));
    };

    // --- 수정 모드 핸들러 ---
    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        // API에서 받아온 원본 데이터로 에디터 내용 복구
        if (knowledgeData) {
            summaryEditor?.commands.setContent(knowledgeData.summary || '');
            warningEditor?.commands.setContent(knowledgeData.warning_note || '');
        }
        setNewFiles([]); // 새로 추가된 파일 목록 비우기
        setIsEditing(false);
    };

    const handleSave = () => {
        // 에디터 내용을 상태에 저장
        setSummary(summaryEditor.getHTML());
        setWarning(warningEditor.getHTML());

        updateKnowledgeMutation.mutate({
            knowledgeId,
            data: {
                summary: summaryEditor.getHTML(),
                warning_note: warningEditor.getHTML(),
                // TODO: 파일 업로드 로직 추가 필요
            },
        }, { onSuccess: () => setIsEditing(false) });
    };

    // isEditing 상태가 변경될 때 에디터의 편집 가능 상태를 업데이트
    useEffect(() => {
        summaryEditor?.setEditable(isEditing);
        warningEditor?.setEditable(isEditing);
    }, [isEditing, summaryEditor, warningEditor]);

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
                    existingTags={[...new Set(knowhowLogs.map(log => log.tag))]}
                    onClose={() => setModalInfo({ isOpen: false, log: null })}
                    onSave={handleSaveLog}
                />
            )}

            <div className="dcontent">
                {/* 상단 네비게이션 */}
                <div className="top-nav">
                    <div className="breadcrumb" onClick={() => navigate('/knowledge')} style={{ cursor: 'pointer' }}>
                        &lt; 목록으로 <span>|</span> 홈 &gt; 지식베이스 &gt; 상세 조회
                    </div>
                    {isEditing ? (
                        <div className="card-actions">
                            <button className="btn-edit-main" onClick={handleCancel}>취소</button>
                            <button className="btn-edit-main primary" onClick={handleSave}>저장</button>
                        </div>
                    ) : (
                        <button className="btn-edit-main" onClick={handleEdit}>수정</button>
                    )}
                </div>

                {/* 문서 헤더 카드 */}
                <div className="section-card">
                    <span className={`header-badge ${CATEGORY_CLASS_MAP[knowledgeData?.category_name] || 'badge-soft'}`}>
                        {knowledgeData?.category_name || '미분류'}
                    </span>
                    <h1 className="dtitle">{knowledgeData?.title || '제목 없음'}</h1>
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
                        <button className="btn-add" onClick={() => setModalInfo({ isOpen: true, log: null })}>+ 노하우 추가</button>
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
                                        <div className="card-actions">
                                            <button className="btn-card-edit" onClick={() => setModalInfo({ isOpen: true, log: log })}>수정</button>
                                            <button className="btn-card-delete" onClick={() => handleDeleteLog(log.id)}>삭제</button>
                                        </div>
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
                        <div className="doc-list">
                            {documents.map(doc => (
                                <div key={doc.id} className="doc-item">
                                    <a href={doc.url}><i className="ti ti-file" aria-hidden="true"></i> {doc.name}</a>
                                    {isEditing && (
                                        <button className="doc-remove-btn" onClick={() => removeExistingFile(doc.id)}>&times;</button>
                                    )}
                                </div>
                            ))}
                            {newFiles.map((file, index) => (
                                <div key={index} className="doc-item new">
                                    <a><i className="ti ti-file" aria-hidden="true"></i> {file.name}</a>
                                    {isEditing && (
                                        <button className="doc-remove-btn" onClick={() => removeNewFile(file)}>&times;</button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default DetailKnowl;
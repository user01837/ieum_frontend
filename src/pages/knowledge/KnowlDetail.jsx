import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useDropzone } from 'react-dropzone';
import '../Petition/Detail_petition.css'; // Shared styles
import './KnowlDetail.css';
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

function DetailKnowl() {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [activeTag, setActiveTag] = useState('전체');
    const [modalInfo, setModalInfo] = useState({ isOpen: false, log: null }); // 모달 상태 통합
    const [searchTerm, setSearchTerm] = useState(''); // 사용자가 입력하는 검색어
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(''); // 디바운스 적용된 검색어

    // 페이지네이션 관련 State 설정

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5; // 한 페이지에 보여줄 카드 개수

    // --- 수정 모드용 데이터 상태 ---
    const [summary, setSummary] = useState('<ul><li>이의신청 기한은 단속일로부터 60일.</li><li>과태료 감경은 사전납부(20%) 또는 자진납부(20%) 중 하나만 적용.</li></ul>');
    const [warning, setWarning] = useState('단속 영상은 정보공개청구 외 경로로 전달 제공 불가 — 직접 제공 시 개인정보보호법 위반');
    const [documents, setDocuments] = useState([
        { id: 1, name: '도로교통법 시행규칙 별표28.pdf', url: '#!' },
        { id: 2, name: '불법주정차 단속 메뉴얼.hwp', url: '#!' },
    ]);
    const [newFiles, setNewFiles] = useState([]);
    // --------------------------------

    // 노하우 로그 데이터 State
    const [knowhowLogs, setKnowhowLogs] = useState([
        { 
            id: 1, 
            tag: '시스템', 
            author: '정OO', 
            date: '2024.07.02', 
            content: '단속 시스템에서 차량번호 오인식 시, 수기 정정 후 내부 결재 필요. 전산팀 박대리(내선 8912)에게 문의.', 
            updatedBy: '이OO', 
            updateDate: '2026.07.18', 
            updateReason: '담당자 변경 (김대리 → 박대리)' 
        },
        { 
            id: 2, 
            tag: '민원대응', 
            author: '최OO', 
            date: '2024.06.15', 
            content: '장애인 주차구역 위반은 과태료 감경 대상이 아님을 명확히 안내해야 함.', 
            updatedBy: null 
        },
        { 
            id: 3, 
            tag: '정보공개', 
            author: '이OO', 
            date: '2024.06.01', 
            content: '단속 영상은 정보공개청구를 통해서만 제공 가능. 민원인이 직접 방문하여 열람하는 것이 원칙.', 
            updatedBy: null 
        },
        { 
            id: 4, 
            tag: '민원대응', 
            author: '박OO', 
            date: '2024.05.10', 
            content: '반복적인 불법 주정차 민원인은 최초 1회 경고 후, 2회차부터 즉시 과태료 부과. 관련 근거: 도로교통법 제32조.', 
            updatedBy: null 
        },
        { 
            id: 5, 
            tag: '시스템', 
            author: '김OO', 
            date: '2024.04.20', 
            content: '야간 단속 카메라 오작동 시 서버 재부팅 후 로그 확인 필요.', 
            updatedBy: null 
        },
        { 
            id: 6, 
            tag: '민원대응', 
            author: '김민준', 
            date: '2024.04.15', 
            content: '전화 민원 응대 시, 소속과 이름을 먼저 밝히고 용건을 물어보는 것이 신뢰도를 높입니다.', 
            updatedBy: null 
        },
        { 
            id: 7, 
            tag: '정보공개', 
            author: '이서연', 
            date: '2024.04.10', 
            content: '정보공개 청구서에 기재된 내용이 불명확할 경우, 보완 요청 공문을 발송해야 합니다. (7일 이내)', 
            updatedBy: null 
        },
    ]);

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
        // 에디터 내용을 원래대로 복구
        summaryEditor?.commands.setContent(summary);
        warningEditor?.commands.setContent(warning);
        setNewFiles([]); // 새로 추가된 파일 목록 비우기
        setIsEditing(false);
    };

    const handleSave = () => {
        // 에디터 내용을 상태에 저장
        setSummary(summaryEditor.getHTML());
        setWarning(warningEditor.getHTML());
        
        // 실제 앱에서는 여기서 newFiles를 서버에 업로드하고,
        // 응답으로 받은 파일 정보로 documents 상태를 업데이트합니다.
        // 여기서는 임시로 합칩니다.
        const newlyAddedDocs = newFiles.map((file, index) => ({ id: `new-${Date.now()}-${index}`, name: file.name, url: '#!' }));
        setDocuments(prev => [...prev, ...newlyAddedDocs]);
        setNewFiles([]);

        setIsEditing(false);
        alert('저장되었습니다.');
    };

    // isEditing 상태가 변경될 때 에디터의 편집 가능 상태를 업데이트
    useEffect(() => {
        summaryEditor?.setEditable(isEditing);
        warningEditor?.setEditable(isEditing);
    }, [isEditing, summaryEditor, warningEditor]);

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
                    <span className="header-badge">사업추진</span>
                    <h1 className="doc-title">불법 주정차 단속 민원 처리</h1>
                    <div className="doc-meta">
                        <span>최초 작성자: 김OO</span>
                        <span>최종 수정일: 2026-07-18</span>
                    </div>
                </div>

                {/* 핵심 요약 카드 */}
                <div className="section-card">
                    <h2 className="summary-title">핵심 요약</h2>
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
                            <div className="alert-box">
                                ⚠️ <span dangerouslySetInnerHTML={{ __html: warning }} />
                            </div>
                        </>
                    )}
                </div>

                {/* 노하우 로그 카드 */}
                <div className="section-card">
                    <div className="knowhow-header">
                        <h2 className="summary-title" style={{ marginBottom: 0 }}>노하우 로그</h2>
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
                    <h2 className="related-title">관련 문서 / 공문</h2>
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
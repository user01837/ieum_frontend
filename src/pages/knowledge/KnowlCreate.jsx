import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useDropzone } from 'react-dropzone';
import { useCreateKnowledgeMutation } from '../../hooks/mutations/useKnowledgeMutations';
import './KnowlCreate.css';
import '../Petition/Detail_petition.css'; // 상세 페이지 공통 스타일
import '../../styles/global.css';

const TiptapToolbar = ({ editor }) => {
    if (!editor) {
      return null;
    }
  
    return (
      <div className="tiptap-toolbar">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`t-tool ${editor.isActive('bold') ? 'is-active' : ''}`}
        >
          <b>B</b>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`t-tool ${editor.isActive('italic') ? 'is-active' : ''}`}
        >
          <i>I</i>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className={`t-tool ${editor.isActive('strike') ? 'is-active' : ''}`}
        >
          <s>S</s>
        </button>
      </div>
    );
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

function KnowlCreate() {
    const navigate = useNavigate();
    const createKnowledgeMutation = useCreateKnowledgeMutation();

    const [title, setTitle] = useState('');
    const [categoryCode, setCategoryCode] = useState('');
    const [warningNote, setWarningNote] = useState('');
    const [attachedFiles, setAttachedFiles] = useState([]);
    const [scope, setScope] = useState('01'); // '01': 내 부서, '02': 전체 부서

    const onDrop = useCallback(acceptedFiles => {
        setAttachedFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
    }, []);

    const onDropRejected = useCallback((fileRejections) => {
        fileRejections.forEach(({ file, errors }) => {
            errors.forEach(error => {
                if (error.code === 'file-too-large') {
                    alert(`오류: "${file.name}" 파일의 크기가 너무 큽니다. (최대 10MB)`);
                } else if (error.code === 'file-invalid-type') {
                    alert(`오류: "${file.name}" 파일은 허용되지 않는 파일 형식입니다.`);
                } else {
                    alert(`오류: ${file.name} - ${error.message}`);
                }
            });
        });
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        onDropRejected,
        multiple: true,
        maxSize: 10485761, // 10MB
        accept: {
            'image/jpeg': ['.jpeg', '.jpg'],
            'image/png': ['.png'],
            'image/gif': ['.gif'],
            'application/pdf': ['.pdf'],
            'application/zip': ['.zip'],
            'application/x-hwp': ['.hwp'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        }
    });

    const removeFile = (file) => {
        setAttachedFiles(prevFiles => prevFiles.filter(f => f !== file));
    };

    const summaryEditor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: '업무 절차, 핵심 노하우 등을 입력하세요.',
            }),
        ],
        content: '',
    });

    useEffect(() => {
        return () => {
            summaryEditor?.destroy();
        };
    }, [summaryEditor]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!title.trim()) {
            alert('제목을 입력해주세요.');
            return;
        }
        if (!categoryCode) {
            alert('카테고리를 선택해주세요.');
            return;
        }

        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('category_code', categoryCode);
        formData.append('scope_code', scope);

        // Tiptap 에디터 내용이 실제 있을 때만 추가
        if (summaryEditor && summaryEditor.getText().trim().length > 0) {
            formData.append('summary', summaryEditor.getHTML());
        }

        if (warningNote.trim()) {
            formData.append('warning_note', warningNote.trim());
        }

        // 첨부 파일 추가
        attachedFiles.forEach(file => {
            formData.append('files', file);
        });

        // 뮤테이션 실행
        createKnowledgeMutation.mutate(formData);
    };

    return (
        <div className="dcontent">
            <div className="back" onClick={() => navigate(-1)}>
                <i className="ti ti-arrow-left"></i> 목록으로
            </div>

            <div className="breadcrumb">
                홈 &gt; 지식베이스 &gt; 새 지식 작성
            </div>

            <div className="header">
                <h2>새 지식베이스 작성</h2>
            </div>

            <form onSubmit={handleSubmit}>
                {/* 기본 정보 */}
                <div className="card">
                    <div className="card-title">
                        기본 정보
                    </div>
                    <div className="form-group">
                        <label>
                            카테고리
                            <span className="required">*</span>
                        </label>
                        <div className="category">
                            {CATEGORY_OPTIONS.map(opt => (
                                <label key={opt.key}>
                                    <input
                                        type="radio"
                                        name="category"
                                        value={opt.key}
                                        checked={categoryCode === opt.key}
                                        onChange={(e) => setCategoryCode(e.target.value)}
                                    />
                                    {opt.label}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="form-group">
                        <label>
                            제목
                            <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="제목을 입력하세요."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                </div>

                {/* 핵심요약 */}
                <div className="card">
                    <div className="card-title">
                        핵심 요약
                    </div>
                    <div className="tiptap-bordered">
                        <TiptapToolbar editor={summaryEditor} />
                        <EditorContent editor={summaryEditor} className="tiptap-editor" />
                    </div>
                </div>

                {/* 중요 안내 */}
                <div className="card">
                    <div className="card-title">
                        중요 안내사항
                    </div>
                    <textarea
                        className="notice"
                        placeholder="주의사항이나 반드시 알아야 할 내용을 입력하세요."
                        value={warningNote}
                        onChange={(e) => setWarningNote(e.target.value)}
                    />
                </div>

                {/* 파일 */}
                <div className="card">
                    <div className="card-title">
                        관련 문서
                    </div>
                    <div
                        {...getRootProps({ className: `attach-addbtn ${isDragActive ? 'dropzone-active' : ''}` })}
                        style={{ justifyContent: 'center', flexDirection: 'column', maxWidth: '100%' }}
                    >
                        <input {...getInputProps()} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <i className="ti ti-upload" style={{fontSize: '18px'}}></i>
                            파일을 드래그하거나 클릭하여 업로드
                        </div>
                        <p style={{ fontSize: '11px', color: 'var(--ink-tertiary)', marginTop: '4px', fontWeight: 'normal' }}>이미지, PDF, 오피스 문서 등 지원</p>
                    </div>
                    
                    {attachedFiles.length > 0 && (
                        <div className="reply-attach-row" style={{ padding: '14px 0px 0' }}>
                            <div className="attach-list" style={{ width: '100%' }}>
                                {attachedFiles.map((file, idx) => (
                                    <div key={`new-${idx}`} className="reply-attach-chip">
                                        <svg className="ic" viewBox="0 0 24 24"><path fill="currentColor" d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 0 1 5 0v10.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c-1.93 0-3.5 1.57-3.5 3.5v11.5c0 2.76 2.24 5 5 5s5-2.24 5-5V6h-1.5z"></path></svg>
                                        <span>{file.name} - {(file.size / 1024).toFixed(2)} KB</span>
                                        <button type="button" onClick={() => removeFile(file)} className="rm">
                                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"></path></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* 공개범위 설정 */}
                <div className="card">
                    <div className="card-title">
                        공개범위 설정
                    </div>
                    <div className="form-group" style={{marginBottom: 0}}>
                        <div className="category">
                            <label>
                                <input 
                                    type="radio" 
                                    name="scope" 
                                    value="01"
                                    checked={scope === '01'}
                                    onChange={(e) => setScope(e.target.value)}
                                />
                                 같은 과 공개
                            </label>
                            <label>
                                <input type="radio" name="scope" value="02" checked={scope === '02'} onChange={(e) => setScope(e.target.value)} />
                                 전체 부서 공개
                            </label>
                        </div>
                        <p className="hint">{scope === '01' ? '같은 과 내의 직원들만 이 지식베이스를 조회할 수 있습니다.' : '모든 부서의 직원들이 이 지식베이스를 조회할 수 있습니다.'}</p>
                    </div>
                </div>

                <div className="footer">
                    <button type="button" className="cancel" onClick={() => navigate(-1)}>
                        취소
                    </button>
                    <button type="submit" className="submit" disabled={createKnowledgeMutation.isPending}>
                        {createKnowledgeMutation.isPending ? '등록 중...' : '등록'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default KnowlCreate;
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useDropzone } from 'react-dropzone';
import EmployeeSearchModal from '../../components/EmpSearchModal/EmpSearchModal';
import { usePetitionDetailQuery } from '../../hooks/queries/usePetitionQuery';
import { useCompletePetitionMutation, useTempSavePetitionMutation, useDeleteAttachmentMutation } from '../../hooks/mutations/usePetitionMutations';

import './Detail_petition.css';
import './Tiptap.css';

const STATUS_CLASS_MAP = {
  '대기중': 'wait',
  '처리중': 'progress',
  '완료': 'done',
};

const isImageFile = (fileName) => {
  if (!fileName) return false;
  // 정규식을 사용하여 이미지 확장자 확인 (대소문자 무시)
  return /\.(jpg|jpeg|png|gif|bmp)$/i.test(fileName);
};

const ImageModal = ({ imageUrl, onClose }) => {
  // ESC 키로 모달 닫기
  useEffect(() => {
    // imageUrl이 없으면(모달이 닫히면) 아무것도 하지 않습니다.
    if (!imageUrl) return;

    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);

    // cleanup 함수: 컴포넌트가 사라지거나 imageUrl이 바뀔 때 리스너를 제거합니다.
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [imageUrl, onClose]); // imageUrl이 바뀔 때마다 이 effect를 재실행합니다.

  if (!imageUrl) return null;

  return (
    <div className="image-modal-backdrop" onClick={onClose}>
      <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
        <img src={imageUrl} alt="첨부 이미지" />
        <button type="button" className="image-modal-close" onClick={onClose}>
          &times;
        </button>
      </div>
    </div>
  );
};

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

/**
 * 민원 상세 처리 페이지
 * @param {boolean} isAdmin - 관리자 여부 (읽기 전용 모드 활성화)
 */
function DetailPetition({ isAdmin: propIsAdmin = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // 라우터 state로 전달된 isAdmin 값을 우선적으로 사용하고, 없으면 prop을 사용합니다.
  const isAdmin = location.state?.isAdmin ?? propIsAdmin;
  
  // React Query를 사용하여 민원 상세 정보 조회
  const { data: complaint, isLoading, isError, error } = usePetitionDetailQuery(id);
  // React Query를 사용하여 민원 정보 업데이트 (저장, 완료)
  const completePetitionMutation = useCompletePetitionMutation();
  const tempSavePetitionMutation = useTempSavePetitionMutation();
  const deleteAttachmentMutation = useDeleteAttachmentMutation();

  const [isSimilarCasesOpen, setIsSimilarCasesOpen] = useState(false);
  const [isSimilarCasesLoading, setIsSimilarCasesLoading] = useState(false);
  const [similarCases, setSimilarCases] = useState([]);
  const [isMoreCasesLoading, setIsMoreCasesLoading] = useState(false);
  const [isAiDraftOpen, setIsAiDraftOpen] = useState(false);
  const [isAiDraftLoading, setIsAiDraftLoading] = useState(false);
  const [aiDraft, setAiDraft] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [newAssignee, setNewAssignee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageModalUrl, setImageModalUrl] = useState(null);

  const { petitionerAttachments, staffAttachments } = useMemo(() => {
    if (!complaint?.attachments) {
      return { petitionerAttachments: [], staffAttachments: [] };
    }
    const petitioner = [];
    const staff = [];
    complaint.attachments.forEach(file => {
      if (file.isStaffUpload) {
        staff.push(file);
      } else {
        petitioner.push(file);
      }
    });
    return { petitionerAttachments: petitioner, staffAttachments: staff };
  }, [complaint?.attachments]);

  const handleCloseImageModal = useCallback(() => {
    setImageModalUrl(null);
    // setImageModalUrl은 상태 설정 함수이므로 항상 동일한 참조를 가지므로 의존성 배열에 넣을 필요가 없습니다.
  }, []);

  // ▼ 유사사례 상세(분할 화면) 상태
  const [selectedCase, setSelectedCase] = useState(null);
  const [isCaseDetailOpen, setIsCaseDetailOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSelectEmployee = (employee) => {
    setNewAssignee(employee);
    handleCloseModal();
  };

  const onDrop = useCallback(acceptedFiles => {
    setAttachedFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
  }, []);

  const onDropRejected = useCallback((fileRejections) => {
    // 파일 첨부가 거부되었을 때 실행될 콜백
    fileRejections.forEach(({ file, errors }) => {
      errors.forEach(error => {
        if (error.code === 'file-too-large') {
          // maxSize보다 큰 파일이 첨부되었을 경우
          alert(`오류: "${file.name}" 파일의 크기가 너무 큽니다. (최대 10MB)`);
        } else if (error.code === 'file-invalid-type') {
          // 허용되지 않는 파일 형식일 경우
          alert(`오류: "${file.name}" 파일은 허용되지 않는 파일 형식입니다.`);
        } else {
          alert(`오류: ${file.name} - ${error.message}`);
        }
      });
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected, // 거부되었을 때 실행할 콜백 연결
    multiple: true,
    maxSize: 10485760, // 10MB (10 * 1024 * 1024)
    accept: { // 허용할 파일 타입 지정 (악성코드 방지)
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'application/pdf': ['.pdf'],
      'application/zip': ['.zip'],
      'application/x-hwp': ['.hwp'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
    }
  });

  const removeFile = (file) => {
    setAttachedFiles(prevFiles => prevFiles.filter(f => f !== file));
  };


  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: isAdmin ? '관리자는 답변을 수정할 수 없습니다.' : '민원 답변을 작성해주세요.',
      }),
    ],
    content: '',
    editable: !isAdmin, // isAdmin일 경우 에디터 비활성화
  });

  // 데이터 로딩 완료 시 에디터 내용 설정
  useEffect(() => {
    if (complaint && editor && !editor.isDestroyed) {
      // manualAnswer가 null이거나 비어있지 않은 경우에만 설정
      if (complaint.manualAnswer) {
        editor.commands.setContent(complaint.manualAnswer);
      }
      // TODO: API 응답에 따라 기존 첨부파일 상태 설정
      // setAttachedFiles(complaint.attachments || []);
    }
  }, [complaint, editor]);

  const handleLoadSimilarCases = () => {
    setIsSimilarCasesLoading(true);
    setTimeout(() => {
      setSimilarCases(complaint.similarCases || []);
      setIsSimilarCasesLoading(false);
      setIsSimilarCasesOpen(true);
    }, 1500);
  };

  // 추가 유사사례를 생성하는 함수 (API 호출 시뮬레이션)
  // TODO: 이 부분은 향후 실제 유사사례 검색 API로 대체되어야 합니다.
  const generateMoreCases = (complaint, existingCount) => {
    const newCases = [];
    for (let i = 1; i <= 2; i++) { // 2개의 새로운 사례 생성
      const newIndex = existingCount + i;
      newCases.push({
        id: `s${complaint.id}-more-${newIndex}`,
        title: `추가된 유사 민원 사례 ${newIndex}`,
        dept: complaint.departmentName,
        date: '2024.10.21',
        status: '처리완료',
        fullContent: `[민원 요지]\n추가적으로 검색된 유사 민원 사례입니다. (사례 ${newIndex})\n\n[처리 경과]\n담당 부서에서 신속하게 현장을 확인하고 필요한 조치를 계획했습니다.\n\n[답변 내용]\n안녕하세요. 추가로 문의주신 사안에 대해 검토 후 조치하였음을 알려드립니다.`
      });
    }
    return newCases;
  };

  const handleLoadMoreSimilarCases = () => {
    setIsMoreCasesLoading(true);
    setTimeout(() => {
      const newCases = generateMoreCases(complaint, similarCases.length);
      setSimilarCases(prevCases => [...prevCases, ...newCases]);
      setIsMoreCasesLoading(false);
    }, 1000);
  };

  const handleLoadAiDraft = () => {
    setIsAiDraftLoading(true);
    setTimeout(() => {
      setAiDraft(`안녕하세요, 민원인님. ${complaint.departmentName} ${complaint.assignee?.name || ''}입니다. 보내주신 민원은 잘 접수되었습니다. 현장 확인 후 조치하여 결과를 다시 안내해 드리겠습니다.`);
      setIsAiDraftLoading(false);
      setIsAiDraftOpen(true);
    }, 1500);
  };

  const applyAiDraftToEditor = () => {
    if (editor) {
      editor.commands.setContent(aiDraft);
    }
  };

  // ▼ 유사사례 클릭 → 우측 분할 패널 오픈
  const handleOpenCaseDetail = (simCase) => {
    setSelectedCase(simCase);
    setIsCaseDetailOpen(true);
  };

  const handleCloseCaseDetail = () => {
    setIsCaseDetailOpen(false);
    // 애니메이션 종료 후 내용 초기화(선택)
    setTimeout(() => setSelectedCase(null), 250);
  };

  // ESC 키로 유사사례 패널 닫기
  useEffect(() => {
    if (!isCaseDetailOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        handleCloseCaseDetail();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isCaseDetailOpen]);

  // isCaseDetailOpen 상태가 바뀔 때마다 body 클래스 토글
  useEffect(() => {
    if (isCaseDetailOpen) {
      // 현재 스크롤 위치 저장 후 body를 fixed로 고정
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      // 고정 해제 후 원래 스크롤 위치 복원
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }

    return () => {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    };
  }, [isCaseDetailOpen]);


  const handleSave = () => {
    if (newAssignee) {
      const isConfirmed = window.confirm(
        "담당자 변경 시 해당 민원이 완료처리 되기 전까지 접근하실 수 없습니다. 담당자를 변경하고 지금까지의 내용을 저장하시겠습니까?"
      );
      if (isConfirmed) {
        tempSavePetitionMutation.mutate({
          complaintId: id,
          manualAnswer: editor.getHTML(),
          assigneeUserId: newAssignee.id,
          files: attachedFiles,
        }, {
          onSuccess: () => {
            setAttachedFiles([]); // 로컬에서 관리하던 첨부파일 목록 초기화
          }
        });
      }
    } else {
      tempSavePetitionMutation.mutate({
        complaintId: id,
        manualAnswer: editor.getHTML(),
        files: attachedFiles,
      }, {
        onSuccess: () => {
          setAttachedFiles([]); // 로컬에서 관리하던 첨부파일 목록 초기화
        }
      });
    }
  };

  const handleComplete = () => {
    if (!editor.getText().trim()) {
      alert("답변 내용을 작성해주세요.");
      editor.commands.focus();
      return;
    }
    const isConfirmed = window.confirm("민원 처리를 완료합니다. 완료 후에는 수정할 수 없습니다. 계속하시겠습니까?");
    if (isConfirmed) {
      // '완료' 상태로 데이터 저장 API 호출
      completePetitionMutation.mutate({
        complaintId: id,
        manualAnswer: editor.getHTML(),
        files: attachedFiles,
      }, {
        onSuccess: () => {
          // 저장이 성공하면 로컬에서 관리하던 첨부파일 목록을 비웁니다.
          setAttachedFiles([]);
        }
      });
    }
  };

  const handleDeleteAttachment = (attachmentId) => {
    if (window.confirm("이 첨부파일을 삭제하시겠습니까? 삭제된 파일은 복구할 수 없습니다.")) {
      deleteAttachmentMutation.mutate({ attachmentId, complaintId: id });
    }
  };

  if (isLoading) {
    return (
      <div className="dcontent" style={{ textAlign: 'center', padding: '50px' }}>
        <h2>민원 정보를 불러오는 중입니다...</h2>
      </div>
    );
  }

  if (isError || !complaint) {
    return (
      <div className="dcontent">
        <h2>{error?.response?.data?.detail || '민원 정보를 불러오는 중 오류가 발생했습니다.'}</h2>
        <button onClick={() => navigate(-1)} className="btn btn-ghost">목록으로 돌아가기</button>
      </div>
    );
  }

  const isCompleted = complaint.statusCode === '03';

  return (
    <div className={`split-layout ${isCaseDetailOpen ? 'split-active' : ''}`}>
      <div className="dcontent">
        <div className="backrow">
          <div className="backbtn" onClick={() => navigate(-1)}>
            <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18L9 12L15 6"></path></svg>
            목록으로
          </div>
        </div>
        <div className="crumb">홈 &gt; 민원 처리 &gt; <b>상세 조회</b></div>

        <div className="dcard">
          <div className="dhead-row">
            <div className={`status ${STATUS_CLASS_MAP[complaint.statusName] || ''}`}>
              <span className="dot"></span>{complaint.statusName}
            </div>
            <div className="deptname">{newAssignee ? newAssignee.departmentName : complaint.departmentName}</div>
          </div>
          <h2 className="dtitle">{complaint.title}</h2>
          <div className="dmeta">
            <span>
              <svg className="ic" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path><path fill="currentColor" d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"></path></svg>
              접수일: {complaint.receivedAt?.split('T')[0]}
            </span>
            <span>
              <svg className="ic" viewBox="0 0 24 24"><path fill="currentColor" d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"></path></svg>
              처리기한: {complaint.dueDate?.split('T')[0]}
            </span>
            <span>
              <svg className="ic" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"></path></svg>
              담당자: {newAssignee ? `${newAssignee.name} ${newAssignee.positionName}` : complaint.assignee?.name || '미지정'}
            </span>
          </div>
          <div className="field-label">민원 내용</div>
          <div className="body-text">{complaint.content}</div>
          <div className="field-label">첨부 파일</div>
          <div className="attach-list">
            {petitionerAttachments.length > 0 ? (
              petitionerAttachments.map((file) => {
                const isImage = isImageFile(file.fileName);
                return (
                  <a
                    href={file.fileUrl}
                    key={file.attachmentId}
                    className="attach-chip"
                    onClick={(e) => {
                      if (isImage) {
                        e.preventDefault();
                        setImageModalUrl(file.fileUrl);
                      }
                    }}
                    target={isImage ? '_self' : '_blank'}
                    rel="noopener noreferrer"
                  >
                    <svg className="ic" viewBox="0 0 24 24"><path fill="currentColor" d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 0 1 5 0v10.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c-1.93 0-3.5 1.57-3.5 3.5v11.5c0 2.76 2.24 5 5 5s5-2.24 5-5V6h-1.5z"></path></svg>
                    <span>{file.fileName}</span>
                  </a>
                );
              })
            ) : (
              <span style={{ fontSize: '12px', color: '#888' }}>첨부된 파일이 없습니다.</span>
            )}
          </div>
        </div>

        {!isAdmin && !isCompleted && <div className="twocol">
          <div className={`panel ${!isSimilarCasesOpen ? 'collapsed' : ''}`}>
            <div className="panel-head">
              <svg className="ic" style={{ marginTop: '1px' }} viewBox="0 0 24 24"><path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"></path></svg>
              <div className="panel-title">유사 민원 사례</div>
            </div>
            <div className="panel-body" style={{ marginTop: '8px' }}>
              <p style={{ fontSize: '12.5px', color: 'var(--ink-soft)', lineHeight: '1.7', marginBottom: '15px' }}>
                현재 민원과 유사한 과거 처리 사례를 검색합니다. 사례는 참고용으로만 활용할 수 있습니다.
              </p>
              {isSimilarCasesLoading ? <div className="spinner"></div> : isSimilarCasesOpen ? (
                <>
                  {similarCases.map((simCase) => (
                    <div
                      key={simCase.id}
                      className={`simcase ${selectedCase?.id === simCase.id && isCaseDetailOpen ? 'active' : ''}`}
                      onClick={() => handleOpenCaseDetail(simCase)}
                    >
                      <div>
                        <div className="sim-title">{simCase.title}</div>
                        <div className="sim-meta">{simCase.dept} | {simCase.date}</div>
                      </div>
                      <div className="chev-btn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3"><path d="m9 18 6-6-6-6"></path></svg>
                      </div>
                    </div>
                  ))}
                  <div className="morelink" onClick={!isMoreCasesLoading ? handleLoadMoreSimilarCases : undefined}>
                    {isMoreCasesLoading ? (
                      <div className="spinner small" style={{ margin: '0 auto' }}></div>
                    ) : (
                      <>유사 사례 더 찾아보기 <svg viewBox="0 0 24 24"><path fill="currentColor" d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"></path></svg></>
                    )}
                  </div>
                </>
              ) : (
                <div className="applybtn" onClick={handleLoadSimilarCases}>유사 민원 불러오기</div>
              )}
            </div>
          </div>

          <div className={`panel ai-panel ${!isAiDraftOpen ? 'collapsed' : ''}`}>
            <div className="panel-head">
              <svg className="ic" style={{ marginTop: '5px' }} viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2">
                <path d="m12 3 1.9 4.9L19 9.5l-4.9 1.9L12 16l-1.9-4.9L5 9.5l4.9-1.9L12 3Z" />
              </svg>
              <div className="panel-title">AI 답변 초안</div>
            </div>
            <div className="panel-body" style={{ marginTop: '8px' }}>
              <p style={{ fontSize: '12.5px', color: 'var(--ink-soft)', lineHeight: '1.7', marginBottom: '15px' }}>
                AI가 민원 내용을 바탕으로 답변 초안을 생성합니다. 초안은 참고용이며, 검토 후 작성란에 반영할 수 있습니다.
              </p>
              {isAiDraftLoading ? <div className="spinner"></div> : isAiDraftOpen ? (
                <>
                  <div className="draftbox">{aiDraft}</div>
                  <div className="applybtn" onClick={applyAiDraftToEditor}>답변 초안 사용</div>
                </>
              ) : (
                <div className="applybtn" onClick={handleLoadAiDraft}>AI 답변 초안 생성</div>
              )}
            </div>
          </div>
        </div>}

        {isCompleted ? (
          <div className="dcard">
            <h3 className="dtitle" style={{ fontSize: '15px', margin: '0 0 16px' }}>최종 답변 내용</h3>
            <div className="body-text" dangerouslySetInnerHTML={{ __html: complaint.manualAnswer || '답변 내용이 없습니다.' }} />
            {staffAttachments.length > 0 && (
              <>
                <div className="field-label" style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--line)' }}>담당자 첨부 파일</div>
                <div className="attach-list">
                  {staffAttachments.map((file) => {
                    const isImage = isImageFile(file.fileName);
                    return (
                      <a
                        href={file.fileUrl}
                        key={`staff-${file.attachmentId}`}
                        className="attach-chip"
                        onClick={(e) => {
                          if (isImage) {
                            e.preventDefault();
                            setImageModalUrl(file.fileUrl);
                          }
                        }}
                        target={isImage ? '_self' : '_blank'}
                        rel="noopener noreferrer"
                      >
                        <svg className="ic" viewBox="0 0 24 24"><path fill="currentColor" d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 0 1 5 0v10.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c-1.93 0-3.5 1.57-3.5 3.5v11.5c0 2.76 2.24 5 5 5s5-2.24 5-5V6h-1.5z"></path></svg>
                        <span>{file.fileName}</span>
                      </a>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        ) : (<div className="tiptap-wrapper">
          <h3 className="dtitle" style={{ fontSize: '15px', margin: '16px 20px' }}>민원 답변 작성</h3>
          <div className="tiptap-editor-wrapper">
            {!isAdmin && <TiptapToolbar editor={editor} />}
            <EditorContent editor={editor} className="tiptap-editor" />
            {!isAdmin && <div className="reply-attach-row" style={{ padding: '14px 0px' }}>
              <div
                {...getRootProps({ className: `attach-addbtn ${isDragActive ? 'dropzone-active' : ''}` })}
                style={{ justifyContent: 'center', flexDirection: 'column' }}
              >
                <input {...getInputProps()} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg className="ic" viewBox="0 0 24 24"><path fill="currentColor" d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 0 1 5 0v10.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c-1.93 0-3.5 1.57-3.5 3.5v11.5c0 2.76 2.24 5 5 5s5-2.24 5-5V6h-1.5z"></path></svg>
                  파일 첨부
                  <p style={{ fontSize: '10px', color: 'var(--ink-tertiary)', marginTop: '2px' }}>파일을 드래그하거나 클릭하세요</p>
                </div>

              </div>{(staffAttachments.length > 0 || attachedFiles.length > 0) &&
                <div className="attach-list" style={{ marginTop: '10px', width: '100%' }}>
                  {staffAttachments.map((file) => {
                    const isImage = isImageFile(file.fileName);
                    return (
                      <div
                        key={`staff-${file.attachmentId}`}
                        className="reply-attach-chip"
                      >
                        <svg className="ic" viewBox="0 0 24 24"><path fill="currentColor" d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 0 1 5 0v10.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c-1.93 0-3.5 1.57-3.5 3.5v11.5c0 2.76 2.24 5 5 5s5-2.24 5-5V6h-1.5z"></path></svg>
                        <a href={file.fileUrl} onClick={(e) => { if (isImage) { e.preventDefault(); setImageModalUrl(file.fileUrl); } }} target={isImage ? '_self' : '_blank'} rel="noopener noreferrer">{file.fileName}</a>
                        <button onClick={() => handleDeleteAttachment(file.attachmentId)} className="rm" aria-label="첨부파일 삭제">
                          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"></path></svg>
                        </button>
                      </div>
                    );
                  })}
                  {/* 새로 첨부하는 파일 목록 */}
                  {attachedFiles.map((file, idx) => (
                    <div key={`new-${idx}`} className="reply-attach-chip">
                      <svg className="ic" viewBox="0 0 24 24"><path fill="currentColor" d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 0 1 5 0v10.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c-1.93 0-3.5 1.57-3.5 3.5v11.5c0 2.76 2.24 5 5 5s5-2.24 5-5V6h-1.5z"></path></svg>
                      <span>{file.name} - {(file.size / 1024).toFixed(2)} KB</span>
                      <button onClick={() => removeFile(file)} className="rm">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"></path></svg>
                      </button>
                    </div>
                  ))}
                </div>}
            </div>
            }
          </div>
        </div>)}

        <div className="stepnav">
          <div className="leftbtns">
            <div className="btn btn-ghost" onClick={() => navigate(-1)}>
              <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3"><path d="m15 18-6-6 6-6" /></svg>
              목록으로
            </div>
            {!isAdmin && !isCompleted && (
              <>
                <div className="btn btn-ghost" onClick={handleOpenModal}>담당자 변경</div>
                {newAssignee && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <p style={{ fontSize: '12px', color: 'var(--ink-soft)', margin: '0' }}>
                      선택됨: {newAssignee.name} ({newAssignee.positionName})
                    </p>
                    <button
                      type="button"
                      onClick={() => setNewAssignee(null)}
                      className="btn-cancel-assignee"
                      aria-label="담당자 선택 취소"
                    >
                      &times;
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="rightbtns">
            {!isAdmin && !isCompleted && (
              <>
                <div className="btn btn-ghost" onClick={handleSave}>
                  <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" /><path d="M17 21v-8H7v8M7 3v5h8" /></svg>
                  저장
                </div>
                <div className="btn btn-navy" onClick={handleComplete}>
                  작성 완료
                  <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5" /></svg>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <EmployeeSearchModal
          currentDept={complaint.departmentName}
          onSelect={handleSelectEmployee}
          onClose={handleCloseModal}
          forceDeptScope={true}
        />
      )}

      <ImageModal imageUrl={imageModalUrl} onClose={handleCloseImageModal} />

      {/* ▼ 유사사례 전문 - 분할 화면 패널 */}
      <div className={`case-detail-panel ${isCaseDetailOpen ? 'open' : ''}`}>
        {selectedCase && (
          <>
            <div className="cdp-header">
              <div className="cdp-header-top">
                <span className="cdp-badge">유사 사례</span>
                <div className="cdp-close" onClick={handleCloseCaseDetail}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M18 6 6 18M6 6l12 12" /></svg>
                </div>
              </div>
              <h3 className="cdp-title">{selectedCase.title}</h3>
              <div className="cdp-meta">
                <span>{selectedCase.dept}</span>
                <span className="dotsep">·</span>
                <span>{selectedCase.date}</span>
                {selectedCase.status && (
                  <>
                    <span className="dotsep">·</span>
                    <span className="cdp-status">{selectedCase.status}</span>
                  </>
                )}
              </div>
            </div>
            <div className="cdp-body">
              {selectedCase.fullContent.split('\n').map((line, idx) => (
                line.trim() === '' ? <br key={idx} /> :
                  /^\[.+\]$/.test(line.trim()) ? (
                    <div key={idx} className="cdp-section-label">{line}</div>
                  ) : (
                    <p key={idx} className="cdp-line">{line}</p>
                  )
              ))}
            </div>
            <div className="cdp-footer">
              {!isAdmin && <div
                className="applybtn"
                onClick={() => {
                  if (editor) editor.commands.setContent(selectedCase.fullContent.replace(/\n/g, '<br/>'));
                }}
              >
                이 사례 내용 답변에 참고하기
              </div>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default DetailPetition;
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useMemo } from 'react';
import './SectionEditor.css';

const TiptapToolbar = ({ editor }) => {
    if (!editor) return null;
    return (
        <div className="tiptap-toolbar">
            <button type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={`t-tool ${editor.isActive('bold') ? 'is-active' : ''}`}>
                <b>B</b>
            </button>
            <button type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={`t-tool ${editor.isActive('italic') ? 'is-active' : ''}`}>
                <i>I</i>
            </button>
            <button type="button"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                disabled={!editor.can().chain().focus().toggleStrike().run()}
                className={`t-tool ${editor.isActive('strike') ? 'is-active' : ''}`}>
                <s>S</s>
            </button>
        </div>
    );
};

export default function SectionEditor({ label, content, onChange, isLocked, isOpen, onToggle, projectData }) {

    const defaultContent = useMemo(() => {
        const owner = projectData?.members?.find(m => m.roleName === '주관');
        const collabs = projectData?.members?.filter(m => m.roleName === '협력') || [];
        const collabDepts = [...new Set(collabs.map(m => m.departmentName))]
            .filter(d => d && d !== projectData?.departmentName)
            .join(', ');
        const collabNames = collabs.map(m => m.name).filter(Boolean).join(', ');
        const v = (val) => val || '-';

        const contents = {
            "Ⅰ. 사업 개요": `
<h2>Ⅰ. 사업 개요</h2>
<p><strong>&nbsp;&nbsp;사업명 :</strong>&nbsp;&nbsp;${v(projectData?.name)}</p>
<p></p>
<p><strong>&nbsp;&nbsp;사업개요 :</strong>&nbsp;&nbsp;${v(projectData?.businessContent)}</p>
<p></p>
<p><strong>&nbsp;&nbsp;사업기간 :</strong>&nbsp;&nbsp;${v(projectData?.startDate)} ~ ${v(projectData?.deadline)}</p>
<p><strong>&nbsp;&nbsp;사업위치 :</strong>&nbsp;&nbsp;-</p>
<p><strong>&nbsp;&nbsp;담당부서 :</strong>&nbsp;&nbsp;${v(projectData?.departmentName)}</p>
<p><strong>&nbsp;&nbsp;참여부서 :</strong>&nbsp;&nbsp;${v(collabDepts)}</p>
<p><strong>&nbsp;&nbsp;담당자 :</strong>&nbsp;&nbsp;${v(owner?.name)}</p>
<p><strong>&nbsp;&nbsp;참여부서원 :</strong>&nbsp;&nbsp;${v(collabNames)}</p>
<p><strong>&nbsp;&nbsp;총사업비 :</strong>&nbsp;&nbsp;-</p>
<p><strong>&nbsp;&nbsp;사업유형 :</strong>&nbsp;&nbsp;신규 / 계속</p>
<br>
`,

            "Ⅱ. 추진 배경 및 필요성": `
<h2>Ⅱ. 추진 배경 및 필요성</h2>
<h3>1. 추진 배경</h3>
<p><strong>&nbsp;&nbsp;□ 현재 업무 현황</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-</p>
<p><strong>&nbsp;&nbsp;□ 발생 문제</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-</p>
<p><strong>&nbsp;&nbsp;□ 개선 필요성</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-</p>
<p></p>
<h3>2. 사업 필요성</h3>
<p><strong>&nbsp;&nbsp;□ 행정 효율 개선</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-</p>
<p><strong>&nbsp;&nbsp;□ 업무 처리시간 단축</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-</p>
<p><strong>&nbsp;&nbsp;□ 서비스 품질 향상</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-</p>
<br>
`,

            "Ⅲ. 사업 목표": `
<h2>Ⅲ. 사업 목표</h2>
<p><strong>&nbsp;&nbsp;□ 최종 목표</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-</p>
<p></p>
<p><strong>&nbsp;&nbsp;□ 세부 목표</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;1. 목표:</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;성과지표:</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;2. 목표:</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;성과지표:</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;3. 목표:</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;성과지표:</p>
<br>
`,

            "Ⅳ. 세부 추진 계획": `
<h2>Ⅳ. 세부 추진 계획</h2>
<h3>1. 사업 내용</h3>
<p>&nbsp;&nbsp;○ 과업 1:&nbsp;</p>
<p>&nbsp;&nbsp;○ 과업 2:&nbsp;</p>
<p>&nbsp;&nbsp;○ 과업 3:&nbsp;</p>
<p></p>
<h3>2. 세부 실행 계획</h3>
<p><strong>&nbsp;&nbsp;가. ○○ 기능 구축</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;□ 주요 내용</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;□ 추진 방법</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;□ 산출물</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-</p>
<p></p>
<p><strong>&nbsp;&nbsp;나. 운영 계획</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;□ 운영 방법</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;□ 담당자</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;□ 관리 체계</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-</p>
<br>
`,

            "Ⅴ. 추진 일정": `
<h2>Ⅴ. 추진 일정</h2>
<p><strong>&nbsp;&nbsp;사업 일정</strong>&nbsp;(추진 단계별 일정을 월 단위로 작성)</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;○ 계획 수립:&nbsp;</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;○ 설계:&nbsp;</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;○ 개발:&nbsp;</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;○ 검수:&nbsp;</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;○ 운영:&nbsp;</p>
<p></p>
<p><em>※ 프로젝트 일정에 맞게 월별 추진 일정을 작성해 주세요.</em></p>
<br>
`,

            "Ⅵ. 사업 추진 체계": `
<h2>Ⅵ. 사업 추진 체계</h2>
<p><strong>&nbsp;&nbsp;총괄 책임자</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;□ 이름:</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;□ 직책:</p>
<p></p>
<p><strong>&nbsp;&nbsp;사업 담당 부서</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;□ 부서명:</p>
<p></p>
<p><strong>&nbsp;&nbsp;협력 기관</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;□ 운영 담당:</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;□ 개발 담당:</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;□ 협력 기관:</p>
<br>
`,


            "Ⅶ. 예산 계획": `
<h2>Ⅶ. 예산 계획</h2>
<p><strong>&nbsp;&nbsp;예산 내역</strong> (단위: 천원)</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;○ 인건비:&nbsp;__________천원</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;산출 근거:</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;○ 공사비:&nbsp;__________천원</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;산출 근거:</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;○ 운영비:&nbsp;__________천원</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;산출 근거:</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;○ 기타:&nbsp;__________천원</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;산출 근거:</p>
<p></p>
<p><strong>&nbsp;&nbsp;합계:</strong>&nbsp;&nbsp;__________천원</p>
<br>
`,

            "Ⅷ. 기대 효과": `
<h2>Ⅷ. 기대 효과</h2>
<h3>1. 정량적 효과</h3>
<p>&nbsp;&nbsp;□ 업무시간</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;기존:</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;개선:</p>
<p></p>
<p>&nbsp;&nbsp;□ 처리건수</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;기존:</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;개선:</p>
<p></p>
<p>&nbsp;&nbsp;□ 비용</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;기존:</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;개선:</p>
<p></p>
<h3>2. 정성적 효과</h3>
<p>&nbsp;&nbsp;□ 업무 표준화</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-</p>
<p></p>
<p>&nbsp;&nbsp;□ 사용자 만족도 향상</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-</p>
<p></p>
<p>&nbsp;&nbsp;□ 행정 서비스 개선</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-</p>
<br>
`,

            "Ⅸ. 사후 관리 계획": `
<h2>Ⅸ. 사후 관리 계획</h2>
<p><strong>&nbsp;&nbsp;운영기간</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-</p>
<p><strong>&nbsp;&nbsp;관리부서</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-</p>
<p><strong>&nbsp;&nbsp;유지보수 방법</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-</p>
<p><strong>&nbsp;&nbsp;개선 계획</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-</p>
<br>
`,
        };

        return contents[label] || '';
    }, [projectData?.name, projectData?.businessContent, projectData?.startDate,
    projectData?.deadline, projectData?.departmentName,
    projectData?.members, label]);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: isLocked ? '승인 완료된 기획서입니다.' : `${label} 내용을 작성하세요.`,
            }),
        ],
        content: content || defaultContent,
        editable: !isLocked,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    useEffect(() => {
        if (editor) editor.setEditable(!isLocked);
    }, [isLocked, editor]);

    useEffect(() => {
        if (editor && content !== undefined) {
            const current = editor.getHTML();
            const target = content || defaultContent;
            if (current !== target) {
                editor.commands.setContent(target);
            }
        }
    }, [content, editor, defaultContent]);

    return (
        <div className="section-accordion">
            <div className="section-accordion-header" onClick={onToggle}>
                <span className="section-accordion-label">{label}</span>
                <svg
                    width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.3"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                >
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </div>
            {isOpen && (
                <div className="section-accordion-body">
                    {!isLocked && <TiptapToolbar editor={editor} />}
                    <EditorContent editor={editor} className="tiptap-editor" />
                </div>
            )}
        </div>
    );
}
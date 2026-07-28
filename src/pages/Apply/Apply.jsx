import { useState } from "react";
import styles from "./Apply.module.css";
import { useQuery } from "@tanstack/react-query";
import { getDepartments } from "../../api/dept";
import { useSubmitExternalPetitionMutation } from "../../hooks/mutations/usePetitionMutations";

const TITLE_MAX_LENGTH = 200;
const CONTENT_MAX_LENGTH = 40000;

const INTRO_NOTICES = [
  "제목과 내용은 접수 후 수정, 삭제가 불가능하므로 다시 확인하시고 신청해 주시기 바랍니다.",
  "규제 관련 민원의 경우 규제신문고로 이관될 수 있습니다.",
  "신고성 민원의 경우 청렴포털시스템으로 이관될 수 있습니다.",
  "허위신고 등은 명예훼손, 무고죄 등으로 처벌될 수 있습니다.",
  "민원 내용에 따라 여러 부처에서 처리될 수 있으니, 민감한 내용이 포함되어 있을 경우 기관별로 해당내용을 제출해주시기 바랍니다.",
  "공무원에 대한 폭언, 욕설 등은 관련 법령(형법, 경범죄처벌법)에 따라 법적조치를 받을 수 있습니다.",
];

const CAUTION_NOTICES = [
  "민원신청을 유도한 후 금융 정보(계좌, 카드, 비밀번호 등)를 요구하는 전화사기(보이스피싱)에 주의하시기 바랍니다.",
  "고소장 등 법정서식이 필요한 신청은 해당 기관에 사전 문의하시기 바랍니다.",
  "현금영수증 미발급·발급거부, 신용카드 결제거부, 탈세제보신고는 국세청 홈(손)택스로 접속> 상담/제보(클릭)를 이용하여주시기 바랍니다.",
  "민원 내용을 자세히 작성해주시면 원활한 민원 처리에 도움이 됩니다.",
];

export default function Apply() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [titleError, setTitleError] = useState(false);
  const [contentError, setContentError] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [result, setResult] = useState(null);

  const { data: deptList } = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
    staleTime: Infinity,
  });

  const { mutate: submitMutate, isPending } = useSubmitExternalPetitionMutation({
    onSuccess: (data) => {
      setResult({
        petitionId: data.petitionId,
        departmentCode: data.departmentCode,
        dueDate: data.dueDate,
      });
    },
    onError: (error) => {
      console.error('민원 접수 실패:', error);
      setSubmitError("일시적인 오류로 접수에 실패했습니다. 잠시 후 다시 시도해주세요.");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setTitleError(false);
    setContentError(false);
    setSubmitError("");

    let hasError = false;
    if (!title.trim()) {
      setTitleError(true);
      hasError = true;
    }
    if (!content.trim()) {
      setContentError(true);
      hasError = true;
    }
    if (hasError) return;

    submitMutate({ title, content });
  };

  const handleReset = () => {
    setTitle("");
    setContent("");
    setResult(null);
    setSubmitError("");
  };

  const departmentName =
    result && deptList?.find((d) => d.code === result.departmentCode)?.name;

  return (
    <div className={styles.applyPage}>
      <div className={styles.wrap}>
        {result ? (
          <div className={styles.panel}>
            <div className={styles.panelTitle}>민원이 정상적으로 접수되었습니다</div>
            <div className={styles.panelSub}>아래 내용을 확인해 주세요.</div>

            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>접수번호</span>
              <span className={styles.resultValue}>{result.petitionId}</span>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>배정 부서</span>
              <span className={styles.resultValue}>{departmentName || result.departmentCode}</span>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>처리예정일</span>
              <span className={styles.resultValue}>{result.dueDate}</span>
            </div>

            <div className={styles.buttonRow}>
              <button type="button" className={styles.submitButton} onClick={handleReset}>
                새 민원 접수하기
              </button>
            </div>
          </div>
        ) : (
          <form className={styles.panel} onSubmit={handleSubmit}>
            <ul className={styles.introNotices}>
              {INTRO_NOTICES.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ul>

            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>민원내용</span>
              <span className={styles.requiredHint}>* 표는 필수 입력사항입니다.</span>
            </div>

            <ul className={styles.cautionNotices}>
              {CAUTION_NOTICES.map((text) => (
                <li key={text}>※ {text}</li>
              ))}
            </ul>

            <div className={styles.field}>
              <div className={styles.fieldLabelRow}>
                <label htmlFor="apply-title">민원 제목</label>
                <span className={styles.requiredBadge}>필수입력</span>
              </div>
              <input
                id="apply-title"
                className={styles.textInput}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={TITLE_MAX_LENGTH}
                placeholder="민원 제목을 입력하세요"
              />
              <div className={styles.charCount}>({title.length}/{TITLE_MAX_LENGTH})</div>
              {titleError && (
                <div className={styles.fieldError}>* 제목을 입력해 주세요.</div>
              )}
            </div>

            <div className={styles.field}>
              <div className={styles.fieldLabelRow}>
                <label htmlFor="apply-content">민원 내용</label>
                <span className={styles.requiredBadge}>필수입력</span>
              </div>
              <textarea
                id="apply-content"
                className={styles.textArea}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={CONTENT_MAX_LENGTH}
                placeholder="민원 내용을 입력하세요"
                rows={10}
              />
              <div className={styles.charCount}>({content.length}/{CONTENT_MAX_LENGTH})</div>
              {contentError && (
                <div className={styles.fieldError}>* 내용을 입력해 주세요.</div>
              )}
            </div>

            {submitError && (
              <div className={styles.fieldError}>{submitError}</div>
            )}

            <div className={styles.buttonRow}>
              <button type="submit" className={styles.submitButton} disabled={isPending}>
                {isPending ? "접수 중..." : "접수하기"}
              </button>
            </div>
          </form>
        )}

        <div className={styles.footNote}>
          문의사항은 관할 부서로 연락해 주세요.
        </div>
      </div>
    </div>
  );
}

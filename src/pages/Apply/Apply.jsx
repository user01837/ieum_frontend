import { useState } from "react";
import styles from "./Apply.module.css";
import logo from "../../assets/logo.png";
import { useQuery } from "@tanstack/react-query";
import { getDepartments } from "../../api/dept";
import { useSubmitExternalPetitionMutation } from "../../hooks/mutations/usePetitionMutations";

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

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
        dueDate: formatDate(addDays(new Date(), 14)),
      });
    },
    onError: () => {
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
        <div className={styles.brandrow}>
          <div><img className={styles["img-box"]} src={logo} alt="loader image" /></div>
          <div>
            <div className="brand-title">공무원 업무지원 플랫폼</div>
            <div className="brand-sub">전국 지방자치단체 통합 업무관리 시스템</div>
          </div>
        </div>

        {result ? (
          <div className={styles.card}>
            <div className={styles["card-title"]}>민원이 정상적으로 접수되었습니다</div>
            <div className={styles["card-sub"]}>아래 내용을 확인해 주세요.</div>

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

            <div className={styles.buttonContainer}>
              <button type="button" className={styles["btn-primary"]} onClick={handleReset}>
                새 민원 접수하기
              </button>
            </div>
          </div>
        ) : (
          <form className={styles.card} onSubmit={handleSubmit}>
            <div className={styles["card-title"]}>민원 접수</div>
            <div className={styles["card-sub"]}>제목과 내용을 입력해 주세요.</div>

            <div className={styles.field}>
              <label>제목</label>
              <div className={styles.inputwrap}>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="민원 제목을 입력하세요"
                />
              </div>
              {titleError && (
                <div className={`${styles["field-error"]} show`}>* 제목을 입력해 주세요.</div>
              )}
            </div>

            <div className={styles.field}>
              <label>내용</label>
              <div className={styles.inputwrap}>
                <textarea
                  className={styles.textarea}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="민원 내용을 입력하세요"
                  rows={6}
                />
              </div>
              {contentError && (
                <div className={`${styles["field-error"]} show`}>* 내용을 입력해 주세요.</div>
              )}
            </div>

            {submitError && (
              <div className={`${styles["field-error"]} show`}>{submitError}</div>
            )}

            <div className={styles.buttonContainer}>
              <button type="submit" className={styles["btn-primary"]} disabled={isPending}>
                {isPending ? "접수 중..." : <>접수하기 <span>→</span></>}
              </button>
            </div>
          </form>
        )}

        <div className={styles.footlink}>
          문의사항은 <b>관할 부서</b>로 연락해 주세요.
        </div>
      </div>
    </div>
  );
}

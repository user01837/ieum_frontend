import { useEffect, useRef, useState } from "react";
import styles from "./Login.module.css";
import logo from "../../assets/logo.png";
import { useQuery } from "@tanstack/react-query";
import { useLoginMutation } from "../../hooks/mutations/useAuthMutation";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";
import { getDepartments } from "../../api/auth";

export default function Login() {
  const navigate = useNavigate();
  const { token } = useAuthStore();

  const [dept, setDept] = useState("");
  const [openDept, setOpenDept] = useState(false);
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);

  const [deptError, setDeptError] = useState(false);
  const [loginError, setLoginError] = useState(false);

  const wrapRef = useRef(null);
  const { mutate: loginMutate, isPending: isLoginPending } = useLoginMutation();
  const { data: deptList, isLoading: isDeptLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments,
    staleTime: Infinity, // 부서 목록은 자주 바뀌지 않으므로, 불필요한 재요청을 막기 위해 staleTime을 무한으로 설정
  });

  useEffect(() => {
    if (token) {
      navigate("/home");
    }
  }, [token, navigate]);

  // 외부 클릭 닫기
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpenDept(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);



  const handleLogin = () => {
    setDeptError(false);
    setLoginError(false);

    if (!dept) {
      setDeptError(true);
      return;
    }

    if (!id || !pw) {
      setLoginError(true);
      return;
    }

    const selectedDept = deptList?.find(d => d.name === dept);
    if (!selectedDept) {
      // 부서 목록에 없는 부서가 선택된 경우 (이론적으로는 발생하지 않음)
      setDeptError(true);
      alert('유효하지 않은 부서입니다. 목록에서 다시 선택해주세요.');
      return;
    }

    loginMutate({ empId: id, password: pw, deptCode: selectedDept.code });
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // 폼 제출 시 페이지 새로고침 방지
    handleLogin();
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.wrap}>
        {/* 브랜드 */}
        <div className={styles.brandrow}>
          <div ><img  className={styles['img-box']} src={logo} alt="loader image" /></div>
          <div>
            <div className="brand-title">공무원 업무지원 플랫폼</div>
            <div className="brand-sub">전국 지방자치단체 통합 업무관리 시스템</div>
          </div>
        </div>

        {/* 로그인 카드 */}
        <form className={styles.card} onSubmit={handleSubmit}>
          <div className={styles['card-title']}>로그인</div>
          <div className={styles['card-sub']}>소속 부서를 선택하고 계정 정보를 입력해 주세요.</div>

          {/* 부서 */}
          <div className={styles.field} ref={wrapRef}>
            <label>소속 부서</label>

            <div
              className={`${styles.dropdown} ${!dept ? styles.placeholder : ""}`}
              onClick={() => setOpenDept((p) => !p)}
            >
              <span>{dept || "부서를 선택하세요"}</span>
              <span className="ic">▼</span>
            </div>

            {openDept && (
              <div className={styles['dropdown-menu']}>
                {isDeptLoading ? (
                  <div className={styles['dropdown-item']}>불러오는 중...</div>
                ) : deptList && deptList.length > 0 ? (
                  deptList.map((d) => (
                    <div
                      key={d.code}
                      className={`${styles['dropdown-item']} ${dept === d.name ? styles.active : ""}`}
                      onClick={() => {
                        setDept(d.name);
                        setOpenDept(false);
                        setDeptError(false);
                      }}
                    >
                      {d.name}
                    </div>
                  ))
                ) : (
                  <div className={styles['dropdown-item']}>부서 목록을 불러올 수 없습니다.</div>
                )}
              </div>
            )}

            {deptError && (
              <div className={`${styles['field-error']} show`}>소속 부서를 선택해 주세요.</div>
            )}
          </div>

          {/* 아이디 */}
          <div className={styles.field}>
            <label>아이디</label>
            <div className={styles.inputwrap}>
              <input
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="아이디를 입력하세요"
              />
            </div>
          </div>

          {/* 비밀번호 */}
          <div className={styles.field}>
            <label>비밀번호</label>
            <div className={styles.inputwrap}>
              <input
                type={showPw ? "text" : "password"}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="비밀번호를 입력하세요"
              />
              <span className={styles['toggle-eye']} onClick={() => setShowPw((p) => !p)}>
                👁
              </span>
            </div>

            {loginError && (
              <div className={`${styles['field-error']} show`}>
                아이디 또는 비밀번호가 올바르지 않습니다.
              </div>
            )}
          </div>

          {/* 기억하기 */}
          <div className={styles.rowline}>
            <div className={styles.rememberline} onClick={() => setRemember(!remember)}>
              <div className={`${styles.checkbox} ${remember ? styles.on : ""}`}>✔</div>
              아이디 저장
            </div>
          </div>

          {/* 버튼 */}
          <div className={styles.buttonContainer}>
            <button type="submit" className={styles['btn-primary']}>
              로그인 <span>→</span>
            </button>
          </div>
        </form>

        {/* 푸터 */}
        <div className={styles.footlink}>
          계정 관련 문의는 <b>부서 시스템 관리자</b>에게 연락해 주세요.
        </div>

      </div>
    </div>
  );
}
import { useEffect, useRef, useState } from "react";
import styles from "./Login.module.css";
import logo from "../../assets/logo.png";

export default function Login() {
  const [dept, setDept] = useState("");
  const [openDept, setOpenDept] = useState(false);
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);

  const [deptError, setDeptError] = useState(false);
  const [loginError, setLoginError] = useState(false);

  const [toast, setToast] = useState("");

  const wrapRef = useRef(null);

  const deptList = [
    "문화도시과",
    "재무과",
    "건축과",
    "도로과",
    "환경과",
    "지역경제과",
    "주민자치과",
    "정보통신과",
    "공원녹지과",
    "어르신복지과",
  ];

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

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };

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

    showToast("로그인 되었습니다. 민원 처리 화면으로 이동합니다.");
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
        <div className={styles.card}>
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
                {deptList.map((d) => (
                  <div
                    key={d}
                    className={`${styles['dropdown-item']} ${dept === d ? styles.active : ""}`}
                    onClick={() => {
                      setDept(d);
                      setOpenDept(false);
                      setDeptError(false);
                    }}
                  >
                    {d}
                  </div>
                ))}
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
          <div className={styles['btn-primary']} onClick={handleLogin}>
            로그인 <span>→</span>
          </div>
        </div>

        {/* 푸터 */}
        <div className={styles.footlink}>
          계정 관련 문의는 <b>부서 시스템 관리자</b>에게 연락해 주세요.
        </div>

        {/* 토스트 */}
        {toast && <div className={`${styles.toast} show`}>{toast}</div>}
      </div>
    </div>
  );
}
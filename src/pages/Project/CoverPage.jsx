// 기획서 표지

import "./CoverPage.css";

export default function CoverPage({ coverTitle, onChange, isLocked, projectData }) {
    const owner = projectData?.members?.find((m) => m.roleName === "주관");
    const ownerName = owner?.name || "-";
    const deptName = projectData?.departmentName || "-";
    const createdAt = projectData?.createdAt
        ? projectData.createdAt.slice(0, 10).split("-").join(". ") + "."
        : "-";

    return (
        <div className="section-accordion">
            <div className="cover-toggle-label">표지</div>
            <div className="cover-body">

                {/* 위 파란선 */}
                <div className="cover-line-top" />

                <div className="cover-year">
                    {projectData?.startDate ? projectData.startDate.slice(0, 4) : new Date().getFullYear()}년도
                </div>
                <textarea
                    className={`cover-title-input${isLocked ? " cover-title-input--locked" : ""}`}
                    value={coverTitle}
                    onChange={(e) => {
                        e.target.style.height = "auto";
                        e.target.style.height = e.target.scrollHeight + "px";
                        onChange(e.target.value);
                    }}
                    disabled={isLocked}
                    placeholder={`${projectData?.name || "○○○"} 추진계획서`}
                    rows={1}
                />

                {/* 아래 파란선 */}
                <div className="cover-line-bottom" />

                <div className="cover-info-table">
                    <div className="cover-info-row">
                        <span className="cover-label">사업명 :</span>
                        <span className="cover-value">{projectData?.name || "-"}</span>
                    </div>
                    <div className="cover-info-row">
                        <span className="cover-label">담당부서 :</span>
                        <span className="cover-value">{deptName}</span>
                    </div>
                    <div className="cover-info-row">
                        <span className="cover-label">작성자 :</span>
                        <span className="cover-value">{ownerName}</span>
                    </div>
                    <div className="cover-info-row">
                        <span className="cover-label">작성일 :</span>
                        <span className="cover-value">{createdAt}</span>
                    </div>
                </div>
                {!isLocked && (
                    <div className="cover-note">※ 제목만 수정 가능합니다. 비워두면 '사업명 + 추진계획서'로 자동 설정됩니다.</div>
                )}
            </div>
        </div>
    );
}
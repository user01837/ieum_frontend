import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";
import { useDepartmentsQuery } from "../../hooks/queries/useDeptQuery";
import { useAnnouncementsQuery, useDeleteAnnouncementMutation, useReadAnnouncementNotificationsMutation } from "../../hooks/queries/useAnnouncementQuery";
import Pagination from "../../components/Pagination/Pagination";
import "./AnnouncementList.css";

export default function AnnouncementList() {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const isAdmin = user?.system_role_code === "02";
    const isHead = user?.position_code === "01";
    const canWrite = isAdmin || isHead;
    const { data: departments = [] } = useDepartmentsQuery();
    const { mutate: readNotifications } = useReadAnnouncementNotificationsMutation();

    useEffect(() => {
        readNotifications();
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (deptRef.current && !deptRef.current.contains(e.target)) {
                setIsDeptOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const [currentPage, setCurrentPage] = useState(1);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [deptFilter, setDeptFilter] = useState(null);
    const [isDeptOpen, setIsDeptOpen] = useState(false);
    const deptRef = useRef(null);
    const [searchInput, setSearchInput] = useState("");
    const ITEMS_PER_PAGE = 10;

    const { data, isLoading } = useAnnouncementsQuery({
        page: currentPage - 1,
        size: ITEMS_PER_PAGE,
        keyword: searchKeyword,
        departmentCode: deptFilter,
    });

    const { mutate: deleteAnnouncement } = useDeleteAnnouncementMutation();

    const list = data?.content ?? [];
    const totalItems = data?.totalElements ?? 0;

    const handleSearch = () => {
        setSearchKeyword(searchInput);
        setCurrentPage(1);
    };

    const handleReset = () => {
        setSearchInput("");
        setSearchKeyword("");
        setCurrentPage(1);
    };

    const handleDelete = (e, id) => {
        e.stopPropagation();
        if (!window.confirm("공지사항을 삭제하시겠습니까?")) return;
        deleteAnnouncement(id);
    };

    return (
        <div className="ann-content">
            <div className="pagehead">
                <div>
                    <h2>공지사항 목록</h2>
                    <div className="sub">전체 공지사항을 조회합니다.</div>
                </div>
            </div>

            <div className="ann-toolbar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isAdmin ? (
                        <div className={`dropdown-wrap ${isDeptOpen ? "open" : ""}`} ref={deptRef}>
                            <div className="dropdown" onClick={() => setIsDeptOpen((p) => !p)}>
                                <span>{deptFilter ? departments.find(d => d.code === deptFilter)?.name : "전체 공지"}</span>
                                <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="m6 9 6 6 6-6" />
                                </svg>
                            </div>
                            <div className="dropdown-menu">
                                <div
                                    className={`dropdown-item ${deptFilter === null ? "active" : ""}`}
                                    onClick={() => { setDeptFilter(null); setIsDeptOpen(false); setCurrentPage(1); }}
                                >
                                    전체 공지
                                </div>
                                {departments
                                    .filter(d => d.code !== "09")
                                    .map((d) => (
                                        <div
                                            key={d.code}
                                            className={`dropdown-item ${deptFilter === d.code ? "active" : ""}`}
                                            onClick={() => { setDeptFilter(d.code); setIsDeptOpen(false); setCurrentPage(1); }}
                                        >
                                            {d.name}
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ) : (
                        <div className={`dropdown-wrap ${isDeptOpen ? "open" : ""}`} ref={deptRef}>
                            <div className="dropdown" onClick={() => setIsDeptOpen((p) => !p)}>
                                <span>{deptFilter === null ? "전체 공지" : "내 부서 공지"}</span>
                                <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="m6 9 6 6 6-6" />
                                </svg>
                            </div>
                            <div className="dropdown-menu">
                                <div
                                    className={`dropdown-item ${deptFilter === null ? "active" : ""}`}
                                    onClick={() => { setDeptFilter(null); setIsDeptOpen(false); setCurrentPage(1); }}
                                >
                                    전체 공지
                                </div>
                                <div
                                    className={`dropdown-item ${deptFilter === user?.department_code ? "active" : ""}`}
                                    onClick={() => { setDeptFilter(user?.department_code); setIsDeptOpen(false); setCurrentPage(1); }}
                                >
                                    부서 공지
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="search-wrap" style={{ position: 'relative' }}>
                        <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--ink-tertiary)' }}>
                            <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
                        </svg>
                        <input
                            style={{ width: 240, padding: '9px 12px 9px 36px', border: '1px solid var(--line-strong)', borderRadius: '8px', fontSize: 13, fontFamily: 'inherit', outline: 'none' }}
                            placeholder="제목으로 검색"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        />
                    </div>
                    <button className="action-btn" onClick={handleSearch}>검색</button>
                    <button className="action-btn" onClick={handleReset}>초기화</button>
                </div>
                {canWrite && (
                    <div className="ann-newbtn" onClick={() => navigate("/announcements/new")}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        공지 작성
                    </div>
                )}
            </div>

            <div className="tablewrap">
                <div className={`ann-trow head ${canWrite ? '' : 'no-action'}`}>
                    <span>번호</span>
                    <span>제목</span>
                    <span>부서</span>
                    <span>작성자</span>
                    <span>작성일</span>
                    {canWrite && <span></span>}
                </div>

                {list.length === 0 ? (
                    <div className="ann-empty">등록된 공지사항이 없습니다.</div>
                ) : (
                    (() => {
                        let nonPinnedIndex = 0;
                        return list.map((a, index) => {
                            const num = a.isPinned ? null : ++nonPinnedIndex + (currentPage - 1) * ITEMS_PER_PAGE;
                            return (
                                <div
                                    key={a.announcementId}
                                    className={`ann-trow ${!canWrite ? 'no-action' : ''}`}
                                    style={index === list.length - 1 ? { borderBottom: 'none' } : {}}
                                    onClick={() => navigate(`/announcements/${a.announcementId}`)}
                                >
                                    <span className="ann-num">
                                        {a.isPinned ? <span className="ann-pin">📌</span> : num}
                                    </span>
                                    <span className="ann-title">
                                        {a.title}
                                        {a.hasAttachment && (
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '6px', verticalAlign: 'middle', color: 'var(--ink-tertiary)' }}>
                                                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                                            </svg>
                                        )}
                                    </span>
                                    <span className="ann-meta">{a.departmentName}</span>
                                    <span className="ann-meta">{a.createdByName}</span>
                                    <span className="ann-meta">{a.createdAt?.slice(0, 10)}</span>
                                    {canWrite && a.createdBy === Number(user?.userId) && (
                                        <span className="ann-actions" onClick={(e) => e.stopPropagation()}>
                                            <button className="ann-edit-btn" onClick={(e) => { e.stopPropagation(); navigate(`/announcements/${a.announcementId}/edit`); }}>수정</button>
                                            <button className="ann-del-btn" onClick={(e) => handleDelete(e, a.announcementId)}>삭제</button>
                                        </span>
                                    )}
                                </div>
                            );
                        });
                    })()
                )}
                <div className="ann-tablefoot">
                    <Pagination
                        totalItems={totalItems}
                        itemsPerPage={ITEMS_PER_PAGE}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>
        </div>
    );
}
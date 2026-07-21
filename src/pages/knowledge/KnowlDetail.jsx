import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../Petition/Detail_petition.css'; // For shared styles like dcard, badge
import './KnowlDetail.css';

function DetailKnowl() {
    const navigate = useNavigate();

    // Placeholder for the sendPrompt function
    const sendPrompt = (prompt) => {
        alert(`Prompt to send: ${prompt}`);
    };

    return(
        <div className="dcontent">
            <div className="backrow">
                <div className="backbtn" onClick={() => navigate(-1)}>
                    <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18L9 12L15 6"></path></svg>
                    목록으로
                </div>
                <div style={{marginLeft: 'auto'}}>
                    <button className="dk-action-btn"><i className="ti ti-edit" aria-hidden="true"></i> 수정</button>
                </div>
            </div>
            <div className="crumb">홈 &gt; 지식베이스 &gt; <b>상세 조회</b></div>

            <div className="dcard" style={{paddingBottom: '16px'}}>
                <div className="dhead-row">
                    <span className="badge badge-warn">사업추진</span>
                </div>
                <h2 className="dtitle">불법 주정차 단속 민원 처리</h2>
                <div className="dmeta" style={{borderBottom: 'none', paddingBottom: 0, gap: '14px'}}>
                    <span><i className="ti ti-user" style={{fontSize: '14px'}}></i>최초 작성자: 김OO</span>
                    <span><i className="ti ti-calendar" style={{fontSize: '14px'}}></i>최종 수정일: 2024-05-02</span>
                </div>
            </div>

            <div className="dk-grid-layout">
                <div className="dk-main-col">
                    {/* 핵심 요약 카드 */}
                    <div className="dk-card">
                        <div className="dk-card-header">
                            <i className="ti ti-bolt icon-blue" aria-hidden="true"></i>
                            <span>핵심 요약</span>
                        </div>
                        <div className="dk-card-body">
                            <p>이의신청 기한은 단속일로부터 60일. </p>
                            <p>과태료 감경은 사전납부(20%) 또는 자진납부(20%) 중 하나만 적용.</p>
                            <div className="dk-warning-box">
                                <i className="ti ti-alert-triangle" aria-hidden="true"></i>
                                <span>단속 영상은 정보공개청구 외 경로로 절대 제공 불가 — 직접 제공 시 개인정보보호법 위반</span>
                            </div>
                        </div>
                    </div>

                    {/* 노하우 로그 카드 */}
                    <div className="dk-card">
                        <div className="dk-card-header">
                            <i className="ti ti-message-2 icon-blue" aria-hidden="true"></i>
                            <span>노하우 로그</span>
                            <button className="dk-add-btn"><i className="ti ti-plus" aria-hidden="true"></i> 추가</button>
                        </div>
                        <div className="dk-card-body">
                            <div className="dk-card-subtitle">담당자가 직접 남기는 실무 경험</div>
                            <div className="log-list">
                                <div className="log-item">
                                    <div className="log-meta">2024.03.15 · 김OO</div>
                                    <div className="log-body">중앙부처 5번 전화 후 겨우 연결. "적의판단" = 타 지자체 참고하라는 뜻. <span className="log-highlight">수원시 이OO (031-xxxx)</span>에게 문의하면 바로 해결됨.</div>
                                </div>
                                <div className="log-item">
                                    <div className="log-meta">2024.05.02 · 김OO</div>
                                    <div className="log-body">시럽 발주처 변경. 기존 A업체 폐업 → <span className="log-highlight">B업체 (계약번호 2024-공1234)</span>로 변경 완료.</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 관련 문서 카드 */}
                    <div className="dk-card">
                        <div className="dk-card-header">
                            <i className="ti ti-paperclip icon-blue" aria-hidden="true"></i>
                            <span>관련 문서 / 공문</span>
                        </div>
                        <div className="dk-card-body">
                            <div className="doc-list">
                                <div className="doc-item"><i className="ti ti-file" aria-hidden="true"></i> 행안부 고시 2023-14호</div>
                                <div className="doc-item"><i className="ti ti-file" aria-hidden="true"></i> 재료 발주 계약서 (2024-공1234)</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dk-side-col">
                    {/* 이전 담당자 카드 */}
                    <div className="dk-card">
                        <div className="dk-card-header-simple"><i className="ti ti-user" aria-hidden="true"></i> 이전 담당자</div>
                        <div className="dk-card-body">
                            <div className="assignee-info">
                                <div className="assignee-avatar">김</div>
                                <div>
                                    <div className="assignee-name">김OO</div>
                                    <div className="assignee-details">현재 세무과 · 내선 1234</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 연관 Task 카드 */}
                    <div className="dk-card">
                        <div className="dk-card-header-simple"><i className="ti ti-link" aria-hidden="true"></i> 연관 Task</div>
                        <div className="dk-card-body">
                            <div className="link-list">
                                <div className="link-item">도로교통 민원</div>

                            </div>
                        </div>
                    </div>

                    {/* AI 유사 사례 카드 */}
                    <div className="dk-card">
                        <div className="dk-card-header-simple"><i className="ti ti-search" aria-hidden="true"></i> AI 유사 사례</div>
                        <div className="dk-card-body">
                            <div className="link-list">
                                <div className="link-item">cctv 요구 <span className="similarity">87%</span></div>
                                <div className="link-item">단속에 걸렸는데 감경은 어떻게...<span className="similarity">74%</span></div>
                            </div>
                            <button onClick={() => sendPrompt('AI 유사 사례 검색 더 자세히 설명해줘')} className="more-search-btn">더 검색 ↗</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DetailKnowl;
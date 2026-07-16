import '../Petition/Petition_list.css';

function Knowl() {
    return(
        <div className="view active">
            <div className="petition-content">
                <div className="pagehead">
                    <div>
                        <h2>지식베이스</h2>
                        <div className="sub">업무 노하우와 처리 사례를 검색하고 학습합니다.</div>
                    </div>
                </div>
                {/* 지식 베이스 페이지의 실제 콘텐츠가 여기에 들어갑니다. */}
            </div>
        </div>
    )
}

export default Knowl;
import React from 'react';
import './Pagination.css';

const Pagination = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const pageGroupSize = 5;

  if (totalPages <= 1) {
    return null; // 1페이지 이하면 페이지네이션을 표시하지 않음
  }

  const handlePageClick = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
  };

  // 페이지 그룹 계산
  const currentPageGroup = Math.ceil(currentPage / pageGroupSize);
  const startPage = (currentPageGroup - 1) * pageGroupSize + 1;
  const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);

  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  const prevGroupStartPage = Math.max(1, startPage - pageGroupSize);
  const nextGroupStartPage = Math.min(totalPages, endPage + 1);

  return (
    <div className="pagination">
      <div
        className={`pgbtn nav-btn ${currentPageGroup === 1 ? 'disabled' : ''}`}
        onClick={() => handlePageClick(prevGroupStartPage)}
      >
        «
      </div>
      <div
        className={`pgbtn nav-btn ${currentPage === 1 ? 'disabled' : ''}`}
        onClick={() => handlePageClick(currentPage - 1)}
      >
        ‹
      </div>
      {pageNumbers.map(number => (
        <div
          key={number}
          className={`pgbtn ${currentPage === number ? 'active' : ''}`}
          onClick={() => handlePageClick(number)}
        >
          {number}
        </div>
      ))}
      <div
        className={`pgbtn nav-btn ${currentPage === totalPages ? 'disabled' : ''}`}
        onClick={() => handlePageClick(currentPage + 1)}
      >
        ›
      </div>
      <div
        className={`pgbtn nav-btn ${endPage >= totalPages ? 'disabled' : ''}`}
        onClick={() => handlePageClick(nextGroupStartPage)}
      >
        »
      </div>
    </div>
  );
};

export default Pagination;
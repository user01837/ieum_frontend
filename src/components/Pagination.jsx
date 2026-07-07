import React from 'react';
import './Pagination.css';

const Pagination = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) {
    return null; // 1페이지 이하면 페이지네이션을 표시하지 않음
  }

  const handlePageClick = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
  };

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="pagination">
      <div
        className={`pgbtn nav-btn ${currentPage === 1 ? 'disabled' : ''}`}
        onClick={() => handlePageClick(currentPage - 1)}
      >
        «
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
        »
      </div>
    </div>
  );
};

export default Pagination;
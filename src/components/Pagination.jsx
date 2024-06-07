import React from "react";

const Pagination = ({
  totalpost,
  postPerPage,
  setCurrentPage,
  currentPage,
}) => {
  const totalPages = Math.ceil(totalpost / postPerPage);

  let pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  const handlePreviousClick = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextClick = () => {
    if (currentPage < totalPages) {
    setCurrentPage(currentPage + 1);
    }
  };

  return (   
     <nav aria-label="Page navigation example">
      <ul className="pagination justify-content-center">
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <button className="page-link" onClick={handlePreviousClick} aria-label="Previous">
            <span aria-hidden="true">&laquo;</span>        
          </button>
        </li>
        {pages.map((page,i) => (
          <li key={i} className={`page-item ${currentPage === page ? 'active' : ''}`}>
            <button className="page-link" onClick={() => setCurrentPage(page)}>
              {page}
            </button>
          </li>
        ))}
        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
          <button className="page-link" onClick={handleNextClick} aria-label="Next">
            <span aria-hidden="true">&raquo;</span>         
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;

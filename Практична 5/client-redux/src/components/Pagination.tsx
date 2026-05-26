import React from 'react';
import { PaginationMeta } from '../types/user';

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ meta, onPageChange }) => {
  const { page, totalPages, total } = meta;

  return (
    <div className="pagination">
      <div>
        Усього записів: <strong>{total}</strong>. Поточна сторінка: <strong>{page}</strong> із <strong>{totalPages || 1}</strong>.
      </div>
      <div className="pagination-controls">
        <button
          className="pagination-btn"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Попередня
        </button>
        <button
          className="pagination-btn"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Наступна
        </button>
      </div>
    </div>
  );
};

import React from 'react';

interface FilterPanelProps {
  search: string;
  onSearchChange: (value: string) => void;
  onReset: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  search,
  onSearchChange,
  onReset,
}) => {
  return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
        Пошук та фільтрація
      </h3>
      <div className="filter-panel">
        <div className="search-input-wrapper" style={{ flex: 1 }}>
          <input
            type="text"
            className="form-control"
            placeholder="Пошук за ім'ям або email..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <button className="btn btn-secondary" onClick={onReset}>
          Скинути вибір
        </button>
      </div>
    </div>
  );
};

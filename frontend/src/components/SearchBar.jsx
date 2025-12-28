import React, { useState, useEffect, useRef } from 'react';
import styles from './SearchBar.module.css';
import filterIcon from '@/assets/filter.svg';
import magnifierIcon from '@/assets/megnifier.svg';

export default function SearchBar({
  onSearch,
  onFilterChange,
  filterOptions,
}) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    location: '',
    department: '',
  });
  const filterRef = useRef(null);
  const filterButtonRef = useRef(null);

  // 點擊外面關閉過濾器
  useEffect(() => {
    const handleClickOutside = (event) => {
      // 排除 filter button 的點擊，只在點擊外面時關閉
      if (
        filterRef.current && 
        !filterRef.current.contains(event.target) &&
        !filterButtonRef.current.contains(event.target)
      ) {
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleQueryChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value, selectedFilters);
  };

  const handleFilterChange = (filterType, value) => {
    const newFilters = {
      ...selectedFilters,
      [filterType]: value === selectedFilters[filterType] ? '' : value,
    };
    setSelectedFilters(newFilters);
    onFilterChange(newFilters);
    onSearch(query, newFilters);
  };

  const clearFilters = () => {
    setSelectedFilters({
      location: '',
      department: '',
    });
    onFilterChange({
      location: '',
      department: '',
    });
    onSearch(query, {
      location: '',
      department: '',
    });
  };

  const hasActiveFilters = Object.values(selectedFilters).some(v => v !== '');

  return (
    <div className={styles.searchBarContainer}>
      <div className={styles.searchInputWrapper}>
        <img src={magnifierIcon} alt="Search" className={styles.searchIcon} />
        <input
          type="text"
          placeholder="搜尋"
          value={query}
          onChange={handleQueryChange}
          className={styles.searchInput}
        />
        <button
          ref={filterButtonRef}
          className={styles.filterButton}
          onClick={() => setShowFilters(!showFilters)}
          title="打開過濾器"
        >
          <img src={filterIcon} alt="Filter" className={styles.filterButtonIcon} />
          {hasActiveFilters && <span className={styles.filterBadge}>✓</span>}
        </button>
      </div>

      {showFilters && (
        <div ref={filterRef} className={styles.filterPanel}>
          <div className={styles.filterHeader}>
            <h4>搜尋過濾器</h4>
            {hasActiveFilters && (
              <button
                className={styles.clearButton}
                onClick={clearFilters}
              >
                清除篩選
              </button>
            )}
          </div>

          {/* 系所過濾器 */}
          <div className={styles.filterGroup}>
            <label className={styles.filterGroupTitle}>系所 (Location)</label>
            <div className={styles.filterOptions}>
              {filterOptions?.locations?.map((location) => (
                <button
                  key={location}
                  className={`${styles.filterOption} ${
                    selectedFilters.location === location ? styles.active : ''
                  }`}
                  onClick={() => handleFilterChange('location', location)}
                >
                  {location}
                </button>
              ))}
            </div>
          </div>

          {/* 領域過濾器 */}
          <div className={styles.filterGroup}>
            <label className={styles.filterGroupTitle}>領域 (Department)</label>
            <div className={styles.filterOptions}>
              {filterOptions?.departments?.map((dept) => (
                <button
                  key={dept}
                  className={`${styles.filterOption} ${
                    selectedFilters.department === dept ? styles.active : ''
                  }`}
                  onClick={() => handleFilterChange('department', dept)}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

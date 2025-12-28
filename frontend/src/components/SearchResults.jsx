import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SearchResults.module.css';

export default function SearchResults({ results, isOpen, onClose, onResultClick }) {
  const navigate = useNavigate();

  if (!isOpen || results.length === 0) {
    return null;
  }

  const handleResultClick = (professor) => {
    navigate(`/professor/${professor.id}`);
    if (onResultClick) onResultClick();
    if (onClose) onClose();
  };

  return (
    <div className={styles.searchResultsContainer} data-search-result>
      <div className={styles.searchResultsList}>
        {results.map((professor) => (
          <div
            key={professor.id}
            className={styles.resultItem}
            onClick={() => handleResultClick(professor)}
            data-search-result
          >
            <div className={styles.resultHeader}>
              <h4 className={styles.professorsName}>{professor.name}</h4>
              {professor.departments && professor.departments.length > 0 && (
                <span className={styles.department}>{professor.departments[0]}</span>
              )}
            </div>
            <div className={styles.resultDetails}>
              <p className={styles.detailItem}>
                <span className={styles.label}>實驗室：</span>
                <span>{professor.lab}</span>
              </p>
              <p className={styles.detailItem}>
                <span className={styles.label}>系所：</span>
                <span>{professor.location}</span>
              </p>
              {professor.email && (
                <p className={styles.detailItem}>
                  <span className={styles.label}>Email：</span>
                  <span>{professor.email}</span>
                </p>
              )}
            </div>
            {professor.tags && professor.tags.length > 0 && (
              <div className={styles.tags}>
                {professor.tags.map((tag, index) => (
                  <span key={index} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

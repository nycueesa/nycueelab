import React from 'react';
import ProfessorCard from './ProfessorCard';

import styles from './TopicPage.module.css'; 
import { useNavigate } from 'react-router-dom';

const ProfessorDetail = ({ topic, professors }) => {
  
  const navigate = useNavigate();

  // 點擊卡片時，導航到新的 URL
  const handleCardClick = (profId) => {
    // 導航到 Professor 頁面
    navigate(`/professor/${profId}`);
  };

  return (
    // ** 替換所有 className **
    <div className={`${styles['detail-page-container']} ${styles['detail-page-enter']}`}>
      <h1 className={styles['detail-page-title']}>{topic}</h1>
      <div className={styles['professor-card-grid']}>
        {professors.length > 0 ? (
          professors.map((prof) => (
            <ProfessorCard 
              key={prof.id} 
              data={prof} 
              // 點擊事件不變，它會觸發跳轉
              onClick={() => handleCardClick(prof.id)} 
            />
          ))
        ) : (
          // ** 替換 className **
          <p className={styles['no-professors-text']}>此領域尚無教授資料</p>
        )}
      </div>
    </div>
  );
};

export default ProfessorDetail;
import React from 'react';
import ProfessorCard from './ProfessorCard';
// import './topicpage.css'; // <-- 刪除舊的導入

// ** 關鍵修改：導入 CSS Modules (styles 變數) **
import styles from './TopicPage.module.css'; 
import { useNavigate } from 'react-router-dom';

const ProfessorDetail = ({ topic, professors }) => {
  
  const navigate = useNavigate();

  // 點擊卡片時，導航到新的 URL
  const handleCardClick = (profId) => {
    // 導航到您在 App.js 中定義的路徑
    navigate(`/topicpage/prof-info/${profId}`);
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
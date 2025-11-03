import React from 'react';
import ProfessorCard from './ProfessorCard';
import './topicpage.css';
import { useNavigate } from 'react-router-dom'; // ** 1. 匯入 useNavigate **

const ProfessorDetail = ({ topic, professors }) => {
  
  const navigate = useNavigate(); // ** 2. 取得 navigate 函式 **

  // ** 3. 點擊卡片時，導航到新的 URL **
  const handleCardClick = (profId) => {
    // 導航到您在 App.js 中定義的路徑
    navigate(`/topicpage/prof-info/${profId}`);
  };

  return (
    <div className="detail-page-container detail-page-enter">
      <h1 className="detail-page-title">{topic}</h1>
      <div className="professor-card-grid">
        {professors.length > 0 ? (
          professors.map((prof) => (
            <ProfessorCard 
              key={prof.id} 
              data={prof} 
              // ** 4. 呼叫新的 handleCardClick **
              onClick={() => handleCardClick(prof.id)} 
            />
          ))
        ) : (
          <p className="no-professors-text">此領域尚無教授資料</p>
        )}
      </div>
    </div>
  );
};

export default ProfessorDetail;
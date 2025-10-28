import React from 'react';
import ProfessorCard from './ProfessorCard';
import './TopicPage.css';

/**
 * 教授詳情頁面
 * @param {object} props
 * @param {string} props.topic - 顯示的標題 (例如 "類比IC設計")
 * @param {Array} props.professors - 教授物件的陣列
 * @param {Function} props.onBack - (此 prop 雖傳入但不再被使用)
 */
const ProfessorDetail = ({ topic, professors, onBack }) => {
  return (
    // "detail-page-enter" class 會觸發 CSS 動畫
    <div className="detail-page-container detail-page-enter">
      {/* 1. 返回按鈕 (已被移除) */}
      {/* <button onClick={onBack} className="back-button">...
      </button> */}

      {/* 2. 標題 (這就是您圖片中滑動變色的標題) */}
      <h1 className="detail-page-title">{topic}</h1>

      {/* 3. 教授卡片網格 (2 欄) */}
      <div className="professor-card-grid">
        {professors.length > 0 ? (
          professors.map((prof) => (
            <ProfessorCard key={prof.name} data={prof} />
          ))
        ) : (
          <p className="no-professors-text">此領域尚無教授資料</p>
        )}
      </div>
    </div>
  );
};

export default ProfessorDetail;
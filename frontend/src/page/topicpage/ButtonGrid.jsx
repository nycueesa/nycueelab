import React from 'react';
import './topicpage.css';

// 輔助函式 (不變)
const chunkArray = (arr, size) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

/**
 * 這是合併版
 * @param {object} props
 * @param {string[]} props.buttons - 領域按鈕列表
 * @param {string} props.selectedTopic - 目前選中的領域
 * @param {Function} props.onTopicSelect - 第一次點擊 (選領域)
 * @param {object} props.professorData - 教授資料 (來自 JSON)
 * @param {Function} props.onProfessorSelect - 第二次點擊 (選教授)
 */
const ButtonGrid = ({ 
  buttons, 
  selectedTopic, 
  onTopicSelect,
  professorData,
  onProfessorSelect 
}) => {
  
  const buttonRows = chunkArray(buttons, 3); 

  return (
    // "grid-enter" class 用於頁面切換動畫
    <div className="grid-wrapper grid-enter"> 
      {buttonRows.map((row, rowIndex) => (
        <React.Fragment key={rowIndex}>
          
          {/* 1. 渲染「一排」領域按鈕 */}
          <div className="grid-row-container">
            {row.map((topic) => (
              <button
                key={topic}
                // 恢復 'active' class
                className={`grid-button ${selectedTopic === topic ? 'active' : ''}`}
                onClick={() => onTopicSelect(topic)} // 點擊領域
              >
                {topic}
              </button>
            ))}
          </div>

          {/* 2. 恢復：滑動展開面板 */}
          <div className={`professor-reveal-panel ${selectedTopic && row.includes(selectedTopic) ? 'active' : ''}`}>
            {selectedTopic && row.includes(selectedTopic) && (
              <div className="professor-grid-inline">
                {(professorData[selectedTopic] || []).length > 0 ? (
                  
                  // ** 關鍵修改 **
                  // 從完整的 JSON 物件中只讀取 'name' 來當按鈕
                  (professorData[selectedTopic] || []).map((prof) => (
                    <button 
                      key={prof.name} 
                      className="professor-button"
                      // ** 點擊小格子時，呼叫 onProfessorSelect **
                      onClick={() => onProfessorSelect(prof.name)} 
                    >
                      {prof.name}
                    </button>
                  ))

                ) : (
                  <p className="no-professors-text-inline">此領域尚無教授資料</p>
                )}
              </div>
            )}
          </div>

        </React.Fragment>
      ))}
    </div>
  );
};

export default ButtonGrid;
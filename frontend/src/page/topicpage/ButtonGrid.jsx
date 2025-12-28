import React from 'react';
import styles from './TopicPage.module.css';
// ** 關鍵新增：導入 useNavigate Hook **
import { useNavigate } from 'react-router-dom';

// 輔助函式 (不變)
const chunkArray = (arr, size) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

const ButtonGrid = ({ 
  buttons, 
  selectedTopic, 
  onTopicSelect,
  professorData,
  // onProfessorSelect 屬性已從此處移除，不再需要
}) => {
  
  // ** 關鍵新增：取得導航函式 **
  const navigate = useNavigate();
  const buttonRows = chunkArray(buttons, 3); 

  // ** 新增：處理教授小格子點擊事件 (直接跳轉) **
  const handleProfessorClick = (profId) => {
    // 導航到 Professor 頁面，傳入教授的 ID
    navigate(`/professor/${profId}`);
  };

  return (
    <div className={`${styles['topic-grid-wrapper']} ${styles['grid-enter']}`}> 
      {buttonRows.map((row, rowIndex) => (
        <React.Fragment key={rowIndex}>
          
          {/* 1. 渲染「一排」領域按鈕 */}
          <div className={styles['grid-row-container']}>
            {row.map((topic) => (
              <button
                key={topic}
                className={`${styles['grid-button']} ${selectedTopic === topic ? styles.selected : ''}`}
                onClick={() => onTopicSelect(topic)} // 點擊領域 (第一次/第二次點擊)
              >
                {topic}
              </button>
            ))}
          </div>

          {/* 2. 恢復：滑動展開面板 */}
          <div className={styles['panel-wrapper']}>
            {selectedTopic && row.includes(selectedTopic) && (
              <div
                className={styles['arrow-pointer']}
                style={{
                  left: `${((row.indexOf(selectedTopic) + 0.5) / row.length) * 100}%`
                }}
              />
            )}
            <div
              className={`${styles['professor-reveal-panel']} ${selectedTopic && row.includes(selectedTopic) ? styles.active : ''}`}
            >
              {selectedTopic && row.includes(selectedTopic) && (
                <div className={styles['professor-chips-container']}>
                  {(professorData[selectedTopic] || []).length > 0 ? (
                    (professorData[selectedTopic] || []).map((prof) => (
                      <span
                        key={prof.id}
                        className={styles['professor-chip']}
                        onClick={() => handleProfessorClick(prof.id)}
                      >
                        {prof.name}
                      </span>
                    ))
                  ) : (
                    <p className={styles['no-professors-text-inline']}>此領域尚無教授資料</p>
                  )}
                </div>
              )}
            </div>
          </div>

        </React.Fragment>
      ))}
    </div>
  );
};

export default ButtonGrid;
import React from 'react';
// import './topicpage.css'; // <-- 刪除舊的導入

// ** 關鍵修改 1：導入 CSS Modules (styles 變數) **
import styles from './TopicPage.module.css';

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
  onProfessorSelect 
}) => {
  
  const buttonRows = chunkArray(buttons, 3); 

  return (
    // ** 關鍵修改 2：替換所有 className **
    <div className={`${styles['topic-grid-wrapper']} ${styles['grid-enter']}`}> 
      {buttonRows.map((row, rowIndex) => (
        <React.Fragment key={rowIndex}>
          
          {/* 1. 渲染「一排」領域按鈕 */}
          <div className={styles['grid-row-container']}>
            {row.map((topic) => (
              <button
                key={topic}
                // 使用陣列模板字符串動態加入 class，並使用 styles.active
                className={`${styles['grid-button']} ${selectedTopic === topic ? styles.active : ''}`}
                onClick={() => onTopicSelect(topic)} // 點擊領域
              >
                {topic}
              </button>
            ))}
          </div>

          {/* 2. 恢復：滑動展開面板 */}
          <div className={`${styles['professor-reveal-panel']} ${selectedTopic && row.includes(selectedTopic) ? styles.active : ''}`}>
            {selectedTopic && row.includes(selectedTopic) && (
              <div className={styles['professor-grid-inline']}>
                {(professorData[selectedTopic] || []).length > 0 ? (
                  
                  // ** 關鍵修改：小格子按鈕的 className **
                  (professorData[selectedTopic] || []).map((prof) => (
                    <button 
                      key={prof.name} 
                      className={styles['professor-button']}
                      onClick={() => onProfessorSelect(prof.name)} 
                    >
                      {prof.name}
                    </button>
                  ))

                ) : (
                  <p className={styles['no-professors-text-inline']}>此領域尚無教授資料</p>
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
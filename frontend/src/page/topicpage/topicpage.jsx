import React, { useState } from 'react';
import styles from './TopicPage.module.css';
import ButtonGrid from './ButtonGrid'; 
import ProfessorDetail from './ProfessorDetail'; 
import ProfessorInfo from './infoPage/ProfessorInfo';

// ** 步驟 1：只匯入一個 JSON 檔案 **
import allData from '../../assets/allData.json'; 

const TABS_CONFIG = ['依系所瀏覽', '依領域瀏覽', '依清單瀏覽'];
// 步驟 2：從新的 JSON 結構中讀取按鈕列表
const DEPARTMENT_TOPICS_CONFIG = allData.topics.departments;
const FIELD_TOPICS_CONFIG = allData.topics.fields;
// 步驟 3：讀取所有教授的主列表
const ALL_PROFESSORS_LIST = allData.professors;


function TopicPage() {
  const [activeTab, setActiveTab] = useState(TABS_CONFIG[0]);
  const [selectedTopic, setSelectedTopic] = useState(null); 
  const [detailPageTopic, setDetailPageTopic] = useState(null); 

  // ... (handleTopicSelect 函式不變) ...
  const handleTopicSelect = (topic) => {
    if (selectedTopic === topic) {
      setDetailPageTopic(topic); 
    } else {
      setSelectedTopic(topic);
      setDetailPageTopic(null); 
    }
  };

  // handleProfessorSelect 函式已在 ButtonGrid 中處理，這裡不再需要

  // 切換頁籤 (不變)
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedTopic(null); 
    setDetailPageTopic(null); 
  };

  // ** 步驟 4：動態生成 currentData (教授映射表) **
  const generateProfessorMap = (topicList, filterKey) => {
    const profMap = {};
    // 1. 初始化所有主題的空陣列
    for (const topic of topicList) {
      profMap[topic] = [];
    }
    // 2. 遍歷所有教授，將他們分配到對應的主題
    for (const prof of ALL_PROFESSORS_LIST) {
      const profTopics = prof[filterKey]; // e.g., prof['departments'] or prof['fields']
      if (profTopics) {
        for (const topic of profTopics) {
          if (profMap[topic]) {
            profMap[topic].push(prof);
          }
        }
      }
    }
    return profMap;
  };


  // 決定要渲染什麼內容 (核心邏輯)
  const renderTabContent = () => {
    
    let currentTopics, currentData;
    if (activeTab === '依系所瀏覽') {
      currentTopics = DEPARTMENT_TOPICS_CONFIG;
      // 動態生成系所的教授映射表
      currentData = generateProfessorMap(currentTopics, 'departments');
    } else if (activeTab === '依領域瀏覽') {
      currentTopics = FIELD_TOPICS_CONFIG;
      // 動態生成領域的教授映射表
      currentData = generateProfessorMap(currentTopics, 'fields');
    } else {
      return <div className={styles['tab-content-placeholder']}>依清單瀏覽 內容</div>;
    }

    if (detailPageTopic) {
      const professorsInTopic = currentData[detailPageTopic] || [];
      return (
        <ProfessorDetail
          topic={detailPageTopic} 
          professors={professorsInTopic}
        />
      );
    } 
    
    return (
      <ButtonGrid
        buttons={currentTopics} 
        selectedTopic={selectedTopic}
        onTopicSelect={handleTopicSelect}
        professorData={currentData}
        // onProfessorSelect 已被 ButtonGrid 內部處理
      />
    );
  };

  // ... (return JSX 保持不變) ...
  return (
    <div className={styles['nycu-topic-container']}>
      <nav className={styles['browse-nav']}>
        {TABS_CONFIG.map((label) => (
          <button
            key={label}
            className={`${styles['browse-nav-item']} ${activeTab === label ? styles.active : ''}`}
            onClick={() => handleTabChange(label)}
          >
            {label}
          </button>
        ))}
      </nav>
      
      <div className={styles['content-area']}>
        <div className={styles['content-area-wrapper']}>
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}

export default TopicPage;
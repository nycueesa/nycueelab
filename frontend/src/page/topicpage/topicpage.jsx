import React, { useState } from 'react';
import './topicpage.css'; 
import ButtonGrid from './ButtonGrid'; 
import ProfessorDetail from './ProfessorDetail'; 

// 匯入四個獨立的 JSON 檔案 (不變)
import departmentTopicList from './departments.json'; 
import departmentProfessorData from './departmentProfessors.json'; 
import fieldTopicList from './fields.json';
import fieldProfessorData from './fieldProfessors.json';

const TABS_CONFIG = ['依系所瀏覽', '依領域瀏覽', '依清單瀏覽'];
const DEPARTMENT_TOPICS_CONFIG = departmentTopicList;
const FIELD_TOPICS_CONFIG = fieldTopicList;


function TopicPage() {
  const [activeTab, setActiveTab] = useState(TABS_CONFIG[0]);
  
  // 狀態 1：選中的領域 (用於展開小格子)
  const [selectedTopic, setSelectedTopic] = useState(null); 
  // 狀態 2：是否顯示詳情頁 (用 topic 名稱來觸發)
  const [detailPageTopic, setDetailPageTopic] = useState(null); 

  // ** 第一次點擊：選領域 (大格子) **
  const handleTopicSelect = (topic) => {
    
    // ** 關鍵邏輯：第二次點擊 **
    // 如果點擊的是 "已經選中" 的領域
    if (selectedTopic === topic) {
      // 觸發切換到詳情頁
      setDetailPageTopic(topic); 
    } else {
      // ** 第一次點擊 **
      // 否則，只是展開/切換小格子
      setSelectedTopic(topic);
      // 確保詳情頁是關閉的
      setDetailPageTopic(null); 
    }
  };
  
  // ** 第二次點擊 (備案)：選教授 (小格子) **
  // 點擊小格子也會跳轉到詳情頁
  const handleProfessorSelect = (professorName) => {
    // 確保我們知道是哪個領域的詳情頁
    if (selectedTopic) {
      setDetailPageTopic(selectedTopic);
    }
    // (您可以選擇註解掉這行，如果您不希望點小格子有反應)
  };

  // 切換頁籤時，重設 "所有" 狀態
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedTopic(null); 
    setDetailPageTopic(null); // ** 新增：重設詳情頁狀態 **
  };

  // 決定要渲染什麼內容 (核心邏輯)
  const renderTabContent = () => {
    
    // 1. 決定使用哪一套資料
    let currentTopics, currentData;
    if (activeTab === '依系所瀏覽') {
      currentTopics = DEPARTMENT_TOPICS_CONFIG;
      currentData = departmentProfessorData;
    } else if (activeTab === '依領域瀏覽') {
      currentTopics = FIELD_TOPICS_CONFIG;
      currentData = fieldProfessorData;
    } else {
      return <div className="tab-content-placeholder">依清單瀏覽 內容</div>;
    }

    // 2. 決定渲染哪個元件
    
    // ** 狀態二：已觸發詳情頁 -> 顯示教授詳情頁 **
    if (detailPageTopic) {
      const professorsInTopic = currentData[detailPageTopic] || [];
      return (
        <ProfessorDetail
          topic={detailPageTopic} 
          professors={professorsInTopic}
          // (onBack 功能已被移除)
        />
      );
    } 
    
    // ** 狀態一：顯示按鈕網格 **
    return (
      <ButtonGrid
        buttons={currentTopics} 
        selectedTopic={selectedTopic}
        onTopicSelect={handleTopicSelect} // 第一次/第二次點擊 (大格子)
        professorData={currentData}
        onProfessorSelect={handleProfessorSelect} // 第二次點擊 (小格子)
      />
    );
  };

  return (
    <div className="nycu-topic-container">
      <nav className="browse-nav">
        {TABS_CONFIG.map((label) => (
          <button
            key={label}
            className={`browse-nav-item ${activeTab === label ? 'active' : ''}`}
            onClick={() => handleTabChange(label)}
          >
            {label}
          </button>
        ))}
      </nav>
      
      <div className="content-area">
        <div className="content-area-wrapper">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}

export default TopicPage;
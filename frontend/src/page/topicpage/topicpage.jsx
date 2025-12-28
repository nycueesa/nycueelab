import React, { useState, useEffect } from 'react';
import styles from './TopicPage.module.css';
import ButtonGrid from './ButtonGrid';
import ProfessorDetail from './ProfessorDetail';
import ProfessorInfo from './infoPage/ProfessorInfo';
import { useData } from '../../hooks/useData.js'; 

const TABS_CONFIG = ['依系所瀏覽', '依領域瀏覽'];

// ** 修正 1：生成乾淨的標籤列表 (移除 #) **
const generateUniqueTags = (professors) => {
    const tagSet = new Set();
    for (const prof of professors) {
        if (Array.isArray(prof.tags)) {
            prof.tags.forEach(tag => {
                if (typeof tag === 'string') {
                    // 移除開頭的 # 符號，並移除多餘空白
                    let cleanedTag = tag.trim();
                    if (cleanedTag.startsWith('#')) {
                        cleanedTag = cleanedTag.substring(1);
                    }
                    
                    // 確保清理後標籤不為空
                    if (cleanedTag) { 
                        tagSet.add(cleanedTag);
                    }
                }
            });
        }
    }
    return Array.from(tagSet).sort();
};

function TopicPage() {
  const { data: newData, loading, error } = useData();
  const [activeTab, setActiveTab] = useState(TABS_CONFIG[0]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [detailPageTopic, setDetailPageTopic] = useState(null);
  const [departmentTopics, setDepartmentTopics] = useState([]);
  const [fieldTopics, setFieldTopics] = useState([]);
  const [allProfessors, setAllProfessors] = useState([]);

  // 當資料載入完成時，更新狀態
  useEffect(() => {
    if (newData) {
      const professors = newData.professors || [];
      setAllProfessors(professors);
      setDepartmentTopics(newData.topics?.departments || []);
      setFieldTopics(generateUniqueTags(professors));
    }
  }, [newData]); 

  const handleTopicSelect = (topic) => {
    if (selectedTopic === topic) {
      setDetailPageTopic(topic); 
    } else {
      setSelectedTopic(topic);
      setDetailPageTopic(null); 
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedTopic(null); 
    setDetailPageTopic(null); 
  };

  /**
   * ** 修正 2：動態生成教授映射表 (處理 # 對應問題) **
   * 這個函式負責將教授分配到各個按鈕(格子)中
   */
  const generateProfessorMap = (topicList, filterKey) => {
    const profMap = {};

    // 1. 初始化所有主題的空陣列 (鍵名是乾淨的，如 "AI")
    for (const topic of topicList) {
      profMap[topic] = [];
    }

    // 2. 遍歷所有教授
    for (const prof of allProfessors) {
      const profTopics = prof[filterKey]; // 取得教授的 tags 或 department
      
      if (profTopics && Array.isArray(profTopics)) {
        for (const rawTopic of profTopics) {
          if (typeof rawTopic !== 'string') continue;

          // 情況 A: 直接匹配 (例如系所名稱通常沒有 #)
          if (profMap[rawTopic]) {
            profMap[rawTopic].push(prof);
            continue; // 匹配成功，跳過
          }

          // 情況 B: 處理帶有 # 的標籤 (例如教授資料是 "#AI"，但按鈕是 "AI")
          if (rawTopic.startsWith('#')) {
             const cleanTopic = rawTopic.substring(1); // 移除 #
             if (profMap[cleanTopic]) {
               profMap[cleanTopic].push(prof);
             }
          }
        }
      }
    }
    return profMap;
  };


  // 決定要渲染什麼內容
  const renderTabContent = () => {
    if (!newData || allProfessors.length === 0) {
      return null;
    }

    let currentTopics, currentData;

    if (activeTab === '依系所瀏覽') {
      currentTopics = departmentTopics;
      // 依系所篩選，通常不需要去 #，但上面的邏輯兼容
      currentData = generateProfessorMap(currentTopics, 'department');
    } else if (activeTab === '依領域瀏覽') {
      currentTopics = fieldTopics; // 這是沒有 # 的列表
      // 依領域篩選，會自動處理 JSON 中有 # 的情況
      currentData = generateProfessorMap(currentTopics, 'tags');
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
      />
    );
  };

  // --- 載入狀態檢查 ---
  if (loading) {
     return <div className={styles['nycu-topic-container']}>載入中...</div>;
  }
  if (error) {
     return <div className={styles['nycu-topic-container']}>載入錯誤: {error}</div>;
  }
  if (!newData || allProfessors.length === 0) {
     return <div className={styles['nycu-topic-container']}>暫無教授資料</div>;
  }

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
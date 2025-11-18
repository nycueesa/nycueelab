/**
 * 計算字符串的相似度分數（0-1）
 * @param {string} query - 搜尋詞
 * @param {string} text - 被搜尋的文本
 * @returns {number} 相似度分數
 */
export const calculateRelevance = (query, text) => {
  if (!query || !text) return 0;
  
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  
  // 完全相符：最高分
  if (textLower === queryLower) return 1;
  
  // 開頭相符
  if (textLower.startsWith(queryLower)) return 0.9;
  
  // 包含完整詞
  if (textLower.includes(queryLower)) return 0.7;
  
  // 模糊匹配：檢查每個字符是否在文本中
  let score = 0;
  let textIndex = 0;
  for (let i = 0; i < queryLower.length; i++) {
    const charIndex = textLower.indexOf(queryLower[i], textIndex);
    if (charIndex === -1) return 0;
    score += 1;
    textIndex = charIndex + 1;
  }
  
  return (score / Math.max(queryLower.length, textLower.length)) * 0.5;
};

/**
 * 搜尋教授
 * @param {string} query - 搜尋詞
 * @param {object} allData - 完整的教授數據 { topics: {...}, professors: [...] }
 * @param {object} filters - 過濾條件 { location: string, lab: string, departments: string }
 * @returns {array} 搜尋結果，按相關度排序
 */
export const searchProfessors = (query, allData, filters = {}) => {
  const results = [];
  const professors = allData.professors || [];
  
  // 遍歷所有教授
  professors.forEach((professor) => {
    // 應用過濾條件（AND 邏輯）
    if (filters.location && professor.location !== filters.location) return;
    if (filters.lab && professor.lab !== filters.lab) return;
    if (filters.departments && (!professor.departments || !professor.departments.includes(filters.departments))) return;
    
    // 如果沒有搜尋詞，直接加入結果
    if (!query) {
      results.push({
        ...professor,
        relevance: 0,
      });
      return;
    }
    
    // 計算相關度
    let maxRelevance = 0;
    
    // 檢查每個搜尋欄位
    const searchFields = [
      String(professor.id), // id
      professor.name, // name
      professor.lab, // lab
      professor.location, // location
    ];
    
    // 檢查 tags（陣列）
    if (professor.tags && Array.isArray(professor.tags)) {
      professor.tags.forEach(tag => {
        const relevance = calculateRelevance(query, tag);
        maxRelevance = Math.max(maxRelevance, relevance);
      });
    }
    
    // 檢查 departments（陣列）
    if (professor.departments && Array.isArray(professor.departments)) {
      professor.departments.forEach(dept => {
        const relevance = calculateRelevance(query, dept);
        maxRelevance = Math.max(maxRelevance, relevance);
      });
    }
    
    // 檢查 fields（陣列）
    if (professor.fields && Array.isArray(professor.fields)) {
      professor.fields.forEach(field => {
        const relevance = calculateRelevance(query, field);
        maxRelevance = Math.max(maxRelevance, relevance);
      });
    }
    
    // 檢查其他欄位
    searchFields.forEach(field => {
      if (field) {
        const relevance = calculateRelevance(query, field);
        maxRelevance = Math.max(maxRelevance, relevance);
      }
    });
    
    // 只有相關度大於0才加入結果
    if (maxRelevance > 0) {
      results.push({
        ...professor,
        relevance: maxRelevance,
      });
    }
  });
  
  // 按相關度排序（降序）
  results.sort((a, b) => b.relevance - a.relevance);
  
  return results;
};

/**
 * 獲取所有可用的過濾選項
 * @param {object} allData - 完整的教授數據 { topics: {...}, professors: [...] }
 * @returns {object} 包含locations, labs, departments 的對象
 */
export const getFilterOptions = (allData) => {
  const locations = new Set();
  const labs = new Set();
  const departments = new Set();
  const professors = allData.professors || [];
  
  professors.forEach((professor) => {
    if (professor.location) locations.add(professor.location);
    if (professor.lab) labs.add(professor.lab);
    if (professor.departments && Array.isArray(professor.departments)) {
      professor.departments.forEach(dept => departments.add(dept));
    }
  });
  
  return {
    locations: Array.from(locations).sort(),
    labs: Array.from(labs).sort(),
    departments: Array.from(departments).sort(),
  };
};

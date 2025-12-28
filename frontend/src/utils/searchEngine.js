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
 * @param {object} filters - 過濾條件 { location: string, departments: string }
 * @returns {array} 搜尋結果，按相關度排序
 */
export const searchProfessors = (query, allData, filters = {}) => {
  const results = [];
  const professors = allData.professors || [];

  professors.forEach((professor) => {
    const professorDepartments = Array.isArray(professor.department)
      ? professor.department
      : Array.isArray(professor.departments)
        ? professor.departments
        : [];
    const professorTags = Array.isArray(professor.tags) ? professor.tags : [];

    // 過濾：系所 -> department，領域 -> tags
    if (filters.location && !professorDepartments.includes(filters.location)) return;
    if (filters.department && !professorTags.includes(filters.department)) return;

    // 如果沒有搜尋詞，直接加入結果
    if (!query) {
      results.push({
        ...professor,
        relevance: 0,
      });
      return;
    }

    let maxRelevance = 0;

    const searchFields = [
      String(professor.id),
      professor.name,
      professor.lab || professor.labName,
      professor.location,
      ...professorDepartments,
    ];

    // tags 視為領域，優先比對
    professorTags.forEach(tag => {
      const relevance = calculateRelevance(query, tag);
      maxRelevance = Math.max(maxRelevance, relevance);
    });

    // 其他陣列欄位
    if (professor.fields && Array.isArray(professor.fields)) {
      professor.fields.forEach(field => {
        const relevance = calculateRelevance(query, field);
        maxRelevance = Math.max(maxRelevance, relevance);
      });
    }

    // 基本欄位
    searchFields.forEach(field => {
      if (field) {
        const relevance = calculateRelevance(query, field);
        maxRelevance = Math.max(maxRelevance, relevance);
      }
    });

    if (maxRelevance > 0) {
      results.push({
        ...professor,
        relevance: maxRelevance,
      });
    }
  });

  results.sort((a, b) => b.relevance - a.relevance);
  return results;
};

/**
 * 獲取所有可用的過濾選項
 * @param {object} allData - 完整的教授數據 { topics: {...}, professors: [...] }
 * @returns {object} 包含locations, departments 的對象
 */
export const getFilterOptions = (allData) => {
  const locations = new Set(); // 系所 -> professor.department
  const departments = new Set(); // 領域 -> professor.tags
  const professors = allData.professors || [];

  professors.forEach((professor) => {
    const professorDepartments = Array.isArray(professor.department)
      ? professor.department
      : Array.isArray(professor.departments)
        ? professor.departments
        : [];
    const professorTags = Array.isArray(professor.tags) ? professor.tags : [];

    professorDepartments.forEach(dep => dep && locations.add(dep));
    professorTags.forEach(tag => tag && departments.add(tag));
  });

  return {
    locations: Array.from(locations).sort(),
    departments: Array.from(departments).sort(),
  };
};

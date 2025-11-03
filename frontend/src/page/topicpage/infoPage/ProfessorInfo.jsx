import React from 'react';
import './ProfessorInfo.css'; 
import { useParams } from 'react-router-dom'; 

import departmentProfessorData from '../departmentProfessors.json'; 
import fieldProfessorData from '../fieldProfessors.json';

const BASE_URL = import.meta.env.BASE_URL;
const DEFAULT_AVATAR_URL = `${BASE_URL}assets/default-prof.jpg`;

// ** 關鍵修正 1：恢復 ALL_PROFESSOR_DATA 的定義 **
const ALL_PROFESSOR_DATA = { 
  ...departmentProfessorData, 
  ...fieldProfessorData 
};

// ** 關鍵修正 2：恢復 findProfessorById 的定義 **
const findProfessorById = (id) => {
    // 遍歷所有領域的教授列表，找到匹配的 ID
    for (const topicKey in ALL_PROFESSOR_DATA) {
        const professors = ALL_PROFESSOR_DATA[topicKey];
        // 確保字串和數字 ID 都能匹配
        const found = professors.find(p => String(p.id) === id); 
        if (found) return found;
    }
    return null;
};


const ProfessorInfo = () => {
    const { profId } = useParams();
    const professor = findProfessorById(profId);

    // --- JSX 渲染 ---
    if (!professor) {
        return (
            <div className="full-width-page" style={{ padding: '40px 20px' }}>
                <div className="detail-page-container">
                    <p className="no-professors-text">找不到 ID 為 "{profId}" 的教授資料。</p>
                </div>
            </div>
        );
    }

    const { name, lab, image, tags, location, email, website } = professor;

    return (
        <div className="full-width-page">
            <div className="prof-info-container prof-info-enter">
                <h1 className="prof-info-title">{lab}</h1>
                <h2 className="prof-info-subtitle">負責教授: {name}</h2>
                
                <div className="prof-info-grid">
                    <div className="prof-info-details">
                        <h3>研究領域</h3>
                        <p>{tags.join('、 ')}</p>
                        <h3>實驗室位置</h3>
                        <p>{location}</p>
                        <h3>聯絡方式</h3>
                        <p><a href={`mailto:${email}`}>{email}</a></p>
                        <h3>相關網站</h3>
                        <p><a href={website} target="_blank" rel="noopener noreferrer">個人/實驗室網站</a></p>
                        <hr className="prof-info-divider" />
                        <h3>實驗室簡介</h3>
                        <p>
                            實驗室主要專注於**類比IC設計**、**數位IC設計**與**AI晶片整合**。
                        </p>
                    </div>
                    <div className="prof-info-image-wrapper">
                        <img src={image || DEFAULT_AVATAR_URL} alt={name} className="prof-info-image" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfessorInfo;
import React from 'react';
import styles from './ProfessorInfo.module.css'; 
import { useParams } from 'react-router-dom'; 

// ** 關鍵修正：導入新的 JSON 檔案名 **
import newData from '../NewData.json';

// (假設您使用 public/assets/，這是在 App.jsx 中設定的)
const BASE_URL = import.meta.env.BASE_URL;
const DEFAULT_AVATAR_URL = `${BASE_URL}assets/default-prof.jpg`;

// ** 關鍵修正：從 newData.professors 讀取 **
const ALL_PROFESSORS_LIST = newData.professors; 

// 輔助函式：根據 ID 查找教授 (不變)
const findProfessorById = (id) => {
    return ALL_PROFESSORS_LIST.find(p => String(p.id) === id) || null;
};


const ProfessorInfo = () => {
    const { profId } = useParams();
    const professor = findProfessorById(profId);

    // --- JSX 渲染 ---
    if (!professor) {
        return (
            <div className={styles['full-width-page']} style={{ padding: '40px 20px' }}>
                <div className={styles['detail-page-container']}>
                    <p className={styles['no-professors-text']}>找不到 ID 為 "{profId}" 的教授資料。</p>
                </div>
            </div>
        );
    }

    const { name, labName, photo, officeLocation, email, LabWebsite, tags, research, recomendedCourses, faqs, link } = professor;

    return (
        <div className={styles['full-width-page']}>
            <div className={`${styles['prof-info-container']} ${styles['prof-info-enter']}`}>
                <h1 className={styles['prof-info-title']}>{labName}</h1>
                <h2 className={styles['prof-info-subtitle']}>負責教授: {name}</h2>
                
                <div className={styles['prof-info-grid']}>
                    <div className={styles['prof-info-details']}>
                        <h3>研究領域</h3>
                        <p>{tags.join(' ')}</p>
                        
                        {/* 這裡可以根據您的新 JSON 結構來顯示更多資訊 */}
                        
                        <h3>實驗室位置</h3>
                        <p>{officeLocation}</p>
                        <h3>聯絡方式</h3>
                        <p><a href={`mailto:${email}`}>{email}</a></p>
                        <h3>相關網站</h3>
                        <p><a href={LabWebsite} target="_blank" rel="noopener noreferrer">實驗室網站</a></p>
                        
                        <hr className={styles['prof-info-divider']} />
                        
                        <h3>研究項目</h3>
                        {research.map((item, index) => (
                            <div key={index}>
                                <h4>{item.title}</h4>
                                {item.subtitle && item.subtitle.map((sub, subIndex) => (
                                    <p key={subIndex} className={styles['research-subtitle']}>- {sub}</p>
                                ))}
                            </div>
                        ))}
                        
                    </div>
                    <div className={styles['prof-info-image-wrapper']}>
                        <img src={photo || DEFAULT_AVATAR_URL} alt={name} className={styles['prof-info-image']} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfessorInfo;
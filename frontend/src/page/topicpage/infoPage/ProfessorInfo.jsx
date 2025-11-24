import React from 'react';
import styles from './ProfessorInfo.module.css'; 
import { useParams } from 'react-router-dom'; 

// 導入 JSON (路徑是 ../allData.json)
import allData from '../../../assets/allData.json';

// ** 關鍵修正 1：修正圖片路徑 (往上跳三層) **
import defaultAvatar from '../../../assets/default-prof.jpg'; 

const ALL_PROFESSORS_LIST = allData.professors; 

// 輔助函式：根據 ID 查找教授
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

    const { name, lab, image, tags, location, email, website } = professor;

    return (
        <div className={styles['full-width-page']}>
            <div className={`${styles['prof-info-container']} ${styles['prof-info-enter']}`}>
                <h1 className={styles['prof-info-title']}>{lab}</h1>
                <h2 className={styles['prof-info-subtitle']}>負責教授: {name}</h2>
                
                <div className={styles['prof-info-grid']}>
                    <div className={styles['prof-info-details']}>
                        <h3>研究領域</h3>
                        <p>{tags.map(tag => `#${tag}`).join(' ')}</p>
                        <h3>實驗室位置</h3>
                        <p>{location}</p>
                        <h3>聯絡方式</h3>
                        <p><a href={`mailto:${email}`}>{email}</a></p>
                        <h3>相關網站</h3>
                        <p><a href={website} target="_blank" rel="noopener noreferrer">個人/實驗室網站</a></p>
                        <hr className={styles['prof-info-divider']} />
                        <h3>實驗室簡介</h3>
                        {/* ** 關鍵修正 2：將 <E> 改為 </p> ** */}
                        <p>
                            實驗室主要專注於**類比IC設計**、**數位IC設計**與**AI晶片整合**。
                        </p>
                    </div>
                    <div className={styles['prof-info-image-wrapper']}>
                        <img src={image || defaultAvatar} alt={name} className={styles['prof-info-image']} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfessorInfo;
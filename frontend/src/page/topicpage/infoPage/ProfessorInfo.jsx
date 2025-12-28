import React from 'react';
import styles from './ProfessorInfo.module.css';
import { useParams } from 'react-router-dom';
import { useData } from '../../../hooks/useData.js';

// (假設您使用 public/assets/，這是在 App.jsx 中設定的)
const BASE_URL = import.meta.env.BASE_URL;
const DEFAULT_AVATAR_URL = `${BASE_URL}assets/default-prof.jpg`;

const ProfessorInfo = () => {
    const { profId } = useParams();
    const { data: newData, loading, error } = useData();

    // 從資料中查找教授
    const professor = React.useMemo(() => {
        if (!newData || !newData.professors) return null;
        return newData.professors.find(p => String(p.id) === profId) || null;
    }, [newData, profId]);

    // --- JSX 渲染 ---
    if (loading) {
        return (
            <div className={styles['full-width-page']} style={{ padding: '40px 20px' }}>
                <div className={styles['detail-page-container']}>
                    <p className={styles['no-professors-text']}>載入中...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles['full-width-page']} style={{ padding: '40px 20px' }}>
                <div className={styles['detail-page-container']}>
                    <p className={styles['no-professors-text']}>載入錯誤: {error}</p>
                </div>
            </div>
        );
    }

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
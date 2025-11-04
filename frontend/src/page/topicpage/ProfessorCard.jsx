import React from 'react';
// import './topicpage.css'; // <-- 刪除舊的導入

// ** 關鍵修改 1：導入 CSS Modules (styles 變數) **
import styles from './TopicPage.module.css'; 

// (假設您最終決定使用 src/assets 的 import 方法)
import defaultAvatar from '../../assets/default-prof.jpg'; 

// 這些是 icon (不變)
const LocationIcon = () => <>&#128205;</>; // 📍
const EmailIcon = () => <>&#128231;</>; // 📧
const WebIcon = () => <>&#128187;</>; // 💻

const ProfessorCard = ({ data, onClick }) => {
  return (
    // ** 關鍵修改 2：替換所有 className **
    <div 
      className={styles['professor-card-interactive']} 
      onClick={onClick}
    >
      <div className={styles['card-left']}>
        <img 
          src={data.image || defaultAvatar} 
          alt={data.name} 
          className={styles['card-image']} 
        />
      </div>
      <div className={styles['card-right']}>
        <div className={styles['card-tags']}>
          {data.tags.join(' ')}
        </div>
        <h3 className={styles['card-name']}>{data.name}</h3>
        <p className={styles['card-lab']}>{data.lab}</p>
        
        <div className={styles['card-contact-row']}>
          <LocationIcon /> {data.location}
        </div>
        <div className={styles['card-contact-row']}>
          {/* stopPropagation 防止點擊 email 時觸發卡片點擊 */}
          <a href={`mailto:${data.email}`} onClick={(e) => e.stopPropagation()}>
            <EmailIcon /> {data.email}
          </a>
        </div>
        <div className={styles['card-contact-row']}>
          <a href={data.website} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
            <WebIcon /> 個人網站
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProfessorCard;
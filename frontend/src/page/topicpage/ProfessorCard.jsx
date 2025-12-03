import React from 'react';
import styles from './TopicPage.module.css'; 

import defaultAvatar from '../../assets/default-prof.jpg'; 

// ** 關鍵修改：導入您的 SVG 圖標 **
import LocationSvg from '../../assets/location-icon.svg'; // 請確保路徑正確
import EmailSvg from '../../assets/email-icon.svg';     // 請確保路徑正確
import WebSvg from '../../assets/web-icon.svg';         // 請確保路徑正確

const ProfessorCard = ({ data, onClick }) => {
  return (
    <div 
      className={styles['professor-card-interactive']} 
      onClick={onClick}
    >
      <div className={styles['card-header-tags']}>
        {data.tags.join(' ')}
      </div>

      <div className={styles['card-content-wrapper']}>
        <img 
          src={data.image || defaultAvatar} 
          alt={data.name} 
          className={styles['card-image']} 
        />
        <div className={styles['card-info-right']}>
          <h3 className={styles['card-name']}>{data.name}</h3>
          <p className={styles['card-lab']}>{data.lab}</p>
          
          <div className={styles['card-contact-row']}>
            {/* ** 使用 SVG 圖標代替文字圖標 ** */}
            <img src={LocationSvg} alt="Location" className={styles['contact-icon']} /> 
            <span>{data.location}</span>
          </div>

          <div className={styles['card-contact-links']}>
            <a href={`mailto:${data.email}`} onClick={(e) => e.stopPropagation()}>
              <img src={EmailSvg} alt="Email" className={styles['contact-icon']} />
            </a>
            <a href={data.website} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
              <img src={WebSvg} alt="Website" className={styles['contact-icon']} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessorCard;
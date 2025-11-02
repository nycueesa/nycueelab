import React from 'react';
import './topicpage.css'; // 我們共用同一個 CSS

// ** 步驟 1：從您的 assets 資料夾匯入預設圖片 **
// (如果您的路徑或檔名不同，請修改這一行)

// 這些是 icon (不變)
const LocationIcon = () => <>&#128205;</>; // 📍
const EmailIcon = () => <>&#128231;</>; // 📧
const WebIcon = () => <>&#128187;</>; // 💻

const ProfessorCard = ({ data }) => {

  const defaultAvatarPath = '/assets/default-prof.jpg';

  return (
    <div className="professor-card">
      <div className="card-left">
        {/*
          ** 步驟 2：修改 img 標籤的 src 屬性 **
          - data.image || defaultAvatar
          - 這行的意思是：
          - 1. 嘗試使用 data.image (來自 JSON 的圖片 URL)
          - 2. 如果 data.image 是空字串、null 或 undefined (即 "falsy" 值)，
          - 3. 則 "或者" (||) 改用我們匯入的 defaultAvatar
        */}
        <img 
          src={data.image || defaultAvatar} 
          alt={data.name} 
          className="card-image" 
        />
      </div>
      <div className="card-right">
        <div className="card-tags">
          {data.tags.join(' ')}
        </div>
        <h3 className="card-name">{data.name}</h3>
        <p className="card-lab">{data.lab}</p>
        
        <div className="card-contact-row">
          <LocationIcon /> {data.location}
        </div>
        <div className="card-contact-row">
          <a href={`mailto:${data.email}`}>
            <EmailIcon /> {data.email}
          </a>
        </div>
        <div className="card-contact-row">
          <a href={data.website} target="_blank" rel="noopener noreferrer">
            <WebIcon /> 個人網站
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProfessorCard;
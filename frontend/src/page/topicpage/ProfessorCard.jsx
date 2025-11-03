import React from 'react';
import './topicpage.css'; 

// (假設您最終決定使用 src/assets 的 import 方法)
import defaultAvatar from '../../assets/default-prof.jpg'; 

// 這些是 icon (不變)
const LocationIcon = () => <>&#128205;</>; // 📍
const EmailIcon = () => <>&#128231;</>; // 📧
const WebIcon = () => <>&#128187;</>; // 💻

const ProfessorCard = ({ data, onClick }) => {
  return (
    // 卡片本身是可點擊的，並觸發傳入的 onClick
    <div 
      className="professor-card-interactive" 
      onClick={onClick}
    >
      <div className="card-left">
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
          {/* stopPropagation 防止點擊 email 時觸發卡片點擊 */}
          <a href={`mailto:${data.email}`} onClick={(e) => e.stopPropagation()}>
            <EmailIcon /> {data.email}
          </a>
        </div>
        <div className="card-contact-row">
          <a href={data.website} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
            <WebIcon /> 個人網站
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProfessorCard;
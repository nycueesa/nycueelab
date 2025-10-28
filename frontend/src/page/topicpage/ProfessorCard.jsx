import React from 'react';
import './TopicPage.css'; // 我們共用同一個 CSS

// 這些是 icon。在真實專案中，您會使用 icon 庫 (如 FontAwesome 或 Material Icons)
// 為了簡單起見，我們暫時使用 Emoji。
const LocationIcon = () => <>&#128205;</>; // 📍
const EmailIcon = () => <>&#128231;</>; // 📧
const WebIcon = () => <>&#128187;</>; // 💻

const ProfessorCard = ({ data }) => {
  return (
    <div className="professor-card">
      <div className="card-left">
        <img src={data.image} alt={data.name} className="card-image" />
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
          {/* 我們使用 mailto: 連結讓 E-mail 可以點擊 */}
          <a href={`mailto:${data.email}`}>
            <EmailIcon /> {data.email}
          </a>
        </div>
        <div className="card-contact-row">
          {/* 我們使用 a target="_blank" 讓網頁在新分頁開啟 */}
          <a href={data.website} target="_blank" rel="noopener noreferrer">
            <WebIcon /> 個人網站
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProfessorCard;
import React from "react";
import { useNavigate } from "react-router-dom"
import styles from "./Main.module.css";

export default function Main() {
  const text = 'NYCUEE LAB';
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate('/topicpage');
  };

  return (
    <div className={styles.main}>
      <div className={styles.content}>
        <h1 className={styles.title}>
          {text}
        </h1>
        
        <button className={styles.mainButton} onClick={handleClick}>進入網站</button>
      </div>
    </div>
  );
}
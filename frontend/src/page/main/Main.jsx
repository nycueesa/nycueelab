import React from "react";
import styles from "./Main.module.css";

export default function Main() {
  const text = 'NYCUEE LAB';
 
  return (
    <div className={styles.main}>
      <div className={styles.content}>
        <h1 className={styles.title}>
          {text}
        </h1>
        
        <p className={styles.subtitle}>選擇瀏覽方式</p>
        
        <div className={styles.divider}></div>
        
        <div className={styles.buttonGroup}>
          <button className={styles.navButton}>系所</button>
          <button className={styles.navButton}>領域</button>
          <button className={styles.navButton}>清單</button>
        </div>
      </div>
    </div>
  );
}
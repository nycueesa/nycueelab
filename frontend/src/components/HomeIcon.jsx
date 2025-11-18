import React from 'react';
import styles from './HomeIcon.module.css';
import homeBase from '@/assets/home.svg';
import homeDoor from '@/assets/home_1.svg';

/**
 * HomeIcon 組件
 * 將 home.svg (房子外框) 和 home_1.svg (門) 組合
 * home_1.svg 會居中置底放在 home.svg 上面
 */
export default function HomeIcon({ 
  width = 28, 
  height = 28, 
  className = '',
  ...props 
}) {
  return (
    <div 
      className={`${styles.homeIconWrapper} ${className}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
      {...props}
    >
      {/* 房子外框 */}
      <img 
        src={homeBase} 
        alt="home base"
        className={styles.homeBase}
      />
      {/* 房子門 - 居中置底 */}
      <img 
        src={homeDoor} 
        alt="home door"
        className={styles.homeDoor}
      />
    </div>
  );
}

import React from "react";
import styles from "./Main.module.css";

export default function Main() {
  // ============================================
  // CUSTOMIZE YOUR TEXT STYLE HERE
  // ============================================
  
  const text = 'NYCUEE LAB';
  const fontSize = '10vw';
  const fontWeight = '800';
  const letterSpacing = '0.5vw';
  const fontFamily = "Arial Black, sans-serif";
  
  // Text gradient colors
  const textGradientStart = '#90c6ecff';  // Light blue
  const textGradientEnd = '#FFFFFF';    // White
  
  // Background color
  const bgColor = '#034b77ff';
  
  // ============================================
  
  // Pass customizable values as CSS variables
  const customStyles = {
    '--bg-color': bgColor,
    '--font-size': fontSize,
    '--font-weight': fontWeight,
    '--letter-spacing': letterSpacing,
    '--font-family': fontFamily,
    '--gradient-start': textGradientStart,
    '--gradient-end': textGradientEnd,
  };
 
  return (
    <div className={styles.main} style={customStyles}>
      <h1 className={styles.title}>
        {text}
      </h1>
    </div>
  );
}
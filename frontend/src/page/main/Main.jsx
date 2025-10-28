import React from "react";
import styles from "./Main.module.css";

export default function Main() {
  // ============================================
  // CUSTOMIZE YOUR TEXT STYLE HERE
  // ============================================
  
  const text = 'NYCUEE LAB';
  const fontSize = '10vw';
  const fontWeight = '900';
  const letterSpacing = '0.5vw';
  const textColor = '#B8D4E8';
  const fontFamily = 'Arial, sans-serif';
  
  
  // Background gradient colors
  const bgColorTop = '#034b77ff';
  const bgColorBottom = '#034b77ff';
  
  // ============================================
  
  const gradientStyle = {
    background: `linear-gradient(to bottom, ${bgColorTop}, ${bgColorBottom})`,
  };
  
  const textStyle = {
    fontSize: fontSize,
    fontWeight: fontWeight,
    letterSpacing: letterSpacing,
    color: textColor,
    fontFamily: fontFamily,
    lineHeight: '1.2',
  };

  return (
    <div 
      className="flex items-center justify-center"
      style={gradientStyle}
    >
      <h1 
        className="text-center px-8"
        style={textStyle}
      >
        {text}
      </h1>
    </div>
  );
}

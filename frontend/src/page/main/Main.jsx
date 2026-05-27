import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Main.module.css";

export default function Main() {
  const navigate = useNavigate();
  const handleClick = () => navigate("/topicpage");

  // Paint <html> blue while Main is mounted so iOS rubber-band overscroll
  // shows the page colour rather than the default white. Restored on unmount.
  useEffect(() => {
    const prev = document.documentElement.style.backgroundColor;
    document.documentElement.style.backgroundColor = "#034b77";
    return () => {
      document.documentElement.style.backgroundColor = prev;
    };
  }, []);

  return (
    <div className={styles.main}>
      <header className={styles.topRow}>
        <div>
          <strong>NYCU · EE</strong>
          <span>National Yang Ming Chiao Tung University</span>
        </div>
        <div className={styles.topRight}>
          Spring 2026
          <br />
          Hsinchu · Taiwan
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.eyebrow}>
          <span className={styles.block} aria-hidden="true" />
          <span className={styles.eyebrowText}>NYCUEE LAB</span>
        </div>
        <h1 className={styles.title}>
          交大電機
          <br />
          專題網<span className={styles.dot}>.</span>
        </h1>
      </section>

      <footer className={styles.bottomRow}>
        <button className={styles.mainButton} onClick={handleClick}>
          <span>進入網站</span>
          <span className={styles.arrow} aria-hidden="true">→</span>
        </button>
        <div className={styles.bottomRight}>
          A project by EESA
        </div>
      </footer>
    </div>
  );
}

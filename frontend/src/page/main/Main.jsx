import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Main.module.css";

export default function Main() {
  const navigate = useNavigate();
  const handleClick = () => navigate("/topicpage");

  // Paint <html> and <body> blue while Main is mounted so iOS rubber-band
  // overscroll shows the page colour rather than the default white.
  // WebKit propagates body's bg to the canvas when set, so we paint both.
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.backgroundColor;
    const prevBody = body.style.backgroundColor;
    html.style.backgroundColor = "#034b77";
    body.style.backgroundColor = "#034b77";
    return () => {
      html.style.backgroundColor = prevHtml;
      body.style.backgroundColor = prevBody;
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

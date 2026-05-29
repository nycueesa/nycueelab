import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Feedback.module.css";

const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSf8JLAoSyK3jdLWkc0tSfUCqny-hQ1q-Vhl8XbKH5RRr-Bsdw/viewform?usp=dialog";

export default function Feedback() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>意見回饋</h1>
      <p className={styles.desc}>
        歡迎留下您對本網站的建議、勘誤或想看到的功能。
      </p>
      <a
        href={FORM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.button}
      >
        前往 Google 表單 →
      </a>
      <div className={styles.backRow}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className={styles.backBtn}
        >
          ← 返回
        </button>
      </div>
    </div>
  );
}

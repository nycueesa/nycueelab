import React from "react";
import styles from "./Professor.module.css";

function Professor() {
  // This would typically come from props or API
  const professorData = {
    name: "Prof. 劉建男",
    labName: "Mixed-Signal Electronic Design Automation Lab",
    department: "EDA 電子所乙B組",
    email: "jimmyliu@nycu.edu.tw",
    photo: "/placeholder-professor.jpg", // Replace with actual image path
    research: {
      mainTopic: "AI for EDA Algorithms",
      subTopic: "DNN-Assisted Analog Circuit Sizing : 透過AI輔助類比電路sizing"
    },
    courses: [
      { category: "軟體課程", name: "資料結構" },
      { category: "軟體課程", name: "演算法" },
      { category: "硬體課程", name: "VLSI" }
    ],
    faqs: [
      "教授會指定研究主題嗎? 或者是可以讓專題生自行指定?",
      "教授會指定研究主題嗎? 或者是可以讓專題生自行指定?",
      "教授會指定研究主題嗎? 或者是可以讓專題生自行指定?"
    ]
  };

  return (
    <div className={styles.professorPage}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroLeft}>
            <h1 className={styles.labName}>{professorData.labName}</h1>
            <p className={styles.department}>{professorData.department}</p>
            <button className={styles.moreButton}>more about</button>
            <p className={styles.contactInfo}>
              Contact Info: {professorData.email}
            </p>
          </div>
          <div className={styles.heroRight}>
            <div className={styles.professorPhotoContainer}>
              <img
                src={professorData.photo}
                alt={professorData.name}
                className={styles.professorPhoto}
              />
              <div className={styles.professorName}>{professorData.name}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Research Section */}
      <section className={styles.researchSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>研究領域</h2>
          <p className={styles.sectionSubtitle}>What we do</p>
        </div>
        <div className={styles.researchContent}>
          <h3 className={styles.researchMainTopic}>{professorData.research.mainTopic}</h3>
          <p className={styles.researchSubTopic}>{professorData.research.subTopic}</p>
        </div>
      </section>

      {/* Course Requirements Section */}
      <section className={styles.courseSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>修課建議與成績要求</h2>
          <p className={styles.sectionSubtitle}>Course Suggestions and Grading Policy</p>
        </div>
        <div className={styles.courseCards}>
          {professorData.courses.map((course, index) => (
            <div key={index} className={styles.courseCard}>
              <div className={styles.courseCategory}>{course.category}</div>
              <div className={styles.courseName}>{course.name}</div>
            </div>
          ))}
        </div>
        <div className={styles.curveBottom}></div>
      </section>

      {/* Q&A Section */}
      <section className={styles.qaSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>同學提問 Q&A</h2>
        </div>
        <div className={styles.qaContent}>
          {professorData.faqs.map((faq, index) => (
            <div key={index} className={styles.qaItem}>
              <span className={styles.searchIcon}>🔍</span>
              <span className={styles.qaText}>{faq}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Media Section */}
      <section className={styles.mediaSection}>
        <div className={styles.curveTop}></div>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>投影片與影片</h2>
          <p className={styles.sectionSubtitle}>ppt and video</p>
        </div>
        <div className={styles.mediaContent}>
          <div className={styles.mediaPlaceholder}>
            {/* Media content will go here */}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Professor;
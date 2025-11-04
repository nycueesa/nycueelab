import { useEffect } from "react";
import { animate, onScroll } from 'animejs';
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

  useEffect(() => {
    // ============================================
    // GLOBAL ANIMATION CONFIGURATION
    // ============================================
    const ANIMATION_CONFIG = {
      // Scroll-synced animation positions
      // Values represent where the TARGET ELEMENT is relative to viewport:
      // Values > 1.0 = element is below viewport (not yet visible)
      // 1.0 = element's TOP edge is at viewport BOTTOM (just entering screen)
      // 0.5 = element at middle of viewport
      // 0.0 = element's TOP edge is at viewport TOP
      scroll: {
        enterStart: 1.15,    // When element TOP is at 115% (below screen), START animation (0%)
        enterEnd: 1.0,       // When element TOP reaches viewport BOTTOM (entering screen), FINISH animation (100%)
        debug: false         // Set to true to see animation zones
      },

      // Animation durations (in milliseconds)
      duration: {
        hero: 1500,           // Hero section initial animations
        research: 600,        // Research section
        courseTimeline: 800,  // Course cards total timeline
        courseCard: 350,      // Individual course card
        qaItem: 600,          // Individual Q&A item
        media: 600            // Media section
      },

      // Animation delays and offsets
      timing: {
        heroPhotoDelay: 200,  // Delay for hero photo after text
        courseStagger: 150,   // Time between course card animations
        qaStagger: 20         // Offset between Q&A items
      },

      // Movement distances
      movement: {
        translateY: 80,       // Vertical slide distance
        translateX: 150,      // Horizontal slide distance
        scaleFrom: 0.9,       // Starting scale
        scaleTo: 1,           // Ending scale
        heroScaleFrom: 0.7,   // Hero photo starting scale
        heroRotate: -5        // Hero photo rotation degrees
      },

      // Easing functions
      easing: {
        standard: 'outQuad',              // Standard easing
        hero: 'outQuint',                 // Hero text easing
        heroPhoto: 'outElastic(1, 0.8)'   // Hero photo easing (bouncy)
      }
    };
    // ============================================

    // Hero section - animate immediately on load (no scroll trigger)
    animate(`.${styles.heroLeft}`, {
      opacity: [0, 1],
      translateY: [ANIMATION_CONFIG.movement.translateY, 0],
      duration: ANIMATION_CONFIG.duration.hero,
      easing: ANIMATION_CONFIG.easing.hero
    });

    animate(`.${styles.professorPhotoContainer}`, {
      opacity: [0, 1],
      scale: [ANIMATION_CONFIG.movement.heroScaleFrom, ANIMATION_CONFIG.movement.scaleTo],
      rotate: [ANIMATION_CONFIG.movement.heroRotate, 0],
      duration: ANIMATION_CONFIG.duration.hero,
      delay: ANIMATION_CONFIG.timing.heroPhotoDelay,
      easing: ANIMATION_CONFIG.easing.heroPhoto
    });

    // Research section - scroll-synced animation
    // Note: When sync:true, animation speed is controlled by scroll distance (enterStart to enterEnd)
    // Duration parameter is ignored in sync mode
    animate(`.${styles.researchContent}`, {
      opacity: [0, 1],
      translateX: [-ANIMATION_CONFIG.movement.translateX, 0],
      easing: 'linear',  // Linear easing for smooth scroll-sync
      autoplay: onScroll({
        target: `.${styles.researchSection}`,
        debug: ANIMATION_CONFIG.scroll.debug,
        sync: true,
        axis: 'y',
        enter: [ANIMATION_CONFIG.scroll.enterStart, ANIMATION_CONFIG.scroll.enterEnd]
      })
    });

    // Course cards - scroll-synced staggered timeline
    const courseCards = Array.from(document.querySelectorAll(`.${styles.courseCard}`));

    if (courseCards.length > 0) {
      courseCards.forEach((card, index) => {
        animate(card, {
          opacity: [0, 1],
          translateY: [ANIMATION_CONFIG.movement.translateY, 0],
          scale: [ANIMATION_CONFIG.movement.scaleFrom, ANIMATION_CONFIG.movement.scaleTo],
          easing: 'linear',
          autoplay: onScroll({
            target: `.${styles.courseSection}`,
            debug: ANIMATION_CONFIG.scroll.debug,
            sync: true,
            axis: 'y',
            enter: [
              ANIMATION_CONFIG.scroll.enterStart + (index * 0.05),  // Stagger start
              ANIMATION_CONFIG.scroll.enterEnd + (index * 0.05)      // Stagger end
            ]
          })
        });
      });
    }

    // Q&A items - scroll-synced individual animations
    const qaItems = Array.from(document.querySelectorAll(`.${styles.qaItem}`));

    qaItems.forEach((item, index) => {
      animate(item, {
        opacity: [0, 1],
        translateX: [-ANIMATION_CONFIG.movement.translateY, 0],
        easing: 'linear',
        autoplay: onScroll({
          target: `.${styles.qaSection}`,
          debug: ANIMATION_CONFIG.scroll.debug,
          sync: true,
          axis: 'y',
          enter: [
            ANIMATION_CONFIG.scroll.enterStart + (index * 0.03),  // Stagger start
            ANIMATION_CONFIG.scroll.enterEnd + (index * 0.03)      // Stagger end
          ]
        })
      });
    });

    // Media section - scroll-synced animation
    animate(`.${styles.mediaPlaceholder}`, {
      opacity: [0, 1],
      scale: [ANIMATION_CONFIG.movement.scaleFrom, ANIMATION_CONFIG.movement.scaleTo],
      rotate: [-2, 0],
      easing: 'linear',
      autoplay: onScroll({
        target: `.${styles.mediaSection}`,
        debug: ANIMATION_CONFIG.scroll.debug,
        sync: true,
        axis: 'y',
        enter: [ANIMATION_CONFIG.scroll.enterStart, ANIMATION_CONFIG.scroll.enterEnd]
      })
    });

  }, []);

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
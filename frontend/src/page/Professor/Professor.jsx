import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import styles from "./Professor.module.css";
import allData from "../../assets/allData.json";

// Function to find professor by ID
const findProfessorById = (id) => {
  return allData.professors.find(p => String(p.id) === String(id)) || null;
};

function Professor() {
  // Get professor ID from URL parameter
  const { profId } = useParams();
  const [searchParams] = useSearchParams();
  const id = profId || searchParams.get('id');

  // Animation state for each section
  const [heroVisible, setHeroVisible] = useState(false);
  const [researchVisible, setResearchVisible] = useState(false);
  const [courseCardsVisible, setCourseCardsVisible] = useState([]);
  const [qaItemsVisible, setQaItemsVisible] = useState([]);
  const [mediaVisible, setMediaVisible] = useState(false);

  // Refs to track elements
  const researchRef = useRef(null);
  const courseRef = useRef(null);
  const qaRef = useRef(null);
  const mediaRef = useRef(null);
  const courseCardRefs = useRef([]);
  const qaItemRefs = useRef([]);

  // Load professor data based on ID
  const professorDataFromJson = id ? findProfessorById(id) : null;

  // Default data for demo/fallback
  const defaultData = {
    name: "Prof. 劉建男",
    labName: "Mixed-Signal Electronic Design Automation Lab",
    department: "EDA 電子所乙B組",
    email: "jimmyliu@nycu.edu.tw",
    photo: "/placeholder-professor.jpg",
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

  // Use loaded data or fallback to default
  const professorData = professorDataFromJson ? {
    name: professorDataFromJson.name,
    labName: professorDataFromJson.labName,
    department: professorDataFromJson.department,
    email: professorDataFromJson.email,
    photo: professorDataFromJson.photo || professorDataFromJson.image || "/placeholder-professor.jpg",
    research: professorDataFromJson.research || { mainTopic: "", subTopic: "" },
    courses: professorDataFromJson.courses || [],
    faqs: professorDataFromJson.faqs || []
  } : defaultData;

  // If ID provided but professor not found, show error
  if (id && !professorDataFromJson) {
    return (
      <div className={styles.professorPage}>
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <div className={styles.heroLeft}>
              <h1 className={styles.labName}>找不到教授資料</h1>
              <p className={styles.department}>找不到 ID 為 "{id}" 的教授資料。</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Trigger hero animation on mount
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      setHeroVisible(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Intersection Observer for detecting when elements enter/exit viewport
  useEffect(() => {
    const observerOptions = {
      root: null, // viewport
      rootMargin: '0px 0px -100px 0px', // Trigger 100px before element enters viewport
      threshold: 0.1 // Trigger when 10% of element is visible
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        // Research section
        if (entry.target === researchRef.current) {
          setResearchVisible(entry.isIntersecting);
        }
        // Media section
        else if (entry.target === mediaRef.current) {
          setMediaVisible(entry.isIntersecting);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe sections
    if (researchRef.current) observer.observe(researchRef.current);
    if (mediaRef.current) observer.observe(mediaRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Separate observer for course cards with stagger
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.1
    };

    const timeouts = {};

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        const index = courseCardRefs.current.indexOf(entry.target);
        if (index !== -1) {
          if (entry.isIntersecting) {
            // Clear any existing timeout for this card
            if (timeouts[index]) {
              clearTimeout(timeouts[index]);
            }
            // Stagger the animation by index when entering
            timeouts[index] = setTimeout(() => {
              setCourseCardsVisible(prev => {
                if (!prev.includes(index)) {
                  return [...prev, index];
                }
                return prev;
              });
            }, index * 150); // 150ms delay between each card
          } else {
            // Remove immediately when leaving viewport
            if (timeouts[index]) {
              clearTimeout(timeouts[index]);
            }
            setCourseCardsVisible(prev => prev.filter(i => i !== index));
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe each course card
    courseCardRefs.current.forEach(card => {
      if (card) observer.observe(card);
    });

    return () => {
      // Clear all timeouts on cleanup
      Object.values(timeouts).forEach(timeout => clearTimeout(timeout));
      observer.disconnect();
    };
  }, [professorData.courses.length]);

  // Separate observer for Q&A items with stagger
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.1
    };

    const timeouts = {};

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        const index = qaItemRefs.current.indexOf(entry.target);
        if (index !== -1) {
          if (entry.isIntersecting) {
            // Clear any existing timeout for this item
            if (timeouts[index]) {
              clearTimeout(timeouts[index]);
            }
            // Stagger the animation by index when entering
            timeouts[index] = setTimeout(() => {
              setQaItemsVisible(prev => {
                if (!prev.includes(index)) {
                  return [...prev, index];
                }
                return prev;
              });
            }, index * 100); // 100ms delay between each item
          } else {
            // Remove immediately when leaving viewport
            if (timeouts[index]) {
              clearTimeout(timeouts[index]);
            }
            setQaItemsVisible(prev => prev.filter(i => i !== index));
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe each Q&A item
    qaItemRefs.current.forEach(item => {
      if (item) observer.observe(item);
    });

    return () => {
      // Clear all timeouts on cleanup
      Object.values(timeouts).forEach(timeout => clearTimeout(timeout));
      observer.disconnect();
    };
  }, [professorData.faqs.length]);


  return (
    <div className={styles.professorPage}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div
            className={`${styles.heroLeft} ${heroVisible ? styles.heroLeftVisible : ''}`}
          >
            <h1 className={styles.labName}>{professorData.labName}</h1>
            <p className={styles.department}>{professorData.department}</p>
            <button className={styles.moreButton}>more about</button>
            <p className={styles.contactInfo}>
              Contact Info: {professorData.email}
            </p>
          </div>
          <div className={styles.heroRight}>
            <div
              className={`${styles.professorPhotoContainer} ${heroVisible ? styles.professorPhotoVisible : ''}`}
            >
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
      <section className={styles.researchSection} ref={researchRef}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>研究領域</h2>
          <p className={styles.sectionSubtitle}>What we do</p>
        </div>
        <div
          className={`${styles.researchContent} ${researchVisible ? styles.researchContentVisible : ''}`}
        >
          <h3 className={styles.researchMainTopic}>{professorData.research.mainTopic}</h3>
          <p className={styles.researchSubTopic}>{professorData.research.subTopic}</p>
        </div>
      </section>

      {/* Course Requirements Section */}
      <section className={styles.courseSection} ref={courseRef}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>修課建議與成績要求</h2>
          <p className={styles.sectionSubtitle}>Course Suggestions and Grading Policy</p>
        </div>
        <div className={styles.courseCards}>
          {professorData.courses.map((course, index) => (
            <div
              key={index}
              ref={el => courseCardRefs.current[index] = el}
              className={`${styles.courseCard} ${courseCardsVisible.includes(index) ? styles.courseCardVisible : ''}`}
            >
              <div className={styles.courseCategory}>{course.category}</div>
              <div className={styles.courseName}>{course.name}</div>
            </div>
          ))}
        </div>
        <div className={styles.curveBottom}></div>
      </section>

      {/* Q&A Section */}
      <section className={styles.qaSection} ref={qaRef}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>同學提問 Q&A</h2>
        </div>
        <div className={styles.qaContent}>
          {professorData.faqs.map((faq, index) => (
            <div
              key={index}
              ref={el => qaItemRefs.current[index] = el}
              className={`${styles.qaItem} ${qaItemsVisible.includes(index) ? styles.qaItemVisible : ''}`}
            >
              <span className={styles.searchIcon}>🔍</span>
              <span className={styles.qaText}>{faq}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Media Section */}
      <section className={styles.mediaSection} ref={mediaRef}>
        <div className={styles.curveTop}></div>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>投影片與影片</h2>
          <p className={styles.sectionSubtitle}>ppt and video</p>
        </div>
        <div className={styles.mediaContent}>
          <div
            className={`${styles.mediaPlaceholder} ${mediaVisible ? styles.mediaPlaceholderVisible : ''}`}
          >
            {/* Media content will go here */}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Professor;

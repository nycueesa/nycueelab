import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import styles from "./Professor.module.css";

// API base URL - you can move this to a config file later
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function Professor() {
  // Get professor ID from URL parameter
  const { profId } = useParams();
  const [searchParams] = useSearchParams();
  const id = profId || searchParams.get('id');

  // State for professor data and loading/error states
  const [professorDataFromApi, setProfessorDataFromApi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Animation state for each section
  const [heroVisible, setHeroVisible] = useState(false);
  const [researchVisible, setResearchVisible] = useState(false);
  const [courseCardsVisible, setCourseCardsVisible] = useState([]);
  const [qaItemsVisible, setQaItemsVisible] = useState([]);
  const [linksVisible, setLinksVisible] = useState(false);

  // Refs to track elements
  const researchRef = useRef(null);
  const courseRef = useRef(null);
  const qaRef = useRef(null);
  const linksRef = useRef(null);
  const courseCardRefs = useRef([]);
  const qaItemRefs = useRef([]);

  // Fetch professor data from API when component mounts or id changes
  useEffect(() => {
    const fetchProfessorData = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/api/professors/id=${id}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Fetched professor data:', data);
        console.log('Research data:', data.research);
        setProfessorDataFromApi(data);
      } catch (err) {
        console.error("Error fetching professor data:", err);
        setError(err.message || "無法載入教授資料");
      } finally {
        setLoading(false);
      }
    };

    fetchProfessorData();
  }, [id]);

  // Default data for demo/fallback (matching NewData.json structure)
  const defaultData = {
    name: "Prof. 範例教授",
    LabName: "範例實驗室",
    department: ["電子所"],
    OfficeLocation: "ED123",
    email: "professor@nycu.edu.tw",
    photo: null,
    LabWebsite: "",
    research: [
      {
        title: "範例研究領域",
        subtitle: ["研究項目一", "研究項目二"]
      }
    ],
    RecomendedCourses: ["基礎課程"],
    faqs: [
      {
        Question: "這是範例問題?",
        Answer: "這是範例答案。"
      }
    ],
    link: []
  };

  // Trigger hero animation on mount
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      setHeroVisible(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Fallback: Show research section after delay if observer doesn't trigger
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (!researchVisible) {
        console.log('Fallback: Forcing research section to be visible');
        setResearchVisible(true);
      }
    }, 1000);
    return () => clearTimeout(fallbackTimer);
  }, [researchVisible]);

  // Fallback: Show links section after delay if observer doesn't trigger
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (!linksVisible) {
        console.log('Fallback: Forcing links section to be visible');
        setLinksVisible(true);
      }
    }, 2000);
    return () => clearTimeout(fallbackTimer);
  }, [linksVisible]);

  // Intersection Observer for detecting when elements enter/exit viewport
  useEffect(() => {
    const observerOptions = {
      root: null, // viewport
      rootMargin: '0px', // Trigger when element enters viewport
      threshold: 0.05 // Trigger when 5% of element is visible
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        // Research section
        if (entry.target === researchRef.current) {
          if (entry.isIntersecting) {
            setResearchVisible(true);
            console.log('Research section visible:', true);
          }
        }
        // Links section
        else if (entry.target === linksRef.current) {
          if (entry.isIntersecting) {
            setLinksVisible(true);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe sections
    if (researchRef.current) observer.observe(researchRef.current);
    if (linksRef.current) observer.observe(linksRef.current);

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
  }, [professorDataFromApi?.RecomendedCourses?.length]);

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
  }, [professorDataFromApi?.faqs?.length]);

  // Use loaded data from API or fallback to default
  const professorData = professorDataFromApi ? {
    name: professorDataFromApi.name,
    labName: professorDataFromApi.LabName || professorDataFromApi.labName,
    department: Array.isArray(professorDataFromApi.department)
      ? professorDataFromApi.department.join(', ')
      : (professorDataFromApi.department || ""),
    officeLocation: professorDataFromApi.OfficeLocation,
    email: professorDataFromApi.email,
    photo: professorDataFromApi.photo || "/placeholder-professor.jpg",
    labWebsite: professorDataFromApi.LabWebsite || professorDataFromApi.website,
    research: professorDataFromApi.research || [],
    courses: professorDataFromApi.RecomendedCourses || professorDataFromApi.courses || [],
    faqs: professorDataFromApi.faqs || [],
    links: professorDataFromApi.link || []
  } : defaultData;

  // Show loading state
  if (loading) {
    return (
      <div className={styles.professorPage}>
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <div className={styles.heroLeft}>
              <h1 className={styles.labName}>載入中...</h1>
              <p className={styles.department}>正在載入教授資料</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={styles.professorPage}>
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <div className={styles.heroLeft}>
              <h1 className={styles.labName}>載入錯誤</h1>
              <p className={styles.department}>錯誤訊息: {error}</p>
              <p className={styles.department}>請確認後端伺服器是否正在運行</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // If ID provided but professor not found, show error
  if (id && !professorDataFromApi) {
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
            {professorData.officeLocation && (
              <p className={styles.officeLocation}>📍 辦公室: {professorData.officeLocation}</p>
            )}
            <p className={styles.contactInfo}>
              ✉️ {professorData.email}
            </p>
            {professorData.labWebsite && (
              <div className={styles.buttonWrapper}>
                <a
                  href={professorData.labWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.moreButton}
                >
                  more about lab →
                </a>
              </div>
            )}
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
          {professorData.research && professorData.research.length > 0 ? (
            professorData.research.map((topic, index) => (
              <div key={index} className={styles.researchTopic}>
                {topic.title && (
                  <h3 className={styles.researchMainTopic}>{topic.title}</h3>
                )}
                {topic.subtitle && Array.isArray(topic.subtitle) && topic.subtitle.length > 0 && (
                  <div className={styles.researchSubtopics}>
                    {topic.subtitle.map((sub, subIndex) => (
                      <p key={subIndex} className={styles.researchSubTopic}>{sub}</p>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className={styles.noResearch}>暫無研究領域資訊</p>
          )}
        </div>
      </section>

      {/* Course Requirements Section */}
      <section className={styles.courseSection} ref={courseRef}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>修課建議</h2>
          <p className={styles.sectionSubtitle}>Recommended Courses</p>
        </div>
        <div className={styles.courseCards}>
          {professorData.courses.map((course, index) => (
            <div
              key={index}
              ref={el => courseCardRefs.current[index] = el}
              className={`${styles.courseCard} ${courseCardsVisible.includes(index) ? styles.courseCardVisible : ''}`}
            >
              <div className={styles.courseName}>{course}</div>
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
              <div className={styles.qaQuestion}>
                <span className={styles.searchIcon}>🔍</span>
                <span className={styles.qaText}>{faq.Question || faq}</span>
              </div>
              {faq.Answer && (
                <div className={styles.qaAnswer}>
                  <span className={styles.answerIcon}>💡</span>
                  <span className={styles.answerText}>{faq.Answer}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Links Section (formerly Media Section) */}
      <section className={styles.linksSection} ref={linksRef}>
        <div className={styles.curveTop}></div>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>相關連結</h2>
          <p className={styles.sectionSubtitle}>Related Links</p>
        </div>
        <div className={styles.linksContent}>
          <div
            className={`${styles.linksContentWrapper} ${linksVisible ? styles.linksContentWrapperVisible : ''}`}
          >
            {professorData.links && professorData.links.length > 0 ? (
              professorData.links
                .filter(linkItem => linkItem.link)
                .map((linkItem, index) => (
                  <a
                    key={index}
                    href={linkItem.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.linkButton}
                  >
                    {linkItem.LinkName}
                  </a>
                ))
            ) : (
              <p className={styles.noLinksHint}>暫無相關連結</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Professor;

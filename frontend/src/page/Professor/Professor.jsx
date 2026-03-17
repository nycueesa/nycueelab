import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import styles from "./Professor.module.css";
import { API_BASE } from "../../hooks/useData";

/**
 * 將各種連結轉換為可嵌入的格式
 */
function getEmbedInfo(url) {
  if (!url) return null;

  // YouTube - 多種格式支援
  // https://youtu.be/VIDEO_ID
  // https://www.youtube.com/watch?v=VIDEO_ID
  // https://youtube.com/watch?v=VIDEO_ID
  const youtubeMatch = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/
  );
  if (youtubeMatch) {
    return {
      type: "youtube",
      embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}`,
      thumbnail: `https://img.youtube.com/vi/${youtubeMatch[1]}/hqdefault.jpg`,
    };
  }

  // Google Drive - 文件預覽
  // https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch) {
    return {
      type: "drive",
      embedUrl: `https://drive.google.com/file/d/${driveMatch[1]}/preview`,
      fileId: driveMatch[1],
    };
  }

  // 無法識別的連結
  return null;
}

function Professor() {
  // Get professor ID from URL parameter
  const { profId } = useParams();
  const [searchParams] = useSearchParams();
  const id = profId || searchParams.get("id");

  // State for professor data and loading/error states
  const [professorData, setProfessorData] = useState(null);
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

        const response = await fetch(`${API_BASE}/professors/id=${id}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setProfessorData(data);
      } catch (err) {
        console.error("Error fetching professor data:", err);
        setError(err.message || "無法載入教授資料");
      } finally {
        setLoading(false);
      }
    };

    fetchProfessorData();
  }, [id]);

  // Trigger hero animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setHeroVisible(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Fallback: Show research section after delay if observer doesn't trigger
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (!researchVisible) {
        setResearchVisible(true);
      }
    }, 1000);
    return () => clearTimeout(fallbackTimer);
  }, [researchVisible]);

  // Fallback: Show links section after delay if observer doesn't trigger
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (!linksVisible) {
        setLinksVisible(true);
      }
    }, 2000);
    return () => clearTimeout(fallbackTimer);
  }, [linksVisible]);

  // Intersection Observer for detecting when elements enter/exit viewport
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.05,
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.target === researchRef.current) {
          if (entry.isIntersecting) {
            setResearchVisible(true);
          }
        } else if (entry.target === linksRef.current) {
          if (entry.isIntersecting) {
            setLinksVisible(true);
          }
        }
      });
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions
    );

    if (researchRef.current) observer.observe(researchRef.current);
    if (linksRef.current) observer.observe(linksRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Fallback: Show course cards after delay if observer doesn't trigger
  useEffect(() => {
    const courses = professorData?.recomendedCourses || [];
    const fallbackTimer = setTimeout(() => {
      if (courses.length > 0 && courseCardsVisible.length === 0) {
        courses.forEach((_, index) => {
          setTimeout(() => {
            setCourseCardsVisible((prev) => {
              if (!prev.includes(index)) {
                return [...prev, index];
              }
              return prev;
            });
          }, index * 150);
        });
      }
    }, 1500);
    return () => clearTimeout(fallbackTimer);
  }, [professorData?.recomendedCourses, courseCardsVisible.length]);

  // Separate observer for course cards with stagger
  useEffect(() => {
    const courses = professorData?.recomendedCourses || [];
    if (courses.length === 0) {
      return;
    }

    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.05,
    };

    const timeouts = {};

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        const index = courseCardRefs.current.indexOf(entry.target);
        if (index !== -1) {
          if (entry.isIntersecting) {
            if (timeouts[index]) {
              clearTimeout(timeouts[index]);
            }
            timeouts[index] = setTimeout(() => {
              setCourseCardsVisible((prev) => {
                if (!prev.includes(index)) {
                  return [...prev, index];
                }
                return prev;
              });
            }, index * 150);
          } else {
            if (timeouts[index]) {
              clearTimeout(timeouts[index]);
            }
            setCourseCardsVisible((prev) => prev.filter((i) => i !== index));
          }
        }
      });
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions
    );

    courseCardRefs.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => {
      Object.values(timeouts).forEach((timeout) => clearTimeout(timeout));
      observer.disconnect();
    };
  }, [professorData?.recomendedCourses?.length]);

  // Separate observer for Q&A items with stagger
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px 0px -50px 0px",
      threshold: 0.1,
    };

    const timeouts = {};

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        const index = qaItemRefs.current.indexOf(entry.target);
        if (index !== -1) {
          if (entry.isIntersecting) {
            if (timeouts[index]) {
              clearTimeout(timeouts[index]);
            }
            timeouts[index] = setTimeout(() => {
              setQaItemsVisible((prev) => {
                if (!prev.includes(index)) {
                  return [...prev, index];
                }
                return prev;
              });
            }, index * 100);
          } else {
            if (timeouts[index]) {
              clearTimeout(timeouts[index]);
            }
            setQaItemsVisible((prev) => prev.filter((i) => i !== index));
          }
        }
      });
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions
    );

    qaItemRefs.current.forEach((item) => {
      if (item) observer.observe(item);
    });

    return () => {
      Object.values(timeouts).forEach((timeout) => clearTimeout(timeout));
      observer.disconnect();
    };
  }, [professorData?.faqs?.length]);

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
  if (id && !professorData) {
    return (
      <div className={styles.professorPage}>
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <div className={styles.heroLeft}>
              <h1 className={styles.labName}>找不到教授資料</h1>
              <p className={styles.department}>
                找不到 ID 為 "{id}" 的教授資料。
              </p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Extract data with proper field names from NewData.json
  const {
    name = "",
    labName = "",
    department = [],
    officeLocation = "",
    email = "",
    photo = null,
    LabWebsite = "",
    tags = [],
    research = [],
    recomendedCourses = [],
    faqs = [],
    link = [],
  } = professorData || {};

  // Format department array to string
  const departmentStr = Array.isArray(department)
    ? department.join(", ")
    : department;

  // Format tags for display (remove # if needed)
  const formattedTags = tags
    .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`))
    .filter((tag) => tag !== "#" && tag.trim() !== "");

  // Pre-filter data to handle empty strings
  const validCourses = recomendedCourses.filter(
    (course) => course && course.trim() !== ""
  );
  const validFaqs = faqs.filter(
    (faq) => faq.question && faq.question.trim() !== ""
  );
  const validResearch = research.filter(
    (r) => r.title && r.title.trim() !== ""
  );
  const validLinks = link.filter(
    (l) => l.link && l.link.trim() !== ""
  );

  return (
    <div className={styles.professorPage}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div
            className={`${styles.heroLeft} ${
              heroVisible ? styles.heroLeftVisible : ""
            }`}
          >
            <h1 className={styles.labName}>{labName || "實驗室名稱"}</h1>
            <p className={styles.department}>{departmentStr}</p>
            {officeLocation && (
              <p className={styles.officeLocation}>
                辦公室: {officeLocation}
              </p>
            )}
            {email && <p className={styles.contactInfo}>{email}</p>}
            {formattedTags.length > 0 && (
              <div className={styles.tagsContainer}>
                {formattedTags.map((tag, index) => (
                  <span key={index} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {LabWebsite && (
              <div className={styles.buttonWrapper}>
                <a
                  href={LabWebsite}
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
              className={`${styles.professorPhotoContainer} ${
                heroVisible ? styles.professorPhotoVisible : ""
              }`}
            >
              {photo ? (
                <img
                  src={photo}
                  alt={name}
                  className={styles.professorPhoto}
                />
              ) : (
                <div className={styles.professorPhotoPlaceholder}>
                  <span>{name?.replace("Prof. ", "").charAt(0) || "?"}</span>
                </div>
              )}
              <div className={styles.professorName}>{name}</div>
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
          className={`${styles.researchContent} ${
            researchVisible ? styles.researchContentVisible : ""
          }`}
        >
          {validResearch.length > 0 ? (
            validResearch.map((topic, index) => (
              <div key={index} className={styles.researchTopic}>
                <h3 className={styles.researchMainTopic}>{topic.title}</h3>
                {topic.subtitle &&
                  Array.isArray(topic.subtitle) &&
                  topic.subtitle.length > 0 && (
                    <div className={styles.researchSubtopics}>
                      {topic.subtitle
                        .filter((sub) => sub && sub.trim() !== "")
                        .map((sub, subIndex) => (
                          <p key={subIndex} className={styles.researchSubTopic}>
                            {sub}
                          </p>
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
          {validCourses.length > 0 ? (
            validCourses.map((course, index) => (
              <div
                key={index}
                ref={(el) => (courseCardRefs.current[index] = el)}
                className={`${styles.courseCard} ${
                  courseCardsVisible.includes(index)
                    ? styles.courseCardVisible
                    : ""
                }`}
              >
                <div className={styles.courseName}>{course}</div>
              </div>
            ))
          ) : (
            <p className={styles.noCoursesText}>暫無修課建議</p>
          )}
        </div>
        <div className={styles.curveBottom}></div>
      </section>

      {/* Q&A Section */}
      <section className={styles.qaSection} ref={qaRef}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>同學提問 Q&A</h2>
        </div>
        <div className={styles.qaContent}>
          {validFaqs.length > 0 ? (
            validFaqs.map((faq, index) => (
              <div
                key={index}
                ref={(el) => (qaItemRefs.current[index] = el)}
                className={`${styles.qaItem} ${
                  qaItemsVisible.includes(index) ? styles.qaItemVisible : ""
                }`}
              >
                <div className={styles.qaQuestion}>
                  <span className={styles.searchIcon}>Q</span>
                  <span className={styles.qaText}>{faq.question}</span>
                </div>
                {faq.answer && faq.answer.trim() !== "" && (
                  <div className={styles.qaAnswer}>
                    <span className={styles.answerIcon}>A</span>
                    <span className={styles.answerText}>{faq.answer}</span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className={styles.noQaText}>暫無 Q&A 資訊</p>
          )}
        </div>
      </section>

      {/* Links Section */}
      <section className={styles.linksSection} ref={linksRef}>
        <div className={styles.curveTop}></div>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>相關連結</h2>
          <p className={styles.sectionSubtitle}>Related Links</p>
        </div>
        <div className={styles.linksContent}>
          <div
            className={`${styles.linksContentWrapper} ${
              linksVisible ? styles.linksContentWrapperVisible : ""
            }`}
          >
            {validLinks.length > 0 ? (
              <div className={styles.embedGrid}>
                {validLinks.map((linkItem, index) => {
                  const embedInfo = getEmbedInfo(linkItem.link);
                  const linkName = linkItem.linkName || "連結";

                  return (
                    <div key={index} className={styles.embedCard}>
                      <h4 className={styles.embedTitle}>{linkName}</h4>
                      {embedInfo ? (
                        <div className={styles.embedContainer}>
                          <iframe
                            src={embedInfo.embedUrl}
                            title={linkName}
                            className={styles.embedIframe}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <a
                          href={linkItem.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.embedFallbackLink}
                        >
                          開啟連結 →
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
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

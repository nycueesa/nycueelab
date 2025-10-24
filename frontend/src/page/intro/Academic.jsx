import React, { useRef, useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import styles from "./Academic.module.css";

const sections = [
    { id: "overview", label: "學術部一覽表" },
    { id: "history", label: "歷史沿革" },
    { id: "structure", label: "組織架構" },
    { id: "leader", label: "部長介紹" },
    { id: "members", label: "成員簡介" },
    { id: "activities", label: "活動介紹" }
];

export default function Academic() {
    const sectionRefs = useRef(sections.map(() => React.createRef()));
    const [activeIdx, setActiveIdx] = useState(0);
    const [sidebarY, setSidebarY] = useState(0);
    const sidebarRef = useRef();

    // 選單反黑
    useEffect(() => {
        const handleScroll = () => {
            const offsets = sectionRefs.current.map(ref => ref.current.getBoundingClientRect().top);
            const idx = offsets.findIndex((top, i) =>
                top > 80 && (i === 0 || offsets[i - 1] <= 80)
            );
            setActiveIdx(idx === -1 ? offsets.length - 1 : idx);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // 選單延遲跟隨視窗
    useEffect(() => {
        let latestScrollY = window.scrollY;
        let currentY = sidebarY;
        let ticking = false;

        const animate = () => {
            // 視窗中間 - 選單高度一半
            const sidebarHeight = sidebarRef.current ? sidebarRef.current.offsetHeight : 0;
            const targetY = latestScrollY + window.innerHeight / 2 - sidebarHeight / 2;
            //currentY += (targetY - currentY) * 0.00001;
            setSidebarY(currentY);
            if (Math.abs(targetY - currentY) > 1) {
                requestAnimationFrame(animate);
            } else {
                //setSidebarY(targetY);
                ticking = false;
            }
        };

        const onScrollOrResize = () => {
            latestScrollY = window.scrollY;
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(animate);
            }
        };

        window.addEventListener("scroll", onScrollOrResize, { passive: true });
        window.addEventListener("resize", onScrollOrResize);
        return () => {
            window.removeEventListener("scroll", onScrollOrResize);
            window.removeEventListener("resize", onScrollOrResize);
        };
        // eslint-disable-next-line
    }, []);

    const scrollToSection = idx => {
        sectionRefs.current[idx].current.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <div className={styles.academicPage}>
            {/* Banner */}
            <div className={styles.banner}>
                <img src="/images/academic-banner.jpg" alt="Academic Banner" className={styles.bannerImage} />
            </div>
            <Container>
                <Row>
                    {/* 左側選單 */}
                    <Col md={3}>
                        <div
                            ref={sidebarRef}
                            className={styles.sidebar}
                            style={{ transform: `translateY(${sidebarY}px)` }}
                        >
                            <ul className={styles.menuList}>
                                {sections.map((sec, idx) => (
                                    <li
                                        key={sec.id}
                                        className={activeIdx === idx ? styles.active : ""}
                                        onClick={() => scrollToSection(idx)}
                                    >
                                        {sec.label}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </Col>
                    {/* 右側內容 */}
                    <Col md={9}>
                        {sections.map((sec, idx) => (
                            <section
                                key={sec.id}
                                id={sec.id}
                                ref={sectionRefs.current[idx]}
                                className={styles.section}
                            >
                                <h2>{sec.label}</h2>
                                <div style={{ minHeight: "200px" }}>
                                    {/* 這裡放各區塊內容 */}
                                    {sec.label}內容...
                                </div>
                            </section>
                        ))}
                    </Col>
                </Row>
            </Container>
        </div>
    );
}
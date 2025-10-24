import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import styles from "./EesaIntro.module.css";

export default function EesaIntro() {
    const navigate = useNavigate();
    const departments = [
        { 
            name: "學術部", 
            description: "負責學術活動規劃與推動，協助同學學習與成長。",
            image: "/images/dept-academic.jpg",
            link: "/intro/academic"
        },
        { 
            name: "活器部", 
            description: "主辦聯誼、娛樂等活動，促進同學間交流。",
            image: "/images/dept-social.jpg",
            link: "/intro/social"
        },
        { 
            name: "人力部", 
            description: "協助活動人力安排，負責志工招募與管理。",
            image: "/images/dept-human.jpg",
            link: "/intro/human"
        },
        { 
            name: "行銷部", 
            description: "負責宣傳、設計與社群經營，提升學會能見度。",
            image: "/images/dept-marketing.jpg",
            link: "/intro/marketing"
        }
    ];

    return (
        <div className={styles.eesaIntroPage}>
            {/* Hero Section */}
            <div className={styles.heroSection}>
                <Container>
                    <Row className="justify-content-center">
                        <Col lg={8} className="text-center">
                            <div className={styles.heroContent}>
                                <h1 className={styles.heroTitle}>EESA 系學會介紹</h1>
                                <p className={styles.heroSubtitle}>
                                    電機工程學系學會（EESA）致力於服務系上同學，舉辦各項活動並促進師生交流。
                                </p>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>

            <Container className={styles.mainContent}>
                {/* 學會簡介 */}
                <Row className="mb-5">
                    <Col>
                        <h2 className={styles.sectionTitle}>學會宗旨</h2>
                        <p className={styles.sectionSubtitle}>
                            學會組織包含會長與四大部門，分工合作推動各項事務。
                        </p>
                        <Card className={styles.infoCard}>
                            <Card.Body>
                                <p>
                                    EESA（電機工程學系學會）致力於服務系上同學，舉辦各項活動並促進師生交流。學會組織包含會長與四大部門，分工合作推動各項事務。
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* 會長介紹 */}
                <Row className="mb-5">
                    <Col md={6}>
                        <Card className={styles.presidentCard}>
                            <Card.Body>
                                <h2 className={styles.sectionTitle}>會長</h2>
                                <p>
                                    負責統籌學會運作、協調各部門並代表學會對外聯繫。
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* 部門介紹 */}
                <Row className="mb-5">
                    <Col>
                        <h2 className={styles.sectionTitle}>四大部門</h2>
                        <p className={styles.sectionSubtitle}>
                            學會下設四大部門，分工合作推動各項事務。
                        </p>
                    </Col>
                </Row>
                <Row className="g-4 mb-5">
                    {departments.map((dept, idx) => (
                        <Col lg={3} md={6} key={idx}>
                            <div
                                className={styles.departmentCardWrapper}
                                onClick={() => dept.link && navigate(dept.link)}
                                style={{ cursor: dept.link ? "pointer" : "default" }}
                            >
                                <Card className={styles.departmentCard}>
                                    <div className={styles.imageContainer}>
                                        <img src={dept.image} alt={dept.name} className={styles.departmentImage} />
                                        <div className={styles.hoverOverlay}>
                                            <span className={styles.hoverText}>了解更多</span>
                                        </div>
                                    </div>
                                    <Card.Body>
                                        <h3 className={styles.departmentName}>{dept.name}</h3>
                                        <p className={styles.departmentDescription}>{dept.description}</p>
                                    </Card.Body>
                                </Card>
                            </div>
                        </Col>
                    ))}
                </Row>

                {/* 聯絡資訊 */}
                <Row>
                    <Col>
                        <Card className={styles.infoCard}>
                            <Card.Body>
                                <h4 className={styles.infoTitle}>📞 聯絡資訊</h4>
                                <ul className={styles.infoList}>
                                    <li>電子信箱：eesa@nycu.edu.tw</li>
                                    <li>Facebook：NYCU電機系學會</li>
                                    <li>Instagram：@nycu_eesa</li>
                                    <li>辦公室：工程五館 222 室</li>
                                </ul>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}
import React from "react";
import { Container, Row, Col, Card, Badge } from "react-bootstrap";
import styles from "./EventIntro.module.css";

export default function EventIntro() {
    const events = [
        {
            title: "Event1",
            description: "Description1 - aaaaa.",
            date: "2025-12-15",
            status: "Active",
            category: "Academic"
        },
        {
            title: "Event2",
            description: "Description2 - aaaaaa.",
            date: "2025-12-20",
            status: "Upcoming",
            category: "Social"
        },
        {
            title: "Event3",
            description: "Description3 - aaaaaaa.",
            date: "2025-12-25",
            status: "Planning",
            category: "Competition"
        },
        {
            title: "Event4",
            description: "Description4 - i weak teach me how to code.",
            date: "2026-01-10",
            status: "Registration",
            category: "Workshop"
        }
    ];

    const categories = [
        { name: "Academic", icon: "🎓", description: "學術相關活動" },
        { name: "Social", icon: "🤝", description: "社交聯誼活動" },
        { name: "Competition", icon: "🏆", description: "競賽比賽活動" },
        { name: "Workshop", icon: "🔧", description: "實作工作坊" }
    ];

    return (
        <div className={styles.eventIntroPage}>
            <div className={styles.heroSection}>
                <Container>
                    <Row className="justify-content-center">
                        <Col lg={8} className="text-center">
                            <div className={styles.heroContent}>
                                <h1 className={styles.heroTitle}>活動簡介</h1>
                                <p className={styles.heroSubtitle}>
                                    電機工程學系學生會致力於舉辦多元化活動，促進學術交流與同學情誼
                                </p>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>

            <Container className={styles.mainContent}>
                <Row className="mb-5">
                    <Col>
                        <h2 className={styles.sectionTitle}>活動類別</h2>
                        <p className={styles.sectionSubtitle}>
                            我們提供多樣化的活動，滿足不同興趣與需求的同學
                        </p>
                    </Col>
                </Row>

                <Row className="g-4 mb-5">
                    {categories.map((category, index) => (
                        <Col lg={3} md={6} key={index}>
                            <Card className={styles.categoryCard}>
                                <Card.Body className={styles.categoryBody}>
                                    <div className={styles.categoryIcon}>{category.icon}</div>
                                    <h4 className={styles.categoryName}>{category.name}</h4>
                                    <p className={styles.categoryDescription}>{category.description}</p>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>

                <Row className="mb-5">
                    <Col>
                        <h2 className={styles.sectionTitle}>近期活動</h2>
                        <p className={styles.sectionSubtitle}>
                            即將舉辦或正在進行的活動資訊
                        </p>
                    </Col>
                </Row>

                <Row className="g-4 mb-5">
                    {events.map((event, index) => (
                        <Col lg={6} key={index}>
                            <Card className={styles.eventCard}>
                                <Card.Body className={styles.eventBody}>
                                    <div className={styles.eventHeader}>
                                        <h3 className={styles.eventTitle}>{event.title}</h3>
                                        <Badge
                                            bg={event.status === 'Active' ? 'success' :
                                                event.status === 'Upcoming' ? 'warning' :
                                                event.status === 'Planning' ? 'info' : 'primary'}
                                            className={styles.statusBadge}
                                        >
                                            {event.status}
                                        </Badge>
                                    </div>
                                    <div className={styles.eventMeta}>
                                        <span className={styles.eventCategory}>{event.category}</span>
                                        <span className={styles.eventDate}>📅 {event.date}</span>
                                    </div>
                                    <p className={styles.eventDescription}>{event.description}</p>
                                    <div className={styles.eventActions}>
                                        <button className={`btn btn-outline-primary ${styles.actionButton}`}>
                                            了解更多
                                        </button>
                                        <button className={`btn btn-primary ${styles.actionButton}`}>
                                            立即報名
                                        </button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>

                <Row>
                    <Col>
                        <Card className={styles.infoCard}>
                            <Card.Body>
                                <Row>
                                    <Col md={6}>
                                        <h4 className={styles.infoTitle}>📋 報名方式</h4>
                                        <ul className={styles.infoList}>
                                            <li>關注系學會官方公告</li>
                                            <li>透過線上報名系統註冊</li>
                                            <li>注意報名截止時間</li>
                                            <li>確認參加資格與條件</li>
                                        </ul>
                                    </Col>
                                    <Col md={6}>
                                        <h4 className={styles.infoTitle}>📞 聯絡資訊</h4>
                                        <ul className={styles.infoList}>
                                            <li>電子信箱：eesa@nycu.edu.tw</li>
                                            <li>Facebook：NYCU電機系學會</li>
                                            <li>Instagram：@nycu_eesa</li>
                                            <li>辦公室：工程五館 222 室</li>
                                        </ul>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}
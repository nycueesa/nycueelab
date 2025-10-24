import React from 'react'
import styles from './Timeline.module.css'

// 每筆月份資料同時帶有導覽用 id，讓左側區塊與右側目錄維持一對一對應。
const timelineData = [
  {
    id: '2024-09',
    year: '2024',
    monthLabel: '9 月',
    navLabel: '2024 年 9 月',
    events: [
      {
        title: '新生迎新週',
        period: '9 月上旬',
        location: '工程五館中庭',
        summary: '透過闖關和系友分享，幫助新生快速認識系學會與系上生活。',
        detail:
          '結合系友經驗、課程攻略與社團資訊的整日活動。今年新增 Mentor 配對與系館導覽路線，協助新生建立第一個學期的人脈與資源。',
        tags: ['新生專區', '迎新', '交流']
      }
    ]
  },
  {
    id: '2024-06',
    year: '2024',
    monthLabel: '6 月',
    navLabel: '2024 年 6 月',
    events: [
      {
        title: 'Maker 松：能源創新挑戰',
        period: '6 月中旬',
        location: '創能工坊',
        summary: '結合電力電子與物聯網的 24 小時黑客松，推動永續議題。',
        detail:
          '與系上研究中心合作，由業界導師帶領各組檢視專題提案，並加入 Pitch 訓練。評選焦點放在原型可行性與應用場域，優勝隊伍可獲得企業實習媒合。',
        tags: ['專題實作', '永續', '競賽']
      }
    ]
  },
  {
    id: '2023-12',
    year: '2023',
    monthLabel: '12 月',
    navLabel: '2023 年 12 月',
    events: [
      {
        title: '系學會成果展',
        period: '12 月下旬',
        location: '系館大廳',
        summary: '展示一年內完成的專案、服務與課外成果，並邀請系友回校交流。',
        detail:
          '詳盡記錄各部門的年度亮點，並開放每個攤位的互動體驗，如 AI 語音助理、智慧電網模擬等。本屆導入數位導覽 QR Code，讓參觀者在手機上收藏喜愛的作品。',
        tags: ['成果分享', '系友交流']
      }
    ]
  },
  {
    id: '2023-05',
    year: '2023',
    monthLabel: '5-6 月',
    navLabel: '2023 年 5-6 月',
    events: [
      {
        title: '考前充電讀書會',
        period: '5 月—6 月',
        location: '工程圖書館自習區',
        summary: '期中與期末前的晚間讀書會，由助教和高年級同學提供題目解析。',
        detail:
          '每週聚焦不同必修科目，搭配即時線上問答與重點講義釋出。2023 年加入線上直播同步支援通勤同學，廣受好評。',
        tags: ['學習支持', '考前衝刺']
      }
    ]
  },
  {
    id: '2022-11',
    year: '2022',
    monthLabel: '11 月',
    navLabel: '2022 年 11 月',
    events: [
      {
        title: '電資聯合博覽會',
        period: '11 月',
        location: '光復校區體育館',
        summary: '與資工系攜手舉辦的社團與專題成果博覽，吸引近千名參觀者。',
        detail:
          '規劃主題導覽區，例如智慧家庭、機器人、電力應用等，並安排企業攤位提供履歷健檢。展期間同步舉行微型論壇。',
        tags: ['跨系合作', '博覽會']
      }
    ]
  },
  {
    id: '2022-01',
    year: '2022',
    monthLabel: '1 月',
    navLabel: '2022 年 1 月',
    events: [
      {
        title: '寒訓工作坊：嵌入式系統入門',
        period: '1 月',
        location: '系計算機教室',
        summary: '三天密集課程，帶領同學從零開始完成 ESP32 感測器專案。',
        detail:
          '課程包含 C 語言快速回顧、電路板焊接練習與無線通訊實作。最後一天進行成果展演並頒發結業證書。',
        tags: ['寒假營隊', '嵌入式系統']
      }
    ]
  }
]

export default function Timeline() {
  return (
    <div className={styles.timelinePage}>
      <header className={styles.header}>
        <h1 className={styles.title}>活動時間軸</h1>
        <p className={styles.subtitle}>
          以月份整理系學會的亮點活動，快速掌握每一段時期在學習、競賽與交流上的重點安排。
        </p>
      </header>

      <div className={styles.timelineWrapper}>
        <div className={styles.timelineContent}>
          <span className={styles.timelineIcon} aria-hidden="true">⏱️</span>
          {timelineData.map(({ id, year, monthLabel, events }) => (
            <section key={id} id={id} className={styles.monthSection}>
              <div className={styles.monthMarker}>
                <span className={styles.monthYear}>{year}</span>
                <span className={styles.monthLabel}>{monthLabel}</span>
              </div>
              <div className={styles.eventList}>
                {events.map((event, index) => (
                  <article
                    key={`${id}-${event.title}-${index}`}
                    className={styles.eventCard}
                    tabIndex={0}
                    aria-label={`${year} ${monthLabel} ${event.title}`}
                  >
                    <div className={styles.eventOverview}>
                      <h3 className={styles.eventTitle}>{event.title}</h3>
                      <div className={styles.eventMeta}>
                        <span className={styles.metaItem}>📅 {event.period}</span>
                        {event.location ? (
                          <span className={styles.metaItem}>📍 {event.location}</span>
                        ) : null}
                      </div>
                      <p className={styles.eventSummary}>{event.summary}</p>
                      {event.tags?.length ? (
                        <ul className={styles.tagList}>
                          {event.tags.map(tag => (
                            <li key={tag} className={styles.tag}>
                              {tag}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                    <div className={styles.eventDetail}>
                      <p>{event.detail}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* 右側浮動導覽：提供快速跳轉至對應月份的錨點 */}
        <nav className={styles.timelineNav} aria-label="月份導覽">
          <h2 className={styles.navTitle}>月份導覽</h2>
          <ul className={styles.navList}>
            {timelineData.map(({ id, navLabel }) => (
              <li key={`${id}-nav`} className={styles.navItem}>
                <a className={styles.navLink} href={`#${id}`}>
                  <span>{navLabel}</span>
                  <span aria-hidden="true" className={styles.navIcon}>➜</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}

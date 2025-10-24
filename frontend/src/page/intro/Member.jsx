import React, { useState } from "react";
import styles from "./Member.module.css";
import members from "./Member.json";

export default function Member() {
  // 將成員依部門分類
  const departments = members.reduce((acc, member) => {
    if (!acc[member.department]) acc[member.department] = [];
    acc[member.department].push(member);
    return acc;
  }, {});

  const [openDept, setOpenDept] = useState("行政部");
  const [selectedMember, setSelectedMember] = useState(null);

  const toggleDepartment = (dept) => {
    setOpenDept((prev) => (prev === dept ? "" : dept));
  };

  const openModal = (member) => {
    setSelectedMember(member);
  };

  const closeModal = () => {
    setSelectedMember(null);
  };

  return (
    <div className={styles.memberPage}>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>成員介紹頁面</h1>

        {Object.keys(departments).map((dept) => (
          <div key={dept} className={styles.departmentSection}>
            <div
              className={styles.departmentTitle}
              onClick={() => toggleDepartment(dept)}
              style={{ cursor: "pointer", userSelect: "none" }}
            >
              {dept} {openDept === dept ? "▲" : "▼"}
            </div>

            <div
              className={`${styles.departmentMembers} ${
                openDept === dept ? styles.open : ""
              }`}
            >
              <div className={styles.membersGrid}>
                {departments[dept].map((member) => (
                  <div
                    key={member.id}
                    className={styles.memberCard}
                    onClick={() => openModal(member)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className={styles.memberImage}>
                      <img
                        src={member.image}
                        alt={member.name}
                        onError={(e) => {
                          e.target.src =
                            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik01MCA1OEM1Ni42MjU0IDU4IDYyIDUyLjYyNTQgNjIgNDZDNjIgMzkuMzc0NiA1Ni42MjU0IDM0IDUwIDM0QzQzLjM3NDYgMzQgMzggMzkuMzc0NiAzOCA0NkMzOCA1Mi42MjU0IDQzLjM3NDYgNTggNTAgNThaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0yOCA3MkMyOCA2NS4zNzI2IDMzLjM3MjYgNjAgNDAgNjBINjBDNjYuNjI3NCA2MCA3MiA2NS4zNzI2IDcyIDcyVjc0SDI4VjcyWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K";
                        }}
                      />
                    </div>
                    <div className={styles.memberInfo}>
                      <h3 className={styles.memberName}>{member.name}</h3>
                      <p className={styles.memberPosition}>{member.position}</p>
                      <p className={styles.memberEmail}>
                        <span className={styles.label}>Email:</span>{" "}
                        {member.email}
                      </p>
                      <p className={styles.memberResearch}>
                        <span className={styles.label}>研究領域:</span>{" "}
                        {member.research}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Modal 視窗 */}
        {selectedMember && (
          <div className={styles.modalOverlay} onClick={closeModal}>
            <div
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <button className={styles.closeButton} onClick={closeModal}>
                ✕
              </button>
              <img
                src={selectedMember.image}
                alt={selectedMember.name}
                className={styles.modalImage}
                onError={(e) => {
                  e.target.src =
                    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik01MCA1OEM1Ni42MjU0IDU4IDYyIDUyLjYyNTQgNjIgNDZDNjIgMzkuMzc0NiA1Ni42MjU0IDM0IDUwIDM0QzQzLjM3NDYgMzQgMzggMzkuMzc0NiAzOCA0NkMzOCA1Mi42MjU0IDQzLjM3NDYgNTggNTAgNThaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0yOCA3MkMyOCA2NS4zNzI2IDMzLjM3MjYgNjAgNDAgNjBINjBDNjYuNjI3NCA2MCA3MiA2NS4zNzI2IDcyIDcyVjc0SDI4VjcyWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K";
                }}
              />
              <h2>{selectedMember.name}</h2>
              <p className={styles.modalPosition}>{selectedMember.position}</p>
              <p>
                <strong>Email:</strong> {selectedMember.email}
              </p>
              <p>
                <strong>研究領域:</strong> {selectedMember.research}
              </p>
              {selectedMember.description && (
                <p className={styles.modalDescription}>
                  {selectedMember.description}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

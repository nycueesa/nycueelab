import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./TopicPage.module.css";
import { useData } from "../../hooks/useData.js";

// Strip leading "#" and surrounding whitespace from a tag string.
const cleanTag = (t) => (typeof t === "string" ? t.replace(/^#+/, "").trim() : "");

// ────────────────────────────────────────────────────────────────────
function Pill({ children, on, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${styles.pill} ${on ? styles.pillOn : ""}`}
    >
      {children}
    </button>
  );
}

function ActiveChip({ children, onClear }) {
  return (
    <span className={styles.chip}>
      {children}
      <button type="button" onClick={onClear} className={styles.chipX} aria-label="remove">
        ×
      </button>
    </span>
  );
}

function ProfCard({ prof, onPick }) {
  return (
    <button
      type="button"
      onClick={() => onPick(prof)}
      className={styles.card}
    >
      <div className={styles.cardDept}>{prof.department.join(" · ")}</div>
      <div className={styles.cardName}>{prof.name}</div>
      <div className={styles.cardLab}>{prof.labName}</div>
      <div className={styles.cardTags}>
        {prof.cleanTags.map((t) => (
          <span key={t} className={styles.tag}>{t}</span>
        ))}
      </div>
    </button>
  );
}

// ────────────────────────────────────────────────────────────────────
export default function TopicPage() {
  const navigate = useNavigate();
  const { data, loading, error } = useData();
  const [dept, setDept] = useState(null);
  const [fields, setFields] = useState(new Set());
  const [query, setQuery] = useState("");

  // Normalize professors once: pre-clean tags and ensure department is an array.
  // Drop placeholder/empty entries (id 0 in the JSON template).
  const professors = useMemo(() => {
    const raw = data?.professors ?? [];
    return raw
      .filter((p) => p && p.name && p.name.trim() !== "" && p.name.trim() !== "Prof.")
      .map((p) => ({
        ...p,
        department: Array.isArray(p.department)
          ? p.department.filter((d) => d && d.trim() !== "")
          : p.department
          ? [p.department]
          : [],
        cleanTags: (p.tags ?? []).map(cleanTag).filter((t) => t !== ""),
      }));
  }, [data]);

  // Department display order: 電子甲 → 電子乙 → 電機所 → 電控所 → 生醫所 → rest.
  // Match by substring so it survives small naming variations (e.g. "電子所甲組").
  const DEPT_ORDER = ["電子所甲", "電子所乙", "電機所", "電控所", "生醫所"];
  const deptRank = (d) => {
    const i = DEPT_ORDER.findIndex((key) => d.includes(key));
    return i === -1 ? DEPT_ORDER.length : i;
  };
  const DEPTS = useMemo(() => {
    const raw = data?.topics?.departments ?? [];
    return [...raw].sort((a, b) => {
      const ra = deptRank(a);
      const rb = deptRank(b);
      if (ra !== rb) return ra - rb;
      return a.localeCompare(b, "zh-Hant");
    });
  }, [data]);
  // Fields are derived from the union of all professor tags (deduped, # stripped, sorted),
  // matching the original TopicPage behaviour rather than the topics.fields list in JSON.
  const FIELDS = useMemo(() => {
    const set = new Set();
    professors.forEach((p) => p.cleanTags.forEach((t) => set.add(t)));
    return [...set].sort();
  }, [professors]);

  const toggleField = (f) => {
    setFields((prev) => {
      const next = new Set(prev);
      next.has(f) ? next.delete(f) : next.add(f);
      return next;
    });
  };
  const clearField = (f) =>
    setFields((prev) => {
      const next = new Set(prev);
      next.delete(f);
      return next;
    });
  const clearAll = () => {
    setDept(null);
    setFields(new Set());
    setQuery("");
  };

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return professors.filter((p) => {
      if (dept && !p.department.includes(dept)) return false;
      if (fields.size > 0 && !p.cleanTags.some((t) => fields.has(t))) return false;
      if (q) {
        const blob = (
          p.name +
          " " +
          (p.labName || "") +
          " " +
          p.department.join(" ") +
          " " +
          p.cleanTags.join(" ")
        ).toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    });
  }, [professors, dept, fields, query]);

  const hasFilters = dept !== null || fields.size > 0 || query.length > 0;

  const onPick = (prof) => navigate(`/professor/${prof.id}`);

  return (
    <div className={styles.page}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <div className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true" />
          <strong>NYCUEE · LAB</strong>
        </div>
        <button
          type="button"
          onClick={() => navigate("/")}
          className={styles.homeLink}
        >
          ← Home
        </button>
      </div>

      {/* Hero + search */}
      <div className={styles.heroRow}>
        <h1 className={styles.title}>研究領域目錄</h1>
        <div className={styles.search}>
          <span className={styles.searchIcon} aria-hidden="true">⌕</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜尋…"
            className={styles.searchInput}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className={styles.searchClear}
              aria-label="clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Filter rails */}
      <div className={styles.rails}>
        <div className={styles.railRow}>
          <Pill on={dept === null} onClick={() => setDept(null)}>全部系所</Pill>
          {DEPTS.map((d) => (
            <Pill key={d} on={dept === d} onClick={() => setDept(dept === d ? null : d)}>
              {d}
            </Pill>
          ))}
        </div>
        <div className={styles.railRow}>
          {FIELDS.map((f) => (
            <Pill key={f} on={fields.has(f)} onClick={() => toggleField(f)}>
              {f}
            </Pill>
          ))}
        </div>
      </div>

      {/* Active filters + count */}
      <div className={styles.activeRow}>
        <div className={styles.activeLeft}>
          <span className={styles.count}>
            {String(list.length).padStart(2, "0")} / {String(professors.length).padStart(2, "0")}
          </span>
          {dept && <ActiveChip onClear={() => setDept(null)}>{dept}</ActiveChip>}
          {[...fields].map((f) => (
            <ActiveChip key={f} onClear={() => clearField(f)}>{f}</ActiveChip>
          ))}
          {query && <ActiveChip onClear={() => setQuery("")}>{`“${query}”`}</ActiveChip>}
        </div>
        {hasFilters && (
          <button type="button" onClick={clearAll} className={styles.clearBtn}>
            Clear
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className={styles.empty}>載入中…</div>
      ) : error ? (
        <div className={styles.empty}>載入錯誤: {error}</div>
      ) : list.length === 0 ? (
        <div className={styles.empty}>查無結果</div>
      ) : (
        <div className={styles.grid}>
          {list.map((p) => (
            <ProfCard key={p.id} prof={p} onPick={onPick} />
          ))}
        </div>
      )}
    </div>
  );
}

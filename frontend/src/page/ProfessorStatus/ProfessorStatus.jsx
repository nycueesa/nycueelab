import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE } from '../../utils/api';
import { fetchWithAuth, getCachedUserInfo, logout } from '../../utils/auth';
import { isVisibleOnTopicPage } from '../../utils/professorVisibility';
import styles from './ProfessorStatus.module.css';

const labels = {
  labName: '實驗室', department: '系所', officeLocation: '辦公室',
  email: '電子郵件', LabWebsite: '實驗室網站', tags: '研究標籤',
  research: '研究方向', recomendedCourses: '推薦課程', faqs: '常見問答',
  question: '問題', answer: '回答', title: '標題', subtitle: '內容',
  photo: '照片',
};

const departmentOrder = ['電子所甲', '電子所乙', '電機所', '電控所', '生醫所'];
const departmentRank = (department) => {
  const rank = departmentOrder.findIndex((name) => department.includes(name));
  return rank === -1 ? departmentOrder.length : rank;
};
const getDepartments = (professor) => {
  const departments = Array.isArray(professor.department) ? professor.department : [professor.department];
  return departments.filter((department) => typeof department === 'string' && department.trim() !== '');
};
const getTags = (professor) => (Array.isArray(professor.tags) ? professor.tags : [])
  .filter((tag) => typeof tag === 'string')
  .map((tag) => tag.replace(/^#+/, '').trim())
  .filter(Boolean);

function DetailValue({ value }) {
  if (value === null || value === undefined || value === '') return <span className={styles.muted}>未提供</span>;
  if (typeof value === 'boolean') return value ? '是' : '否';
  if (Array.isArray(value)) {
    if (!value.length) return <span className={styles.muted}>未提供</span>;
    return <ul className={styles.detailList}>{value.map((item, index) => <li key={index}><DetailValue value={item} /></li>)}</ul>;
  }
  if (typeof value === 'object') {
    return <dl className={styles.nestedDetails}>{Object.entries(value).map(([key, item]) => (
      <div key={key}><dt>{labels[key] || key}</dt><dd><DetailValue value={item} /></dd></div>
    ))}</dl>;
  }
  if (typeof value === 'string' && /^https?:\/\//i.test(value)) {
    return <a href={value} target="_blank" rel="noopener noreferrer">{value}</a>;
  }
  if (typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return <a href={`mailto:${value}`}>{value}</a>;
  }
  return String(value);
}

function ProfessorDetails({ professor }) {
  const fields = Object.entries(professor).filter(([key]) => !['id', 'name', 'state', 'photo', 'hidden', 'topicPageVisible'].includes(key));
  return <div className={styles.detailsBody}>
    {professor.photo && <img className={styles.photo} src={`${API_BASE}/photo/${encodeURIComponent(professor.photo)}`} alt={`${professor.name || '教授'}照片`} loading="lazy" />}
    <dl className={styles.detailsGrid}>{fields.map(([key, value]) => (
      <div className={styles.detailField} key={key}><dt>{labels[key] || key}</dt><dd><DetailValue value={value} /></dd></div>
    ))}</dl>
  </div>;
}

export default function ProfessorStatus() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [department, setDepartment] = useState(null);
  const [fields, setFields] = useState(() => new Set());
  const [savingIds, setSavingIds] = useState(() => new Set());

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await fetchWithAuth(`${API_BASE}/manage/professors`, { cache: 'no-store' });
        if (!response.ok) throw new Error('無法載入教授資料，請稍後重試。');
        const result = await response.json();
        if (active) setData(result);
      } catch (cause) {
        if (!active) return;
        if (cause.message.includes('登入')) navigate('/login', { replace: true, state: { from: '/professors/status' } });
        else setError(cause.message || '無法載入教授資料，請稍後重試。');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [navigate]);

  const professors = useMemo(() => (data?.professors || []).filter((professor) => {
    const name = professor?.name?.trim();
    return name && name !== 'Prof.';
  }), [data]);
  const states = data?.topics?.states || [];
  const departments = useMemo(() => [...new Set(professors.flatMap(getDepartments))].sort((a, b) => {
    const rankDifference = departmentRank(a) - departmentRank(b);
    return rankDifference || a.localeCompare(b, 'zh-Hant');
  }), [professors]);
  const availableFields = useMemo(() => {
    const rankByField = new Map();
    professors.forEach((professor) => {
      const professorDepartments = getDepartments(professor);
      if (department && !professorDepartments.includes(department)) return;
      const rank = Math.min(departmentOrder.length, ...professorDepartments.map(departmentRank));
      getTags(professor).forEach((tag) => {
        rankByField.set(tag, Math.min(rankByField.get(tag) ?? Infinity, rank));
      });
    });
    return [...rankByField.keys()].sort((a, b) =>
      rankByField.get(a) - rankByField.get(b) || a.localeCompare(b, 'zh-Hant')
    );
  }, [professors, department]);

  useEffect(() => {
    setFields((current) => {
      const available = new Set(availableFields);
      const next = new Set([...current].filter((field) => available.has(field)));
      return next.size === current.size ? current : next;
    });
  }, [availableFields]);

  const counts = useMemo(() => professors.reduce((result, professor) => {
    result[professor.state] = (result[professor.state] || 0) + 1;
    return result;
  }, {}), [professors]);
  const visible = useMemo(() => professors.filter((professor) => {
    const matchesState = filter === 'all' || professor.state === filter;
    const matchesDepartment = !department || getDepartments(professor).includes(department);
    const matchesField = fields.size === 0 || getTags(professor).some((tag) => fields.has(tag));
    const matchesQuery = `${professor.name || ''} ${professor.id}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
    return matchesState && matchesDepartment && matchesField && matchesQuery;
  }), [professors, filter, department, fields, query]);

  function toggleField(field) {
    setFields((current) => {
      const next = new Set(current);
      if (next.has(field)) next.delete(field);
      else next.add(field);
      return next;
    });
  }

  function clearFilters() {
    setQuery('');
    setFilter('all');
    setDepartment(null);
    setFields(new Set());
  }

  async function updateState(professor, nextState) {
    if (nextState === professor.state || savingIds.has(professor.id)) return;
    const previousState = professor.state;
    setError('');
    setSavingIds((current) => new Set(current).add(professor.id));
    setData((current) => ({
      ...current,
      professors: current.professors.map((item) => item.id === professor.id ? { ...item, state: nextState } : item),
    }));
    try {
      const response = await fetchWithAuth(`${API_BASE}/manage/professors/${professor.id}/state`, {
        method: 'PATCH', body: JSON.stringify({ state: nextState }),
      });
      if (!response.ok) throw new Error('狀態儲存失敗，已恢復原本的選項。');
    } catch (cause) {
      setData((current) => ({
        ...current,
        professors: current.professors.map((item) => item.id === professor.id ? { ...item, state: previousState } : item),
      }));
      if (cause.message.includes('登入')) navigate('/login', { replace: true, state: { from: '/professors/status' } });
      else setError(cause.message || '狀態儲存失敗，已恢復原本的選項。');
    } finally {
      setSavingIds((current) => {
        const next = new Set(current);
        next.delete(professor.id);
        return next;
      });
    }
  }

  async function updateTopicPageVisibility(professor, visible) {
    if (visible === isVisibleOnTopicPage(professor) || savingIds.has(professor.id)) return;
    const previousVisibility = professor.topicPageVisible;
    setError('');
    setSavingIds((current) => new Set(current).add(professor.id));
    setData((current) => ({
      ...current,
      professors: current.professors.map((item) => item.id === professor.id ? { ...item, topicPageVisible: visible } : item),
    }));
    try {
      const response = await fetchWithAuth(`${API_BASE}/manage/professors/${professor.id}/topic-page-visibility`, {
        method: 'PATCH', body: JSON.stringify({ visible }),
      });
      if (!response.ok) throw new Error('上線設定儲存失敗，已恢復原本的設定。');
    } catch (cause) {
      setData((current) => ({
        ...current,
        professors: current.professors.map((item) => item.id === professor.id ? { ...item, topicPageVisible: previousVisibility } : item),
      }));
      if (cause.message.includes('登入')) navigate('/login', { replace: true, state: { from: '/professors/status' } });
      else setError(cause.message || '上線設定儲存失敗，已恢復原本的設定。');
    } finally {
      setSavingIds((current) => {
        const next = new Set(current);
        next.delete(professor.id);
        return next;
      });
    }
  }

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return <div className={styles.page}>
    <header className={styles.header}>
      <Link to="/" className={styles.brand}>NYCU · EE <span>教授資料</span></Link>
      <div className={styles.headerActions}>
        <span className={styles.account}>{getCachedUserInfo()?.username}</span>
        <button type="button" onClick={handleLogout}>登出</button>
      </div>
    </header>

    <main className={styles.content}>
      <div className={styles.intro}>
        <div><p className={styles.eyebrow}>PROFESSOR STATUS / 資料管理</p><h1>教授訪談狀態</h1><p>選擇狀態即可儲存。點開教授卡片，可查看完整資料。</p></div>
        <span className={styles.total}>{professors.length}<small>位教授</small></span>
      </div>

      {error && <div className={styles.error} role="alert">{error}</div>}
      {loading ? <p className={styles.notice} role="status">正在載入教授資料…</p> : !data ? <p className={styles.notice}>目前無法顯示教授資料。</p> : <>
        <div className={styles.overview} aria-label="狀態統計">
          {states.map((state) => <div className={styles.stat} key={state}><span>{state}</span><strong>{counts[state] || 0}</strong></div>)}
        </div>
        <div className={styles.filterRails} aria-label="教授篩選">
          <div className={styles.filterRow}>
            <span className={styles.filterLabel} id="status-department-label">系所：</span>
            <div className={styles.filterOptions} role="group" aria-labelledby="status-department-label">
              <button type="button" className={`${styles.filterPill} ${department === null ? styles.filterPillActive : ''}`} aria-pressed={department === null} onClick={() => setDepartment(null)}>全部系所</button>
              {departments.map((name) => <button type="button" key={name} className={`${styles.filterPill} ${department === name ? styles.filterPillActive : ''}`} aria-pressed={department === name} onClick={() => setDepartment((current) => current === name ? null : name)}>{name}</button>)}
            </div>
          </div>
          <div className={styles.filterRow}>
            <span className={styles.filterLabel} id="status-field-label">領域：</span>
            <div className={styles.filterOptions} role="group" aria-labelledby="status-field-label">
              <button type="button" className={`${styles.filterPill} ${fields.size === 0 ? styles.filterPillActive : ''}`} aria-pressed={fields.size === 0} onClick={() => setFields(new Set())}>全部領域</button>
              {availableFields.map((field) => <button type="button" key={field} className={`${styles.filterPill} ${fields.has(field) ? styles.filterPillActive : ''}`} aria-pressed={fields.has(field)} onClick={() => toggleField(field)}>{field}</button>)}
            </div>
          </div>
        </div>
        <div className={styles.toolbar}>
          <label>搜尋教授<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="輸入姓名或編號" /></label>
          <label>篩選狀態<select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">全部狀態</option>{states.map((state) => <option key={state} value={state}>{state}</option>)}</select></label>
          {(query || filter !== 'all' || department || fields.size > 0) && <button type="button" className={styles.clearFilters} onClick={clearFilters}>清除篩選</button>}
          <span className={styles.resultCount}>顯示 {visible.length} / {professors.length} 筆</span>
        </div>
        <div className={styles.cards}>
          {visible.map((professor) => {
            const online = isVisibleOnTopicPage(professor);
            const saving = savingIds.has(professor.id);
            return <article className={styles.card} key={professor.id}>
            <div className={styles.cardTop}>
              <div className={styles.identity}><span>NO. {String(professor.id).padStart(3, '0')}</span><h2>{professor.name?.trim() || '未命名教授'}</h2></div>
              <div className={styles.cardControls}>
                <label className={styles.stateControl} htmlFor={`state-${professor.id}`}>目前狀態
                  <select id={`state-${professor.id}`} value={professor.state || ''} disabled={saving} onChange={(event) => updateState(professor, event.target.value)}>
                    {!states.includes(professor.state) && <option value={professor.state || ''}>{professor.state || '未設定'}</option>}
                    {states.map((state) => <option key={state} value={state}>{state}</option>)}
                  </select>
                </label>
                <div className={styles.visibilityControl}>
                  <span className={styles.visibilityStatus}>專題頁：{online ? '已上線' : '已下線'}</span>
                  <div className={styles.visibilityActions} role="group" aria-label={`${professor.name}的專題頁顯示設定`}>
                    <button type="button" className={online ? styles.visibilitySelected : ''} disabled={saving || online} onClick={() => updateTopicPageVisibility(professor, true)}>上線</button>
                    <button type="button" className={!online ? styles.visibilitySelected : ''} disabled={saving || !online} onClick={() => updateTopicPageVisibility(professor, false)}>下線</button>
                  </div>
                </div>
              </div>
            </div>
            <details className={styles.details}><summary>查看詳細資料 <span aria-hidden="true">⌄</span></summary><ProfessorDetails professor={professor} /></details>
            {saving && <span className={styles.saving} role="status">儲存中…</span>}
          </article>;
          })}
          {visible.length === 0 && <p className={styles.notice}>沒有符合條件的教授。</p>}
        </div>
      </>}
    </main>
  </div>;
}

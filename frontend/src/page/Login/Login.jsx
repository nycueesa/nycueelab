import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getCurrentUser, login, logout } from '../../utils/auth';
import styles from './Login.module.css';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const destination = location.state?.from || '/professors/status';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    let active = true;
    getCurrentUser().then((current) => {
      if (active) { setUser(current); setChecking(false); }
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!user) return;
    const remaining = Number(sessionStorage.getItem('token_expires_at')) - Date.now();
    const timer = setTimeout(() => {
      logout();
      setUser(null);
      setError('登入已過期，請重新登入。');
    }, Math.max(0, remaining));
    return () => clearTimeout(timer);
  }, [user]);

  async function handleLogin(event) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');
    const result = await login(email.trim(), password);
    if (result.success) {
      setUser(result.data.user);
      setPassword('');
      navigate(destination, { replace: true });
    } else {
      setError(result.error);
    }
    setLoading(false);
  }

  function handleLogout() {
    logout();
    setUser(null);
    setPassword('');
    setError('');
  }

  return (
    <div className={styles.page}>
      <aside className={styles.story}>
        <Link to="/" className={styles.brand}><span className={styles.brandMark}>N</span><span>NYCU · EE<small>陽明交大電機專題網</small></span></Link>
        <div className={styles.storyContent}>
          <span className={styles.eyebrow}>A PLACE FOR YOUR NEXT IDEA</span>
          <h1>從好奇出發，<br />找到你的<span>研究方向。</span></h1>
          <p>連結專業、探索實驗室，<br />讓每一個想法，都有開始的地方。</p>
          <div className={styles.diagram} aria-hidden="true"><div className={styles.orbit} /><div className={styles.orbitTwo} /><div className={styles.core}>EE<span>CONNECT & EXPLORE</span></div><i className={styles.nodeOne} /><i className={styles.nodeTwo} /><i className={styles.nodeThree} /></div>
        </div>
        <div className={styles.storyFooter}><span>NATIONAL YANG MING CHIAO TUNG UNIVERSITY</span><span>HSINCHU, TAIWAN ↗</span></div>
      </aside>
      <section className={styles.formPanel} aria-labelledby="login-title">
        <nav className={styles.topNav}><Link to="/topicpage">先探索專題 <span aria-hidden="true">↗</span></Link></nav>
        <div className={styles.formContent}>
          <span className={styles.sectionLabel}>MEMBER ACCESS <span>／ 01</span></span>
          {user ? (
            <div>
              <div className={styles.successIcon} aria-hidden="true">✓</div>
              <h2 id="login-title">登入成功</h2>
              <p className={styles.subtitle} role="status">歡迎回來，你已登入電機專題網。</p>
              <div className={styles.account}><span>目前登入帳號</span><strong>{user.email}</strong></div>
              <Link to={destination} className={styles.submit}>查看教授資料 <span aria-hidden="true">→</span></Link>
              <button type="button" className={styles.logout} onClick={handleLogout}>登出帳號</button>
            </div>
          ) : (
            <>
              <h2 id="login-title">歡迎回來<span className={styles.titleDot}>.</span></h2>
              <p className={styles.subtitle}>登入後查看教授資料並更新訪談狀態。</p>
              <form onSubmit={handleLogin} className={styles.form} aria-busy={loading || checking}>
                <div className={styles.field}>
                  <label htmlFor="email">電子郵件 <span>EMAIL</span></label>
                  <input id="email" name="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="username" maxLength={254} required disabled={loading || checking} />
                </div>
                <div className={styles.field}>
                  <label htmlFor="password">密碼 <span>PASSWORD</span></label>
                  <div className={styles.passwordField}>
                    <input id="password" name="password" type={visible ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="輸入你的密碼" autoComplete="current-password" maxLength={1024} required disabled={loading || checking} />
                    <button type="button" onClick={() => setVisible(!visible)} aria-label={visible ? '隱藏密碼' : '顯示密碼'} aria-pressed={visible} disabled={loading}>{visible ? '隱藏' : '顯示'}</button>
                  </div>
                </div>
                {error && <p className={styles.error} role="alert">{error}</p>}
                <button type="submit" className={styles.submit} disabled={loading || checking}><span>{checking ? '載入中…' : loading ? '登入中…' : '登入帳號'}</span><span aria-hidden="true">→</span></button>
              </form>
              <div className={styles.help}><span>還沒有帳號，或忘記密碼？</span><a href="mailto:nycu.xueshubu@gmail.com">聯絡系學會 <span aria-hidden="true">↗</span></a></div>
            </>
          )}
          <p className={styles.privacy}><span aria-hidden="true">◇</span> 你的每一次探索，從這裡開始。</p>
        </div>
        <footer className={styles.footer}><span>© {new Date().getFullYear()} NYCU EE · EESA</span><span>專題探索，由此啟程。</span></footer>
      </section>
    </div>
  );
}

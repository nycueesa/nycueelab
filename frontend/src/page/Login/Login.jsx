import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../utils/auth';
import styles from './Login.module.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log("Attempting login...");

    try {
      const result = await login(username, password);

      if (result.success) {
        console.log("Login successful!", result.data);
        // 登入成功，導向首頁
        navigate('/');
      } else {
        console.error("Login failed:", result.error);
        setError(result.error || "帳號或密碼錯誤");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("登入失敗，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <h1 className={styles.loginTitle}>NYCU EE Lab</h1>
        <h2 className={styles.loginSubtitle}>管理員登入</h2>

        <form onSubmit={handleLogin} className={styles.loginForm}>
          <div className={styles.formGroup}>
            <label htmlFor="username" className={styles.label}>
              帳號
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.input}
              placeholder="請輸入帳號"
              required
              autoComplete="username"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              密碼
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="請輸入密碼"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className={styles.loginButton}
            disabled={loading}
          >
            {loading ? "登入中..." : "登入"}
          </button>
        </form>

        <div className={styles.loginFooter}>
          <p className={styles.hint}>
            預設帳號: admin / 預設密碼: admin123
          </p>
          <p className={styles.hint}>
            （生產環境請務必修改預設密碼）
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;

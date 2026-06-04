import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

export default function Login() {
  const { t } = useTranslation();
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = login(email.trim(), password);
    if (!result.success) {
      setError(t('auth.error'));
    } else {
      window.location.hash = '#home';
    }
  };

  return (
    <div className="auth-page glass-card">
      <h2>{t('auth.loginTitle')}</h2>
      {error && <p className="error-msg">{error}</p>}
      <form onSubmit={handleSubmit} className="auth-form">
        <input type="email" placeholder={t('auth.emailPlaceholder')} value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder={t('auth.passwordPlaceholder')} value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" className="btn btn-primary">{t('auth.loginBtn')}</button>
      </form>
      <p className="auth-switch">{t('auth.noAccount')} <a href="#register">{t('auth.registerLink')}</a></p>
    </div>
  );
}

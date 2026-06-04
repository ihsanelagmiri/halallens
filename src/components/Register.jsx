import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

export default function Register() {
  const { t } = useTranslation();
  const { register } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError(t('auth.passwordMismatch'));
      return;
    }
    const result = register(name.trim(), email.trim(), password);
    if (!result.success) {
      setError(t('auth.emailExists'));
    } else {
      window.location.hash = '#home';
    }
  };

  return (
    <div className="auth-page glass-card">
      <h2>{t('auth.registerTitle')}</h2>
      {error && <p className="error-msg">{error}</p>}
      <form onSubmit={handleSubmit} className="auth-form">
        <input type="text" placeholder={t('auth.namePlaceholder')} value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="email" placeholder={t('auth.emailPlaceholder')} value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder={t('auth.passwordPlaceholder')} value={password} onChange={(e) => setPassword(e.target.value)} required />
        <input type="password" placeholder={t('auth.confirmPasswordPlaceholder')} value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        <button type="submit" className="btn btn-primary">{t('auth.registerBtn')}</button>
      </form>
      <p className="auth-switch">{t('auth.hasAccount')} <a href="#login">{t('auth.loginLink')}</a></p>
    </div>
  );
}

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { addReport } from '../utils/storage.js';

export default function Report() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ productName: '', explanation: '', suggestion: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.productName && form.explanation) {
      addReport({ ...form, date: new Date().toISOString() });
      setSubmitted(true);
      setForm({ productName: '', explanation: '', suggestion: '' });
    }
  };

  return (
    <div className="auth-page glass-card">
      <h2>{t('report.title')}</h2>
      <p style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--text-secondary)' }}>
        {t('report.subtitle')}
      </p>
      {submitted && <p className="success-msg">{t('report.thankYou')}</p>}
      <form onSubmit={handleSubmit} className="contact-form">
        <input
          type="text"
          name="productName"
          placeholder={t('report.productName')}
          value={form.productName}
          onChange={handleChange}
          required
          className="contact-input"
        />
        <textarea
          name="explanation"
          placeholder={t('report.explanation')}
          value={form.explanation}
          onChange={handleChange}
          required
          className="contact-textarea"
          style={{ minHeight: '100px' }}
        />
        <textarea
          name="suggestion"
          placeholder={t('report.suggestion')}
          value={form.suggestion}
          onChange={handleChange}
          className="contact-textarea"
          style={{ minHeight: '80px' }}
        />
        <button type="submit" className="btn btn-primary">{t('report.submit')}</button>
      </form>
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <a href="#scanner" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
          {t('report.backToScanner')}
        </a>
      </div>
    </div>
  );
}

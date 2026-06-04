import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { addContact } from '../utils/storage.js';

export default function ContactUs() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.name && form.email && form.message) {
      addContact({ ...form, date: new Date().toISOString() });
      setSubmitted(true);
      setForm({ name: '', email: '', message: '' });
    }
  };

  return (
    <div className="auth-page glass-card">
      <h2>{t('contact.title')}</h2>
      {submitted && <p className="success-msg">{t('contact.thankYou')}</p>}
      <form onSubmit={handleSubmit} className="contact-form">
        <input
          type="text"
          name="name"
          placeholder={t('contact.namePlaceholder')}
          value={form.name}
          onChange={handleChange}
          required
          className="contact-input"
        />
        <input
          type="email"
          name="email"
          placeholder={t('contact.emailPlaceholder')}
          value={form.email}
          onChange={handleChange}
          required
          className="contact-input"
        />
        <textarea
          name="message"
          placeholder={t('contact.messagePlaceholder')}
          value={form.message}
          onChange={handleChange}
          required
          className="contact-textarea"
        />
        <button type="submit" className="btn btn-primary">{t('contact.submit')}</button>
      </form>
    </div>
  );
}

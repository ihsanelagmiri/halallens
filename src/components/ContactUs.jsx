import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import emailjs from 'emailjs-com';

export default function ContactUs() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (form.name && form.email && form.message) {
      // --- TEMPORARY DEBUG LOGGING (remove after testing) ---
      const sid = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
      const tid = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
      const pk  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';
      const mask = (s) => s.length <= 6 ? '***' : s.slice(0, 3) + '***' + s.slice(-3);
      console.log('[ContactUs DEBUG] Service ID:', sid ? mask(sid) : 'UNDEFINED');
      console.log('[ContactUs DEBUG] Template ID:', tid ? mask(tid) : 'UNDEFINED');
      console.log('[ContactUs DEBUG] Public Key:', pk ? mask(pk) : 'UNDEFINED');
      console.log('[ContactUs DEBUG] Template params:', { from_name: form.name, reply_to: form.email, message: form.message });
      // --- END DEBUG ---
      try {
        const response = await emailjs.send(
          sid,
          tid,
          { from_name: form.name, reply_to: form.email, message: form.message },
          pk
        );
        // --- TEMPORARY: log full response ---
        console.log('[ContactUs DEBUG] EmailJS response status:', response.status);
        console.log('[ContactUs DEBUG] EmailJS response text:', response.text);
        console.log('[ContactUs DEBUG] Full response object:', response);
        // --- END TEMPORARY ---
        setSubmitted(true);
        setForm({ name: '', email: '', message: '' });
      } catch (err) {
        console.error('[ContactUs DEBUG] EmailJS error object:', err);
        console.error('[ContactUs DEBUG] EmailJS error status:', err?.status);
        console.error('[ContactUs DEBUG] EmailJS error text:', err?.text);
        setErrorMsg(t('contact.error') || 'Failed to send message. Please try again later.');
      }
    }
  };

  return (
    <div className="auth-page glass-card">
      <h2>{t('contact.title')}</h2>
      {submitted && <p className="success-msg">{t('contact.thankYou')}</p>}
      {errorMsg && <p className="error-msg">{errorMsg}</p>}
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
        <button type="submit" className="btn btn-primary">
          {t('contact.submit')}
        </button>
      </form>
    </div>
  );
}

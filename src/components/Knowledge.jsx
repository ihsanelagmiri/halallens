import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const FAQS = ['q1','q2','q3','q4'];

let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
});

export default function Knowledge() {
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState(null);
  const [pwaVisible, setPwaVisible] = useState(!!deferredPrompt);

  const toggleFaq = (idx) => setOpenFaq(openFaq === idx ? null : idx);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      deferredPrompt = null;
      setPwaVisible(false);
    }
  };

  return (
    <div className="content-wrapper">
      <div className="knowledge-grid">
        {/* FAQ Section */}
        <div className="faq-section">
          <h2>{t('knowledge.title')}</h2>
          <div className="faq-list">
            {FAQS.map((key, idx) => (
              <div key={key} className={`faq-item${openFaq === idx ? ' active' : ''}`}>
                <button className="faq-question" onClick={() => toggleFaq(idx)}>
                  {t(`knowledge.${key}`)}
                  <svg className="faq-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" width="18" height="18">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                <div className="faq-answer">
                  <p dangerouslySetInnerHTML={{ __html: t(`knowledge.${key.replace('q','a')}`) }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="knowledge-sidebar">
          <div className="info-card">
            <h3>{t('knowledge.sidebarTitle')}</h3>
            <p>{t('knowledge.sidebarDesc')}</p>
            <a href="https://halalfoundation.org" target="_blank" rel="noreferrer" className="info-card-link">
              {t('knowledge.sidebarLink')}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" width="14" height="14">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>
          </div>

          {pwaVisible && (
            <div className="info-card" id="pwa-install-card" style={{ background:'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(245,158,11,0.08) 100%)', borderColor:'var(--glass-border-glow)' }}>
              <h3>{t('knowledge.pwaTitle')}</h3>
              <p>{t('knowledge.pwaDesc')}</p>
              <button className="btn btn-primary" id="btn-pwa-install" style={{ width:'100%', padding:'10px 20px', fontSize:'0.9rem' }} onClick={handleInstall}>
                {t('knowledge.pwaBtn')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

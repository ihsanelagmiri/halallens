import React from 'react';
import { useTranslation } from 'react-i18next';

export default function PrivacyPolicy() {
  const { t } = useTranslation();
  return (
    <div className="privacy-page glass-card" style={{ padding: '24px', maxWidth: '800px', margin: '40px auto' }}>
      <h2>{t('privacy.title', 'Privacy Policy')}</h2>
      <section>
        <h3>{t('privacy.dataStored', 'What data is stored')}</h3>
        <p>{t('privacy.dataStoredContent', 'We store your email, name, scan history and account preferences.')}</p>
      </section>
      <section>
        <h3>{t('privacy.scanHistory', 'Scan history handling')}</h3>
        <p>{t('privacy.scanHistoryContent', 'Your scan history is kept locally and synced to your account if you are logged in.')}</p>
      </section>
      <section>
        <h3>{t('privacy.accountInfo', 'Account information handling')}</h3>
        <p>{t('privacy.accountInfoContent', 'Passwords are stored securely and never exposed in plain text.')}</p>
      </section>
      <section>
        <h3>{t('privacy.contactInfo', 'Contact information handling')}</h3>
        <p>{t('privacy.contactInfoContent', 'We may use your email to send important updates or support messages.')}</p>
      </section>
      <section>
        <h3>{t('privacy.userRights', 'User rights')}</h3>
        <p>{t('privacy.userRightsContent', 'You can request data deletion, export, or modification anytime via the Settings page.')}</p>
      </section>
    </div>
  );
}

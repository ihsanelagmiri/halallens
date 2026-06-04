import React from 'react';
import { useTranslation } from 'react-i18next';

export default function ArchiveOverlay({ match, onAccept, onRescan }) {
  const { t } = useTranslation();

  if (!match) return null;

  return (
    <div className="archive-overlay">
      <div className="archive-modal glass-card">
        <h3>{t('archive.title')}</h3>
        <p>{t('archive.desc')}</p>
        <p>{t('archive.previousVerdict')}: <strong className={`status-indicator ${match.verdict.toLowerCase()}`}>{match.verdict}</strong></p>
        <div className="archive-actions" style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button className="btn btn-primary" onClick={onAccept}>{t('archive.viewPrevious')}</button>
          <button className="btn btn-secondary" onClick={onRescan}>{t('archive.analyzeAgain')}</button>
        </div>
      </div>
    </div>
  );
}

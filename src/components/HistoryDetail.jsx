import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { translateDbText } from '../utils/dbTranslation.js';
import { AuthContext } from '../context/AuthContext.jsx';
import { getHistory } from '../utils/storage.js';

export default function HistoryDetail({ entryId }) {
  const { t, i18n } = useTranslation();
  const { currentUser } = useContext(AuthContext);
  const [entry, setEntry] = useState(null);
  const detailedExplanations = localStorage.getItem('detailedExplanations') !== 'false';

  useEffect(() => {
    if (currentUser?.email && entryId) {
      const history = getHistory(currentUser.email);
      const found = history.find(h => h.id === entryId);
      if (found) setEntry(found);
    }
  }, [currentUser, entryId]);

  if (!entry) {
    return (
      <div className="auth-page glass-card">
        <h2>{t('history.detail.title') ?? 'Scan Detail'}</h2>
        <p>{t('history.detail.notFound') ?? 'Scan not found.'}</p>
      </div>
    );
  }

  return (
    <div className="auth-page glass-card">
      <h2>{t('history.detail.title') ?? 'Scan Detail'}</h2>
      <div className="detail-header" style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
        <img src={entry.thumbnail} alt="product" style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '8px' }} />
        <div>
          <p><strong>{t('history.product') ?? 'Product'}:</strong> {entry.productName}</p>
          <p><strong>{t('history.verdict') ?? 'Verdict'}:</strong> {entry.verdict}</p>
          <p><strong>{t('history.date') ?? 'Date'}:</strong> {new Date(entry.date).toLocaleString()}</p>
        </div>
      </div>

        {/* OCR Extracted Text */}
        <section className="detail-section">
          <h3>{t('history.detail.ocr', 'OCR Extracted Text')}</h3>
          <pre style={{ whiteSpace: 'pre-wrap', background: 'var(--glass-bg)', padding: '12px', borderRadius: '8px' }}>{entry.ocrText}</pre>
        </section>

        {/* Halal Ingredients */}
        {Array.isArray(entry.itemsReport) && (
          <section className="detail-section">
            <h3>{t('history.detail.halalIngredients', 'Halal Ingredients')}</h3>
            <ul className="ingredients-list halal-list">
              {entry.itemsReport
                .filter(item => item.status === 'halal')
                .map((item, i) => {
                  const desc = translateDbText(item.desc || item.reason, i18n.language);
                  const name = translateDbText(item.name, i18n.language);
                  return (
                    <li key={i}>✓ {name}{detailedExplanations && desc ? ` (${desc})` : ''}</li>
                  );
                })}
            </ul>
          </section>
        )}

        {/* Non-Halal / Prohibited Ingredients */}
        {Array.isArray(entry.itemsReport) && (
          <section className="detail-section">
            <h3>{t('history.detail.nonHalalIngredients', 'Non-Halal / Prohibited Ingredients')}</h3>
            <ul className="ingredients-list nonhalal-list">
              {entry.itemsReport
                .filter(item => item.status !== 'halal' && item.status !== 'uncertain')
                .map((item, i) => {
                  const desc = translateDbText(item.desc || item.reason, i18n.language);
                  const name = translateDbText(item.name, i18n.language);
                  return (
                    <li key={i}>✗ {name}{detailedExplanations && desc ? ` – ${desc}` : ''}</li>
                  );
                })}
            </ul>
          </section>
        )}

        {/* Uncertain Ingredients */}
        {Array.isArray(entry.itemsReport) && (
          <section className="detail-section">
            <h3>{t('history.detail.uncertainIngredients', 'Uncertain Ingredients')}</h3>
            <ul className="ingredients-list uncertain-list">
              {entry.itemsReport
                .filter(item => item.status === 'uncertain')
                .map((item, i) => {
                  const desc = translateDbText(item.desc || item.reason, i18n.language);
                  const name = translateDbText(item.name, i18n.language);
                  return (
                    <li key={i}>⚠ {name}{detailedExplanations && desc ? ` – ${desc}` : ''}</li>
                  );
                })}
            </ul>
          </section>
        )}

        {/* Manufacturing Risks */}
        <section className="detail-section">
          <h3>{t('history.detail.manufacturingRisks', 'Manufacturing Risks')}</h3>
          {entry.riskData && Object.keys(entry.riskData).length > 0 ? (
            <ul className="risk-list">
              {Object.entries(entry.riskData).map(([key, val], i) => (
                <li key={i}>{val}</li>
              ))}
            </ul>
          ) : (
            <p>{t('history.detail.noRisks', 'No manufacturing risks detected.')}</p>
          )}
        </section>

        {/* Summary */}
        <section className="detail-section">
          <h3>{t('history.detail.summary', 'Summary')}</h3>
          <p>{entry.summary}</p>
        </section>
    </div>
  );
}

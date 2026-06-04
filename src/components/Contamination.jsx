import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const FACTORS = [
  { key: 'sharedLines', value: 'shared-lines', score: 35 },
  { key: 'ethanol', value: 'ethanol', score: 25 },
  { key: 'enzymes', value: 'enzymes', score: 40 },
  { key: 'sharedFrying', value: 'shared-frying', score: 45 },
  { key: 'glazes', value: 'glazes', score: 20 },
];

const CATEGORIES = [
  { value: 'confectionery', weight: 1.2, key: 'confectionery' },
  { value: 'bakery', weight: 1.1, key: 'bakery' },
  { value: 'meat', weight: 1.5, key: 'meat' },
  { value: 'beverages', weight: 1.0, key: 'beverages' },
  { value: 'dairy', weight: 1.2, key: 'dairy' },
];

export default function Contamination() {
  const { t } = useTranslation();
  const [category, setCategory] = useState('confectionery');
  const [checked, setChecked] = useState({});
  const [riskIndex, setRiskIndex] = useState(0);

  useEffect(() => {
    const cat = CATEGORIES.find(c => c.value === category);
    const multiplier = cat ? cat.weight : 1.0;
    let raw = 0;
    FACTORS.forEach(f => { if (checked[f.value]) raw += f.score; });
    setRiskIndex(Math.min(100, Math.round(raw * multiplier)));
  }, [category, checked]);

  const toggleFactor = (val) => {
    setChecked(prev => ({ ...prev, [val]: !prev[val] }));
  };

  const getRiskData = () => {
    if (riskIndex === 0) return {
      status: t('contamination.risk.negligible'),
      color: 'var(--primary)',
      desc: t('contamination.risk.negligibleDesc'),
      tips: [t('contamination.risk.negligibleTip1'), t('contamination.risk.negligibleTip2')],
    };
    if (riskIndex <= 30) return {
      status: t('contamination.risk.low'),
      color: 'var(--primary-hover)',
      desc: t('contamination.risk.lowDesc'),
      tips: [t('contamination.risk.lowTip1'), t('contamination.risk.lowTip2')],
    };
    if (riskIndex <= 65) return {
      status: t('contamination.risk.moderate'),
      color: 'var(--accent)',
      desc: t('contamination.risk.moderateDesc'),
      tips: [t('contamination.risk.moderateTip1'), t('contamination.risk.moderateTip2'), t('contamination.risk.moderateTip3')],
    };
    return {
      status: t('contamination.risk.high'),
      color: 'var(--danger)',
      desc: t('contamination.risk.highDesc'),
      tips: [t('contamination.risk.highTip1'), t('contamination.risk.highTip2'), t('contamination.risk.highTip3')],
    };
  };

  const riskData = getRiskData();
  const strokeOffset = Math.round(540 - (540 * riskIndex) / 100);

  return (
    <div className="content-wrapper">
      <div style={{ textAlign:'center', maxWidth:'600px', margin:'0 auto 40px' }}>
        <h2>{t('contamination.title')}</h2>
        <p>{t('contamination.subtitle')}</p>
      </div>

      <div className="risk-grid">
        {/* Left: Inputs */}
        <div className="risk-form-panel">
          <div className="risk-form-group">
            <label htmlFor="risk-category">{t('contamination.categoryLabel')}</label>
            <select className="risk-select" id="risk-category" value={category} onChange={e => setCategory(e.target.value)}>
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {t(`contamination.categories.${cat.key}`)}
                </option>
              ))}
            </select>
          </div>

          <div className="risk-form-group">
            <label>{t('contamination.checklistLabel')}</label>
            <p style={{ fontSize:'0.8rem', color:'var(--text-secondary)', marginBottom:'4px' }}>
              {t('contamination.checklistNote')}
            </p>
            <div className="risk-checkbox-group">
              {FACTORS.map(factor => (
                <label key={factor.value} className="checkbox-label">
                  <input
                    type="checkbox"
                    className="risk-checkbox"
                    value={factor.value}
                    checked={!!checked[factor.value]}
                    onChange={() => toggleFactor(factor.value)}
                  />
                  <div className="checkbox-text">
                    <h5>{t(`contamination.factors.${factor.key}.title`)}</h5>
                    <p>{t(`contamination.factors.${factor.key}.desc`)}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Gauge */}
        <div className="risk-output-panel">
          <div className="gauge-container">
            <svg className="gauge-svg" width="200" height="200">
              <circle className="gauge-bg" cx="100" cy="100" r="85"></circle>
              <circle
                className="gauge-fill"
                id="risk-gauge-fill"
                cx="100" cy="100" r="85"
                strokeDasharray={`${540 - strokeOffset} 540`}
                stroke={riskData.color}
                style={{ transition: 'stroke-dasharray 0.6s ease, stroke 0.4s ease' }}
              ></circle>
            </svg>
            <div className="gauge-value-display">
              <span className="gauge-num" id="risk-gauge-num">{riskIndex}%</span>
              <span className="gauge-label">{t('contamination.riskIndex')}</span>
            </div>
          </div>

          <div>
            <div className="risk-status-text" id="risk-status-text" style={{ color: riskData.color }}>
              {riskData.status}
            </div>
            <p className="risk-description" id="risk-description">{riskData.desc}</p>
          </div>

          <div className="risk-actionable-tips">
            <h4>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" width="16" height="16">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
              {t('contamination.actionableTitle')}
            </h4>
            <ul className="tips-list" id="risk-tips-list">
              {riskData.tips.map((tip, i) => <li key={i}>{tip}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

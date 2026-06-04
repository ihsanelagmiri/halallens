import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { translateDbText } from '../utils/dbTranslation.js';

const E_NUMBERS_DB = [
  { name: 'E120 Carmine', aliases: ['e120','carmine'], status: 'non-halal', source: 'Insect (Cochineal beetle)', reason: 'Red dye extracted from crushed insects; prohibited under major halal food standards.' },
  { name: 'E322 Lecithin', aliases: ['e322','lecithin','soy lecithin'], status: 'halal', source: 'Plant (Soybean / Sunflower)', reason: 'Plant-derived phospholipid emulsifier. Safe and halal.' },
  { name: 'E202 Potassium Sorbate', aliases: ['e202','potassium sorbate'], status: 'halal', source: 'Synthetic', reason: 'Synthetic potassium salt used as an organic food preservative. Halal.' },
  { name: 'E330 Citric Acid', aliases: ['e330','citric acid'], status: 'halal', source: 'Plant (Citrus fruits)', reason: 'Natural citrus acid preservative and flavor. 100% Halal.' },
  { name: 'E211 Sodium Benzoate', aliases: ['e211','sodium benzoate'], status: 'halal', source: 'Synthetic', reason: 'Chemical preservative commonly found in juices and soft drinks. Halal.' },
  { name: 'E150 Caramel Color', aliases: ['e150','caramel color'], status: 'halal', source: 'Plant / Sugar caramelization', reason: 'Brown coloring agent derived from heated carbohydrates. Halal.' },
  { name: 'E407 Carrageenan', aliases: ['e407','carrageenan'], status: 'halal', source: 'Plant (Red seaweed)', reason: 'Natural polysaccharide thickener derived from seaweeds. Halal.' },
  { name: 'E415 Xanthan Gum', aliases: ['e415','xanthan gum'], status: 'halal', source: 'Microbial fermentation', reason: 'Polysaccharide gum fermented from vegetable starches. Halal.' },
  { name: 'E621 MSG', aliases: ['e621','msg','monosodium glutamate'], status: 'halal', source: 'Plant fermentation', reason: 'Sodium salt of glutamic acid made from sugar beet fermentation. Halal.' },
  { name: 'E471 Emulsifier', aliases: ['e471','mono- and diglycerides'], status: 'uncertain', source: 'Animal / Plant lipids', reason: 'Glyceride emulsifier. High chance of being sourced from animal tallow unless specified vegetable origin.' },
  { name: 'E472a-f Esters', aliases: ['e472','e472a','e472e','fatty acid esters'], status: 'uncertain', source: 'Animal / Plant derivatives', reason: 'Derived from fatty acids; uncertain unless certified plant-derived.' },
  { name: 'E422 Glycerol', aliases: ['e422','glycerol','glycerin'], status: 'uncertain', source: 'Animal / Plant lipids', reason: 'Can be sourced from animal fats as a soap byproduct or palm/coconut oil.' },
  { name: 'E904 Shellac', aliases: ['e904','shellac'], status: 'uncertain', source: 'Insect secretion', reason: 'Exudate from lac bugs. Subject to scholastic differences; treated as uncertain.' },
  { name: 'E920 L-Cysteine', aliases: ['e920','l-cysteine','cysteine'], status: 'uncertain', source: 'Animal / Human hair / Synthetic', reason: 'Dough conditioner historically extracted from duck feathers or human hair. Halal only if synthetic.' },
  { name: 'E570 Stearic Acid', aliases: ['e570','stearic acid'], status: 'uncertain', source: 'Animal / Plant fat', reason: 'Saturated fatty acid extracted from tallow or vegetable butter.' },
];

export default function Directory() {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return E_NUMBERS_DB.filter(item => {
      const eCode = item.aliases.find(a => /^e\d+/i.test(a)) || item.name;
      const matchesSearch = !q ||
        eCode.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.source.toLowerCase().includes(q) ||
        item.aliases.some(a => a.toLowerCase().includes(q));
      const matchesFilter = filter === 'all' || item.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [query, filter]);

  const verdictLabel = (status) => {
    if (status === 'halal') return t('verdict.halal');
    if (status === 'non-halal') return t('verdict.nonHalal');
    return t('verdict.uncertain');
  };

  return (
    <div className="content-wrapper">
      <div className="directory-header">
        <h2>{t('directory.title')}</h2>
        <p>{t('directory.subtitle')}</p>
      </div>

      <div className="directory-controls">
        <div className="search-input-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" width="20" height="20">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
          </svg>
          <input
            type="text"
            className="directory-search"
            id="directory-search-input"
            placeholder={t('directory.searchPlaceholder')}
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        <div className="directory-filters" id="directory-filters">
          {['all','halal','non-halal','uncertain'].map(f => (
            <button
              key={f}
              className={`filter-btn${filter === f ? ' active' : ''}`}
              data-filter={f}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? t('directory.filterAll') :
               f === 'halal' ? t('directory.filterHalal') :
               f === 'non-halal' ? t('directory.filterNonHalal') :
               t('directory.filterUncertain')}
            </button>
          ))}
        </div>
      </div>

      <div className="directory-grid" id="directory-cards-container">
        {filtered.length === 0 ? (
          <div style={{ gridColumn:'1 / -1', textAlign:'center', padding:'40px', color:'var(--text-muted)' }}>
            {t('directory.noResults')}
          </div>
        ) : filtered.map((item, i) => {
          const eCode = item.aliases.find(a => /^e\d+/i.test(a)) || item.name;
          return (
            <div key={i} className={`enum-card ${item.status}`}>
              <div className="enum-card-header">
                <div className="enum-code">{eCode.toUpperCase()}</div>
                <span className={`analyzed-item-badge ${item.status}`}>{verdictLabel(item.status)}</span>
              </div>
              <div className="enum-name">{translateDbText(item.name, i18n.language)}</div>
              <div className="enum-source">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" width="14" height="14">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2.25m0 3.75h.008v.008H12v-.008zM12 21a9 9 0 100-18 9 9 0 000 18z" />
                </svg>
                {translateDbText(item.source, i18n.language)}
              </div>
              <div className="enum-desc">{translateDbText(item.reason, i18n.language)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

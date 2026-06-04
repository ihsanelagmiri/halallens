import React, { useEffect, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext.jsx';
import { getHistory, deleteHistoryEntry, clearHistory } from '../utils/storage.js';

export default function History() {
  const { t } = useTranslation();
  const { currentUser } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all|halal|non-halal|uncertain

  useEffect(() => {
    if (currentUser?.email) {
      console.log(`[History] Associating retrieval with user: ${currentUser.email}`);
      const h = getHistory(currentUser.email);
      // Sort newest first
      h.sort((a, b) => new Date(b.date) - new Date(a.date));
      console.log(`[History] Scans retrieved from storage for user ${currentUser.email}:`, h);
      setHistory(h);
    } else {
      console.log(`[History] No logged-in user. History list is cleared/empty.`);
      setHistory([]);
    }
  }, [currentUser]);

  const filtered = history.filter(entry => {
    const matchesSearch = entry.productName?.toLowerCase().includes(search.toLowerCase()) || entry.ocrText?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || entry.verdict?.toLowerCase() === filter;
    return matchesSearch && matchesFilter;
  });

  const handleDelete = (id) => {
    if (!currentUser?.email) return;
    deleteHistoryEntry(id, currentUser.email);
    setHistory(prev => prev.filter(e => e.id !== id));
  };

  const handleClear = () => {
    if (!currentUser?.email) return;
    clearHistory(currentUser.email);
    setHistory([]);
  };

  return (
    <div className="auth-page glass-card">
      <h2>{t('history.title')}</h2>
      <div className="history-controls">
        <input type="text" placeholder={t('history.searchPlaceholder')} value={search} onChange={e => setSearch(e.target.value)} className="history-search" />
        <select value={filter} onChange={e => setFilter(e.target.value)} className="history-filter">
          <option value="all">{t('history.all')}</option>
          <option value="halal">{t('history.halal')}</option>
          <option value="non-halal">{t('history.nonHalal')}</option>
          <option value="uncertain">{t('history.uncertain')}</option>
        </select>
        <button className="btn btn-danger" onClick={handleClear}>{t('history.clearAll')}</button>
      </div>
      <div className="history-list">
        {filtered.map(entry => (
          <a href={`#history/${entry.id}`} key={entry.id} className="history-item-link" style={{ textDecoration: 'none' }}>
            <div className="history-item glass-card">
              <img src={entry.thumbnail} alt="thumb" className="history-thumb" />
              <div className="history-info">
                <p><strong>{t('history.product')}: </strong>{entry.productName}</p>
                <p><strong>{t('history.verdict')}: </strong>{entry.verdict}</p>
                <p><strong>{t('history.date')}: </strong>{new Date(entry.date).toLocaleString()}</p>
              </div>
              <button className="btn btn-secondary" onClick={e => { e.preventDefault(); handleDelete(entry.id); }}>{t('history.delete')}</button>
            </div>
          </a>
        ))}
        {filtered.length === 0 && <p>{t('history.empty')}</p>}
      </div>
    </div>
  );
}

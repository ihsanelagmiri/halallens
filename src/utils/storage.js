export const USER_KEY = 'halal_user';
export const USERS_KEY = 'halal_users';
export const HISTORY_KEY = 'halal_history';
export const CONTACTS_KEY = 'halal_contacts';
export const REPORTS_KEY = 'halal_reports';

// User helpers
export const getAllUsers = () => {
  const raw = localStorage.getItem(USERS_KEY);
  return raw ? JSON.parse(raw) : [];
};
export const setAllUsers = (arr) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(arr));
};

// History helpers
export const getHistory = (userId) => {
  const raw = localStorage.getItem(HISTORY_KEY);
  const allHistory = raw ? JSON.parse(raw) : [];
  if (!userId) return allHistory;
  return allHistory.filter(h => h.userId === userId);
};
export const setHistory = (arr) => {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(arr));
};
export const addHistory = (entry, userId) => {
  if (!userId) return;
  const raw = localStorage.getItem(HISTORY_KEY);
  const allHistory = raw ? JSON.parse(raw) : [];
  allHistory.unshift({
    ...entry,
    userId,
    id: entry.id || Date.now().toString(),
    date: entry.date || new Date().toISOString()
  });
  setHistory(allHistory);
};
export const clearHistory = (userId) => {
  if (!userId) return;
  const raw = localStorage.getItem(HISTORY_KEY);
  const allHistory = raw ? JSON.parse(raw) : [];
  const remaining = allHistory.filter(h => h.userId !== userId);
  setHistory(remaining);
};
export const deleteHistoryEntry = (id, userId) => {
  if (!userId) return;
  const raw = localStorage.getItem(HISTORY_KEY);
  const allHistory = raw ? JSON.parse(raw) : [];
  const remaining = allHistory.filter(h => !(h.id === id && h.userId === userId));
  setHistory(remaining);
};

// Contact helpers
export const addContact = (contact) => {
  const list = JSON.parse(localStorage.getItem(CONTACTS_KEY) || '[]');
  list.push(contact);
  localStorage.setItem(CONTACTS_KEY, JSON.stringify(list));
};

// Report helpers
export const addReport = (report) => {
  const list = JSON.parse(localStorage.getItem(REPORTS_KEY) || '[]');
  list.push(report);
  localStorage.setItem(REPORTS_KEY, JSON.stringify(list));
};

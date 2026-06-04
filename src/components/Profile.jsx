import React, { useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext.jsx';
import { getHistory, clearHistory } from '../utils/storage.js';

export const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'uz', label: "O'zbekcha", flag: '🇺🇿' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' }
];

const SettingSection = ({ title, icon, children, className = '' }) => (
  <div className={`account-section glass-card ${className}`}>
    <h3>
      {icon}
      {title}
    </h3>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {children}
    </div>
  </div>
);

const SettingItem = ({ icon, title, description, action }) => (
  <div className="setting-item">
    <div className="setting-item-left">
      <div className="setting-icon">{icon}</div>
      <div className="setting-text">
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
    </div>
    <div className="setting-action">{action}</div>
  </div>
);

const ToggleSwitch = ({ checked, onChange }) => (
  <div className={`toggle-switch ${checked ? 'on' : ''}`} onClick={() => onChange(!checked)}>
    <div className="toggle-knob"></div>
  </div>
);

export default function Profile() {
  const { t, i18n } = useTranslation();
  const { currentUser, isAuthenticated, logout, updateUser, changePassword, deleteAccount } = useContext(AuthContext);

  // States
  const [stats, setStats] = useState({ total: 0, recent: 0, saved: 0 });
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') !== 'light';
  });
  const [defaultCamera, setDefaultCamera] = useState(() => {
    return localStorage.getItem('defaultScannerMode') === 'camera';
  });
  const [detailedExplanations, setDetailedExplanations] = useState(() => {
    const stored = localStorage.getItem('detailedExplanations');
    return stored ? stored === 'true' : true;
  });
  const [halalAuthority, setHalalAuthority] = useState(() => {
    return localStorage.getItem('preferredAuthority') || 'Global Standard';
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editLanguage, setEditLanguage] = useState('');
  const [editCurrentPassword, setEditCurrentPassword] = useState('');
  const [editNewPassword, setEditNewPassword] = useState('');
  const [editConfirmPassword, setEditConfirmPassword] = useState('');

  const handleChangePassword = async () => {
    if (editNewPassword !== editConfirmPassword) {
      alert(t('profile.alert.passwordsDoNotMatch', 'New passwords do not match'));
      return;
    }
    const result = changePassword(editCurrentPassword, editNewPassword);
    if (result.success) {
      alert(t('profile.alert.passwordUpdated', 'Password updated successfully'));
      setShowChangePasswordModal(false);
      setEditCurrentPassword('');
      setEditNewPassword('');
      setEditConfirmPassword('');
    } else {
      alert(t('profile.alert.passwordUpdateFailed', 'Failed to change password') + ': ' + (result.message || ''));
    }
  };
  
  const handleThemeChange = (isDark) => {
    setDarkMode(isDark);
    if (isDark) {
      document.body.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    }
  };

  // Load stats
  useEffect(() => {
    if (currentUser?.email) {
      const history = getHistory(currentUser.email);
      setStats({
        total: history.length,
        recent: history.filter(h => new Date(h.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
        saved: history.filter(h => h.verdict === 'Halal').length, // Assuming saved means halal
      });
    }
  }, [currentUser]);

  // Persist detailed explanations toggle
  useEffect(() => {
    localStorage.setItem('detailedExplanations', detailedExplanations);
  }, [detailedExplanations]);

  // Persist default scanner mode
  useEffect(() => {
    localStorage.setItem('defaultScannerMode', defaultCamera ? 'camera' : 'upload');
  }, [defaultCamera]);

  // Persist preferred authority
  useEffect(() => {
    localStorage.setItem('preferredAuthority', halalAuthority);
  }, [halalAuthority]);

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
  };

  const handleClearHistory = () => {
    if (window.confirm(t('profile.alert.confirmClearHistory', 'Are you sure you want to clear all your scan history?'))) {
      clearHistory(currentUser?.email);
      setStats({ total: 0, recent: 0, saved: 0 });
      alert(t('profile.alert.historyCleared', 'Scan history cleared.'));
    }
  };

  const handleLogout = () => {
    logout();
    window.location.hash = '#home';
  };

  const handleEditProfileOpen = () => {
    setEditName(currentUser.name);
    setEditLanguage(i18n.language);
    setShowEditModal(true);
  };

  const handleEditProfileSave = () => {
    updateUser(editName);
    changeLanguage(editLanguage);
    setShowEditModal(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="auth-page glass-card" style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center' }}>
        <h2>{t('profile.title', 'Account')}</h2>
        <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
          {t('profile.notLoggedIn', 'Please log in to manage your account and view your personalized dashboard.')}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <a href="#login" className="btn btn-primary">{t('nav.login')}</a>
          <a href="#register" className="btn btn-secondary">{t('nav.register')}</a>
        </div>
      </div>
    );
  }

  const userInitials = currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0,2) : 'U';

  return (
    <div className="account-container">
      {/* Profile Header */}
      <div className="account-header-card glass-card">
        <div className="account-avatar">
          {userInitials}
        </div>
        <div className="account-info">
          <h2>{currentUser.name}</h2>
          <p>{currentUser.email}</p>
          {currentUser.createdAt && (
            <p style={{ fontSize: '0.8rem', marginTop: '-8px' }}>
              {t('profile.joined', 'Joined')} {new Date(currentUser.createdAt).toLocaleDateString()}
            </p>
          )}
          <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }} onClick={handleEditProfileOpen}>
            {t('profile.btn.editProfile', 'Edit Profile')}
          </button>
        </div>
      </div>

      {/* Scan Activity Stats */}
      <SettingSection title={t('profile.scanActivity', 'Scan Activity')} icon={
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
      }>
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">{t('profile.totalProductsScanned', 'Total Products Scanned')}</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.recent}</span>
            <span className="stat-label">{t('profile.scansThisWeek', 'Scans This Week')}</span>
          </div>
          <div className="stat-card">
            <span className="stat-value" style={{ color: 'var(--verdict-halal)' }}>{stats.saved}</span>
            <span className="stat-label">{t('profile.halalProductsFound', 'Halal Products Found')}</span>
          </div>
        </div>
      </SettingSection>

      {/* Preferences */}
      <SettingSection title={t('profile.preferences', 'Preferences')} icon={
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>
      }>
        <SettingItem 
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>}
          title={t('profile.darkMode', 'Dark Mode')} description={t('profile.darkModeDesc', 'Toggle interface dark and light themes.')}
          action={<ToggleSwitch checked={darkMode} onChange={handleThemeChange} />}
        />
        <SettingItem 
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /></svg>}
          title={t('profile.defaultScannerMode', 'Default Scanner Mode')} description={t('profile.defaultScannerModeDesc', 'Choose the default tab when launching the scanner.')}
          action={
            <select value={defaultCamera ? 'camera' : 'upload'} onChange={(e) => setDefaultCamera(e.target.value === 'camera')}>
              <option value="upload">{t('profile.uploadFile', 'Upload File')}</option>
              <option value="camera">{t('profile.camera', 'Camera')}</option>
            </select>
          }
        />
        <SettingItem 
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" /></svg>}
          title={t('profile.appLanguage', 'App Language')} description={t('profile.appLanguageDesc', 'Choose your preferred language for the application.')}
          action={
            <select value={i18n.language} onChange={(e) => changeLanguage(e.target.value)}>
              {LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.flag} {lang.label}</option>
              ))}
            </select>
          }
        />
      </SettingSection>

      {/* Halal Settings */}
      <SettingSection title={t('profile.halalSettings', 'Halal Settings')} icon={
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" /></svg>
      }>
        <SettingItem 
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" /></svg>}
          title={t('profile.preferredAuthority', 'Preferred Authority')} description={t('profile.preferredAuthorityDesc', 'Choose your preferred Halal certification standards.')}
          action={
            <select value={halalAuthority} onChange={(e) => setHalalAuthority(e.target.value)}>
              <option value="Global Standard">Global Standard</option>
              <option value="JAKIM (Malaysia)">JAKIM (Malaysia)</option>
              <option value="MUI (Indonesia)">MUI (Indonesia)</option>
              <option value="KMF (Korea)">KMF (Korea)</option>
            </select>
          }
        />
        <SettingItem 
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" /></svg>}
          title={t('profile.detailedExplanations', 'Detailed Explanations')} description={t('profile.detailedExplanationsDesc', 'Show detailed Islamic rulings and ingredient descriptions.')}
          action={<ToggleSwitch checked={detailedExplanations} onChange={setDetailedExplanations} />}
        />
      </SettingSection>

      {/* Security */}
      <SettingSection title={t('profile.security', 'Security')} icon={
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
      }>
        <SettingItem 
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>}
          title={t('profile.changePassword', 'Change Password')} description={t('profile.changePasswordDesc', 'Update your account security password.')}
          action={
            <button className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.85rem' }} onClick={() => setShowChangePasswordModal(true)}>{t('profile.btn.update', 'Update')}</button>
          }
        />
        <SettingItem 
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>}
          title={t('profile.signOut', 'Sign Out')} description={t('profile.signOutDesc', 'Sign out of your current session.')}
          action={<button className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.85rem' }} onClick={handleLogout}>{t('profile.btn.signOut', 'Sign Out')}</button>}
        />
      </SettingSection>

      {/* Data & Privacy */}
      <SettingSection title={t('profile.dataPrivacy', 'Data & Privacy')} icon={
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.375c.621 0 1.125-.504 1.125-1.125V13.5H9m-3 6.75h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" /></svg>
      }>
        <SettingItem 
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>}
          title={t('profile.clearScanHistory', 'Clear Scan History')} description={t('profile.clearScanHistoryDesc', 'Permanently delete all your local scan entries.')}
          action={<button className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.85rem' }} onClick={handleClearHistory}>{t('profile.btn.clear', 'Clear')}</button>}
        />
        <SettingItem 
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>}
          title={t('profile.privacyPolicy', 'Privacy Policy')} description={t('profile.privacyPolicyDesc', 'Review how we handle and protect your personal information.')}
          action={
            <a href="#privacy" className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.85rem', textDecoration: 'none' }}>{t('profile.btn.view', 'View')}</a>
          }
        />
      </SettingSection>

      {/* Support & Feedback */}
      <SettingSection title={t('profile.supportFeedback', 'Support & Feedback')} icon={
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.43 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" /></svg>
      }>
        <SettingItem 
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>}
          title={t('profile.contactSupport', 'Contact Support')} description={t('profile.contactSupportDesc', 'Need help? Send us a direct message.')}
          action={<a href="#contact" className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.85rem', textDecoration: 'none' }}>{t('profile.btn.contact', 'Contact')}</a>}
        />
        <SettingItem 
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
          title={t('profile.reportIncorrect', 'Report Incorrect Classification')} description={t('profile.reportIncorrectDesc', 'Help us correct mistakes in product ingredient statuses.')}
          action={<a href="#report" className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.85rem', textDecoration: 'none' }}>{t('profile.btn.report', 'Report')}</a>}
        />
      </SettingSection>

      {/* About */}
      <SettingSection title={t('profile.about', 'About')} icon={
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
      }>
        <SettingItem 
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" /></svg>}
          title={t('profile.appVersion', 'App Version')} description={t('profile.appVersionDesc', 'Check current software deployment version.')}
          action={<span style={{ color: 'var(--text-muted)' }}>{t('profile.versionStatus', 'Up to date')}</span>}
        />
      </SettingSection>

      {/* Danger Zone */}
      <SettingSection title={t('profile.dangerZone', 'Danger Zone')} className="danger-zone" icon={
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
      }>
        <SettingItem 
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>}
          title={t('profile.deleteAccount', 'Delete Account')} description={t('profile.deleteAccountDesc', 'Permanently delete your profile and all associated data.')}
          action={<button className="btn danger-btn" style={{ padding: '6px 14px', fontSize: '0.85rem' }} onClick={() => setShowDeleteModal(true)}>{t('profile.btn.delete', 'Delete')}</button>}
        />
      </SettingSection>

      {/* Delete/Deactivate Confirmation Modal */}
      {showDeleteModal && (
        <div className="archive-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="archive-modal glass-card" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '16px', color: 'var(--danger)' }}>{t('profile.modal.areYouSure', 'Are you sure?')}</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              {t('profile.modal.deleteConfirmDesc', 'This action is destructive and cannot be undone. All your personal data and scan history will be permanently deleted.')}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '24px' }}>
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>{t('profile.btn.cancel', 'Cancel')}</button>
              <button className="btn btn-danger" onClick={() => {
                const res = deleteAccount();
                if (res.success) {
                  alert(t('profile.alert.accountDeleted', 'Account deleted.'));
                  setShowDeleteModal(false);
                  window.location.hash = '#home';
                }
              }}>{t('profile.btn.confirm', 'Confirm')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="archive-overlay" onClick={() => setShowChangePasswordModal(false)}>
          <div className="archive-modal glass-card" onClick={e => e.stopPropagation()} style={{ textAlign: 'left', minWidth: '320px' }}>
            <h3 style={{ marginBottom: '20px' }}>{t('profile.modal.changePassword', 'Change Password')}</h3>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t('profile.modal.currentPassword', 'Current Password')}</label>
              <input type="password" value={editCurrentPassword} onChange={e => setEditCurrentPassword(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t('profile.modal.newPassword', 'New Password')}</label>
              <input type="password" value={editNewPassword} onChange={e => setEditNewPassword(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t('profile.modal.confirmNewPassword', 'Confirm New Password')}</label>
              <input type="password" value={editConfirmPassword} onChange={e => setEditConfirmPassword(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn btn-secondary" onClick={() => setShowChangePasswordModal(false)}>{t('profile.btn.cancel', 'Cancel')}</button>
              <button className="btn btn-primary" onClick={handleChangePassword}>{t('profile.btn.save', 'Save')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="archive-overlay" onClick={() => setShowEditModal(false)}>
          <div className="archive-modal glass-card" onClick={e => e.stopPropagation()} style={{ textAlign: 'left', minWidth: '320px' }}>
            <h3 style={{ marginBottom: '20px' }}>{t('profile.modal.editProfile', 'Edit Profile')}</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t('profile.modal.displayName', 'Display Name')}</label>
              <input 
                type="text" 
                value={editName} 
                onChange={e => setEditName(e.target.value)} 
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              />
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t('profile.modal.emailReadOnly', 'Email (Read-only)')}</label>
              <input 
                type="email" 
                value={currentUser.email} 
                readOnly
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-muted)', cursor: 'not-allowed' }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t('profile.modal.preferredLanguage', 'Preferred Language')}</label>
              <select 
                value={editLanguage} 
                onChange={e => setEditLanguage(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.flag} {lang.label}</option>
                ))}
              </select>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>{t('profile.btn.cancel', 'Cancel')}</button>
              <button className="btn btn-primary" onClick={handleEditProfileSave}>{t('profile.btn.saveChanges', 'Save Changes')}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

import React, { useState, useEffect, useRef, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from './context/AuthContext.jsx';
import Home from './components/Home.jsx';
import Scanner from './components/Scanner.jsx';
import Directory from './components/Directory.jsx';
import Contamination from './components/Contamination.jsx';
import Knowledge from './components/Knowledge.jsx';
import History from './components/History.jsx';
import HistoryDetail from './components/HistoryDetail.jsx';
import ContactUs from './components/ContactUs.jsx';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import Report from './components/Report.jsx';
import Profile from './components/Profile.jsx';
import MosqueFinder from './components/MosqueFinder.jsx';
import Restaurants from './components/Restaurants.jsx';
import PrivacyPolicy from './components/PrivacyPolicy.jsx';


export default function App() {
  const { t, i18n } = useTranslation();
  const { currentUser, isAuthenticated, logout } = useContext(AuthContext);
  const [currentView, setCurrentView] = useState('home');
  const [showLoader, setShowLoader] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle hash routing
  useEffect(() => {
    const handleRoute = () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      setCurrentView(hash);
      window.scrollTo({ top: 0, behavior: 'instant' });
      setMobileMenuOpen(false);
    };
    window.addEventListener('hashchange', handleRoute);
    handleRoute();
    return () => window.removeEventListener('hashchange', handleRoute);
  }, []);

  // Loading screen
  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  // Theme initialization
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }, []);



  // navItems used for mobile menu (hamburger)
  const navItems = [
    { id: 'home', label: t('nav.home'), icon: (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/></svg>) },
    { id: 'profile', label: t('nav.profile', 'Profile'), icon: (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>) }
  ];

  const renderView = () => {
    // Handle detailed history view via hash like #history/<id>
    if (currentView.startsWith('history/')) {
      const entryId = currentView.split('/')[1];
      return <HistoryDetail entryId={entryId} />;
    }
    switch (currentView) {
      case 'scanner': return <Scanner />;
      case 'enum': return <Directory />;
      case 'contamination': return <Contamination />;
      case 'knowledge': return <Knowledge />;
      case 'history': return <History />;
      case 'contact': return <ContactUs />;
      case 'report': return <Report />;
      case 'profile': return <Profile />;
      case 'mosques': return <MosqueFinder />;
      case 'restaurants': return <Restaurants />;
      case 'privacy': return <PrivacyPolicy />;
      case 'login': return <Login />;
      case 'register': return <Register />;
      case 'logout':
        logout();
        window.location.hash = '#home';
        return <Home />;
      default: return <Home />;
    }
  };

  return (
    <>
      {/* Loading Screen */}
      <div id="loading-screen" className={showLoader ? '' : 'fade-out'}>
        <div className="loader-container">
          <div className="loader-lens"></div>
          <h1 className="loader-title">HalalLens</h1>
          <span className="loader-tagline">{t('loader.tagline')}</span>
          <div className="loader-progress-bar"><div className="loader-progress"></div></div>
        </div>
      </div>

      {/* Header */}
      <header>
        <div className="navbar-container">
          <a href="#home" className="logo-link" id="nav-brand-logo">
            <div className="logo-icon"></div>
            <span className="brand-name">HalalLens</span>
            <div className="mobile-header-title">HalalLens</div>
          </a>


          {/* Hamburger */}
          <button className="mobile-menu-btn" id="mobile-menu-btn" aria-label="Toggle menu" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
          </button>
          <ul className={`nav-menu mobile-only${mobileMenuOpen ? ' open' : ''}`} id="nav-menu">
            {navItems.map(item => (
              <li key={item.id}>
                <a href={`#${item.id}`} className={`nav-link${currentView === item.id ? ' active' : ''}`} data-target={item.id}>
                  {item.icon}{item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <section className="view-section active">
          {renderView()}
        </section>
      </main>

      {/* Footer */}
      <footer>
        <div className="content-wrapper" style={{ padding: '0 24px' }}>
          <div className="footer-grid">
            <div className="footer-brand">
              <h3>HalalLens</h3>
              <p>{t('footer.desc')}</p>
            </div>
            <div className="footer-links">
              <h4>{t('footer.navTitle')}</h4>
              <ul>
                <li><a href="#home">{t('nav.home')}</a></li>
                <li><a href="#scanner">{t('nav.scanner')}</a></li>
                <li><a href="#enum">{t('nav.eNumbers')}</a></li>
                <li><a href="#contamination">{t('nav.contamination')}</a></li>
                <li><a href="#privacy">{t('profile.privacyPolicy', 'Privacy Policy')}</a></li>
              </ul>
            </div>
            <div className="footer-links">
              <h4>{t('footer.resourcesTitle')}</h4>
              <ul>
                <li><a href="#knowledge">{t('footer.islamicGuide')}</a></li>
                <li><a href="https://www.halalcertification.ie/halal-food-guidelines/" target="_blank" rel="noreferrer">{t('footer.globalStandards')}</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>{t('footer.rights')}</p>
            <p>{t('footer.pwa')}</p>
          </div>
        </div>
      </footer>
    </>
  );
}

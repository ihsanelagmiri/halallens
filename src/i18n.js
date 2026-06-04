import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from './locales/en/translation.json';
import koTranslation from './locales/ko/translation.json';
import arTranslation from './locales/ar/translation.json';
import uzTranslation from './locales/uz/translation.json';
import trTranslation from './locales/tr/translation.json';

const STORAGE_KEY = 'halallens_lang';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      ko: { translation: koTranslation },
      ar: { translation: arTranslation },
      uz: { translation: uzTranslation },
      tr: { translation: trTranslation },
    },
    lng: localStorage.getItem(STORAGE_KEY) || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage'],
      lookupLocalStorage: STORAGE_KEY,
      caches: ['localStorage'],
    },
  });

i18n.on('languageChanged', (lng) => {
  localStorage.setItem(STORAGE_KEY, lng);
  // Set RTL for Arabic
  document.documentElement.setAttribute('dir', lng === 'ar' ? 'rtl' : 'ltr');
  document.documentElement.setAttribute('lang', lng);
});

// Set initial direction
const savedLang = localStorage.getItem(STORAGE_KEY) || 'en';
document.documentElement.setAttribute('dir', savedLang === 'ar' ? 'rtl' : 'ltr');
document.documentElement.setAttribute('lang', savedLang);

export default i18n;

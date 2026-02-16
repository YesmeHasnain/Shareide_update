import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './en';
import ur from './ur';

const translations = { en, ur };
const LANGUAGE_KEY = 'app_language';

const I18nContext = createContext();

export const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', rtl: false },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', rtl: true },
];

export const I18nProvider = ({ children }) => {
  const [locale, setLocale] = useState('en');
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (saved && translations[saved]) {
        setLocale(saved);
        setIsRTL(LANGUAGES.find(l => l.code === saved)?.rtl || false);
      }
    } catch (e) { /* default to en */ }
  };

  const changeLanguage = useCallback(async (langCode) => {
    if (translations[langCode]) {
      setLocale(langCode);
      setIsRTL(LANGUAGES.find(l => l.code === langCode)?.rtl || false);
      await AsyncStorage.setItem(LANGUAGE_KEY, langCode);
    }
  }, []);

  const t = useCallback((key) => {
    return translations[locale]?.[key] || translations.en?.[key] || key;
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, isRTL, t, changeLanguage, LANGUAGES }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    // Fallback if used outside provider
    return {
      locale: 'en',
      isRTL: false,
      t: (key) => en[key] || key,
      changeLanguage: () => {},
      LANGUAGES,
    };
  }
  return context;
};

export default { I18nProvider, useI18n, LANGUAGES };

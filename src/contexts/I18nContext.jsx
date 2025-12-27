import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import csTranslations from '../i18n/cs.json'
import enTranslations from '../i18n/en.json'

const STORAGE_KEY = 'shoppingListLanguage'

const translations = {
  en: enTranslations,
  cs: csTranslations,
}

function getStoredLanguage() {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return null
  }
  try {
    return window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function getLanguage() {
  const stored = getStoredLanguage()
  if (stored && translations[stored]) {
    return stored
  }
  if (typeof navigator !== 'undefined' && navigator.language) {
    const normalized = navigator.language.toLowerCase()
    if (normalized.startsWith('cs')) {
      return 'cs'
    }
  }
  return 'en'
}

function resolveValue(dictionary, path) {
  return path.split('.').reduce((acc, key) => (acc && acc[key] ? acc[key] : null), dictionary)
}

function interpolate(template, vars) {
  if (!vars) return template
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const value = vars[key]
    return value === undefined || value === null ? '' : String(value)
  })
}

function translate(language, key, vars) {
  const dictionary = translations[language] || translations.en
  const fallbackDictionary = translations.en
  const message = resolveValue(dictionary, key) || resolveValue(fallbackDictionary, key) || key
  if (typeof message === 'string') {
    return interpolate(message, vars)
  }
  return key
}

export const I18nContext = createContext({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
})

export function I18nProvider({ children }) {
  const [language, setLanguage] = useState(getLanguage)

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language
    }
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_KEY, language)
      } catch {
        // ignore storage errors
      }
    }
  }, [language])

  const setLanguageSafe = useCallback((next) => {
    if (translations[next]) {
      setLanguage(next)
    }
  }, [])

  const t = useCallback((key, vars) => translate(language, key, vars), [language])

  const value = useMemo(
    () => ({
      language,
      setLanguage: setLanguageSafe,
      t,
    }),
    [language, setLanguageSafe, t],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

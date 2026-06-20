import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, detectLocale, isAppLocale } from '../i18n/config'
import type { AppLocale } from '../i18n/config'
import { translate } from '../i18n/messages'
import type { MessageKey } from '../i18n/messages'

export function useAppI18n() {
  const locale = useState<AppLocale>('app-locale', () => {
    if (!import.meta.client) return DEFAULT_LOCALE
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY)
    return isAppLocale(saved) ? saved : detectLocale(navigator.language)
  })

  const t = (key: MessageKey, params?: Record<string, string | number>) =>
    translate(locale.value, key, params)

  function applyLocale() {
    if (!import.meta.client) return
    document.documentElement.lang = locale.value
  }

  function setLocale(value: AppLocale) {
    locale.value = value
    if (import.meta.client) localStorage.setItem(LOCALE_STORAGE_KEY, value)
    applyLocale()
  }

  function init() {
    if (!import.meta.client) return
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY)
    locale.value = isAppLocale(saved) ? saved : detectLocale(navigator.language)
    applyLocale()
  }

  function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(locale.value, options).format(value)
  }

  return { locale, t, setLocale, init, formatNumber }
}

export type AppLocale = 'pt-BR' | 'en' | 'ja'

export const DEFAULT_LOCALE: AppLocale = 'pt-BR'
export const LOCALE_STORAGE_KEY = 'retrodex:locale'

export const LOCALE_OPTIONS: ReadonlyArray<{ value: AppLocale, label: string }> = [
  { value: 'pt-BR', label: '🇧🇷 Português' },
  { value: 'en', label: '🇺🇸 English' },
  { value: 'ja', label: '🇯🇵 日本語' }
]

export const POKEAPI_LANGUAGE_CHAIN: Record<AppLocale, readonly string[]> = {
  'pt-BR': ['pt-br', 'en'],
  en: ['en'],
  ja: ['ja', 'ja-hrkt', 'en']
}

export function isAppLocale(value: unknown): value is AppLocale {
  return value === 'pt-BR' || value === 'en' || value === 'ja'
}

export function detectLocale(language: string | undefined): AppLocale {
  const normalized = language?.toLowerCase() ?? ''
  if (normalized.startsWith('ja')) return 'ja'
  if (normalized.startsWith('en')) return 'en'
  return DEFAULT_LOCALE
}

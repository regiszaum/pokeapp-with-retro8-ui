export type ThemeMode = 'dark' | 'light'
export type ColorVision = 'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia'

const STORAGE_KEY = 'retrodex:theme'
const VISION_KEY = 'retrodex:color-vision'

export function useTheme() {
  const mode = useState<ThemeMode>('theme-mode', () => 'dark')
  const colorVision = useState<ColorVision>('color-vision', () => 'normal')

  function applyTheme() {
    const root = document.documentElement
    root.setAttribute('data-theme', mode.value)
    root.setAttribute('data-color-vision', colorVision.value)
  }

  function setMode(value: ThemeMode) {
    mode.value = value
    localStorage.setItem(STORAGE_KEY, value)
    applyTheme()
  }

  function setColorVision(value: ColorVision) {
    colorVision.value = value
    localStorage.setItem(VISION_KEY, value)
    applyTheme()
  }

  function init() {
    const savedMode = localStorage.getItem(STORAGE_KEY) as ThemeMode | null
    const savedVision = localStorage.getItem(VISION_KEY) as ColorVision | null
    if (savedMode) mode.value = savedMode
    if (savedVision) colorVision.value = savedVision
    applyTheme()
  }

  return { mode, colorVision, setMode, setColorVision, init }
}

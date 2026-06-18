export {}

declare global {
  interface Window {
    Retro8UI?: {
      init?: (root?: Document | HTMLElement) => void
      refresh?: (root?: Document | HTMLElement) => void
    }
  }
}

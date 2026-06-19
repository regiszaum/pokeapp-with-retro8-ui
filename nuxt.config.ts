const baseURL = process.env.NUXT_APP_BASE_URL || '/'
const publicAsset = (path: string) => `${baseURL.endsWith('/') ? baseURL : `${baseURL}/`}${path}`

export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: '2026-06-18',
  css: ['retro8-ui/retro8.css', '~/assets/css/main.css'],
  devtools: { enabled: process.env.NODE_ENV !== 'production' },
  modules: [],
  app: {
    baseURL,
    head: {
      link: [
        { rel: 'icon', href: publicAsset('favicon.ico'), sizes: 'any' },
        { rel: 'icon', type: 'image/png', href: publicAsset('favicon-32x32.png'), sizes: '32x32' },
        { rel: 'icon', type: 'image/png', href: publicAsset('favicon-16x16.png'), sizes: '16x16' },
        { rel: 'apple-touch-icon', href: publicAsset('apple-touch-icon.png'), sizes: '180x180' },
        { rel: 'manifest', href: publicAsset('site.webmanifest') },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400..700&display=swap' }
      ]
    }
  },
  typescript: {
    strict: true,
    typeCheck: true
  }
})

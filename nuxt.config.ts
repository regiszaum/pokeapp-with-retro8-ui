export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: '2026-06-18',
  css: ['retro8-ui/retro8.css', '~/assets/css/main.css'],
  devtools: { enabled: process.env.NODE_ENV !== 'production' },
  modules: [],
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/',
    head: {
      link: [
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

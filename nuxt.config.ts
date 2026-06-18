export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: '2026-06-18',
  css: ['retro8-ui/retro8.css', '~/assets/css/main.css'],
  devtools: { enabled: process.env.NODE_ENV !== 'production' },
  modules: [],
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/'
  },
  typescript: {
    strict: true,
    typeCheck: true
  }
})

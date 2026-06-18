import 'retro8-ui/retro8.js'

export default defineNuxtPlugin((nuxtApp) => {
  const refreshRetro8 = () => {
    window.Retro8UI?.refresh?.()
  }

  nuxtApp.hook('page:finish', () => {
    requestAnimationFrame(refreshRetro8)
  })

  requestAnimationFrame(refreshRetro8)
})

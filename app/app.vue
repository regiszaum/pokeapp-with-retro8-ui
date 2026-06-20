<template>
  <div class="dex-app">
    <header class="dex-topbar">
      <nav class="r8-navbar" :class="{ 'r8-navbar--dark': themeMode === 'dark' }" data-r8-expand="always" :aria-label="t('nav.label')">
        <div class="r8-navbar__container dex-navbar__container">
          <NuxtLink class="r8-navbar__brand dex-brand" to="/">
            <span class="dex-brand__mark" aria-hidden="true">
              <img class="dex-brand__logo" :src="retrodexLogo" alt="" width="562" height="562">
            </span>
            <span>RetroDex</span>
          </NuxtLink>
          <div id="dex-navbar-menu" class="r8-navbar__collapse">
            <ul class="r8-navbar__menu">
              <li><NuxtLink class="r8-navbar__item" to="/">{{ t('nav.pokedex') }}</NuxtLink></li>
              <li><NuxtLink class="r8-navbar__item" to="/localizacoes">{{ t('nav.locations') }}</NuxtLink></li>
              <li><NuxtLink class="r8-navbar__item" to="/sobre">{{ t('nav.about') }}</NuxtLink></li>
            </ul>
            <div class="r8-navbar__actions">
              <LanguageSelector />
              <ThemeSelector />
            </div>
          </div>
        </div>
      </nav>
      <MusicPlayer />
    </header>

    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import retrodexLogo from '~/assets/png/retrodex.png'

const { mode: themeMode, init: initTheme } = useTheme()
const { locale, t, init: initLocale } = useAppI18n()

useHead(() => ({
  title: 'Retrodex',
  meta: [{ name: 'description', content: t('meta.description') }],
  htmlAttrs: { lang: locale.value, 'data-theme': themeMode.value }
}))

onMounted(() => {
  initTheme()
  initLocale()
})
</script>

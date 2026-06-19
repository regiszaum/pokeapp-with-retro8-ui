<template>
  <div class="dex-app">
    <header class="dex-topbar">
      <nav class="r8-navbar" :class="{ 'r8-navbar--dark': themeMode === 'dark' }" data-r8-expand="always" aria-label="Navegação principal da Pokedex">
        <div class="r8-navbar__container dex-navbar__container">
          <NuxtLink class="r8-navbar__brand dex-brand" to="/">
            <span class="dex-brand__mark" aria-hidden="true">
              <img class="dex-brand__logo" :src="retrodexLogo" alt="" width="562" height="562">
            </span>
            <span>RetroDex</span>
          </NuxtLink>
          <div id="dex-navbar-menu" class="r8-navbar__collapse">
            <ul class="r8-navbar__menu">
              <li><NuxtLink class="r8-navbar__item" to="/">Pokedex</NuxtLink></li>
              <li><NuxtLink class="r8-navbar__item" to="/sobre">Sobre</NuxtLink></li>
            </ul>
            <div class="r8-navbar__actions">
              <ThemeSelector />
            </div>
          </div>
        </div>
      </nav>
    </header>

    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import retrodexLogo from '~/assets/png/retrodex.png'

const { mode: themeMode } = useTheme()

useHead({
  title: 'Retrodex',
  meta: [{ name: 'description', content: 'Pokedex profissional em Nuxt 4, Retro8 UI e PokeAPI.' }],
  htmlAttrs: { 'data-theme': themeMode }
})

onMounted(() => {
  useTheme().init()
})
</script>

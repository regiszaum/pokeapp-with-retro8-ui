<template>
  <div class="dex-app">
    <header class="dex-topbar">
      <nav class="r8-navbar" :class="{ 'r8-navbar--dark': themeMode === 'dark' }" data-r8-expand="always" aria-label="Navegação principal da Pokedex">
        <div class="r8-navbar__container dex-navbar__container">
          <NuxtLink class="r8-navbar__brand dex-brand" to="/">
            <span class="dex-brand__mark" aria-hidden="true">
              <Compass class="pokemon-icon" />
            </span>
            <span>RetroDex Pro</span>
          </NuxtLink>
          <div id="dex-navbar-menu" class="r8-navbar__collapse">
            <ul class="r8-navbar__menu">
              <li><NuxtLink class="r8-navbar__item" to="/">Pokedex</NuxtLink></li>
              <li><a class="r8-navbar__item" href="/#generations">Gerações</a></li>
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
import { Compass } from '@lucide/vue'

const { mode: themeMode } = useTheme()

useHead({
  title: 'RetroDex Pro',
  meta: [{ name: 'description', content: 'Pokedex profissional em Nuxt 4, Retro8 UI e PokeAPI.' }],
  htmlAttrs: { 'data-theme': themeMode }
})

onMounted(() => {
  useTheme().init()
})
</script>

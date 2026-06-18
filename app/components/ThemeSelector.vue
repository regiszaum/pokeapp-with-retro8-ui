<template>
  <div class="theme-selector">
    <button
      class="r8-btn r8-btn--sm r8-btn--secondary theme-selector__toggle"
      type="button"
      aria-label="Alternar tema claro/escuro"
      :title="mode === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'"
      @click="setMode(mode === 'dark' ? 'light' : 'dark')"
    >
      <Sun v-if="mode === 'dark'" class="pokemon-icon" aria-hidden="true" />
      <Moon v-else class="pokemon-icon" aria-hidden="true" />
    </button>
    <select
      class="theme-selector__select"
      :value="colorVision"
      aria-label="Modo de visão de cor"
      @change="setColorVision(($event.target as HTMLSelectElement).value as ColorVision)"
    >
      <option value="normal">👁 Normal</option>
      <option value="protanopia">Protanopia</option>
      <option value="deuteranopia">Deuteranopia</option>
      <option value="tritanopia">Tritanopia</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { Moon, Sun } from '@lucide/vue'
import type { ColorVision } from '../composables/useTheme'

const { mode, colorVision, setMode, setColorVision } = useTheme()
</script>

<style scoped>
.theme-selector {
  align-items: center;
  display: flex;
  gap: 0.5rem;
}

.theme-selector__select {
  appearance: none;
  background: transparent url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23999'/%3E%3C/svg%3E") no-repeat right 0.4rem center;
  border: 2px solid var(--dex-line);
  color: var(--dex-ink);
  font: inherit;
  font-size: 0.75rem;
  height: 2rem;
  padding: 0 1.4rem 0 0.4rem;
}
</style>

<template>
  <div class="theme-selector">
    <button
      class="r8-btn r8-btn--sm r8-btn--secondary theme-selector__toggle"
      type="button"
      :aria-label="t('theme.toggle')"
      :title="mode === 'dark' ? t('theme.toLight') : t('theme.toDark')"
      @click="setMode(mode === 'dark' ? 'light' : 'dark')"
    >
      <PixelIcon v-if="mode === 'dark'" class="pokemon-icon" name="sun" />
      <PixelIcon v-else class="pokemon-icon" name="moon" />
    </button>
    <RetroSelect
      class="theme-selector__select"
      :model-value="colorVision"
      :options="colorVisionOptions"
      :accessible-label="t('theme.colorVision')"
      compact
      @update:model-value="updateColorVision"
    />
  </div>
</template>

<script setup lang="ts">
import type { ColorVision } from '../composables/useTheme'

const { mode, colorVision, setMode, setColorVision } = useTheme()
const { t } = useAppI18n()

const colorVisionOptions = computed(() => [
  { value: 'normal', label: t('theme.normal') },
  { value: 'protanopia', label: 'Protanopia' },
  { value: 'deuteranopia', label: 'Deuteranopia' },
  { value: 'tritanopia', label: 'Tritanopia' }
])

function updateColorVision(value: string | number) {
  setColorVision(String(value) as ColorVision)
}
</script>

<style scoped>
.theme-selector {
  align-items: center;
  display: flex;
  gap: 0.5rem;
}

.theme-selector__select {
  min-width: 9.5rem;
}
</style>

<template>
  <RetroSelect
    class="language-selector"
    :model-value="locale"
    :options="LOCALE_OPTIONS"
    :accessible-label="t('language.select')"
    compact
    @update:model-value="updateLocale"
  />
</template>

<script setup lang="ts">
import { LOCALE_OPTIONS, isAppLocale } from '../i18n/config'

const { locale, setLocale, t } = useAppI18n()

function updateLocale(value: string | number) {
  if (isAppLocale(value)) setLocale(value)
}
</script>

<style scoped>
.language-selector {
  min-width: 8.75rem;
}
</style>

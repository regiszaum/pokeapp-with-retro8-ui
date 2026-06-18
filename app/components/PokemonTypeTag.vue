<template>
  <span class="r8-badge type-chip" :class="`type-chip--${type}`">
    {{ formatName(type) }}
  </span>
</template>

<script setup lang="ts">
defineProps<{
  type: string
}>()
</script>

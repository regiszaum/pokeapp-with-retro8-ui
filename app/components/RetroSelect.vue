<template>
  <div
    :key="optionsKey"
    ref="root"
    class="r8-select app-select"
    :class="{ 'app-select--compact': compact }"
    :data-r8-value="String(modelValue)"
  >
    <button class="r8-select__trigger" type="button" :aria-label="accessibleLabel">
      <span data-r8-choice-display>{{ selectedOption?.label ?? placeholder }}</span>
      <span class="r8-choice__caret" aria-hidden="true">&gt;</span>
    </button>

    <div class="r8-select__menu" hidden>
      <button
        v-for="option in options"
        :key="String(option.value)"
        class="r8-select__option"
        :class="{ 'is-selected': valuesMatch(option.value, modelValue) }"
        type="button"
        :data-r8-value="String(option.value)"
        :disabled="option.disabled"
        :aria-disabled="option.disabled ? 'true' : undefined"
        :aria-selected="valuesMatch(option.value, modelValue) ? 'true' : 'false'"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface RetroSelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

const props = withDefaults(defineProps<{
  modelValue: string | number
  options: readonly RetroSelectOption[]
  accessibleLabel: string
  placeholder?: string
  compact?: boolean
}>(), {
  placeholder: 'Selecione',
  compact: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const root = ref<HTMLElement | null>(null)

const selectedOption = computed(() =>
  props.options.find((option) => valuesMatch(option.value, props.modelValue))
)

const optionsKey = computed(() =>
  props.options.map((option) => `${option.value}:${option.label}:${option.disabled ?? false}`).join('|')
)

let refreshFrame: number | undefined

function valuesMatch(left: string | number, right: string | number): boolean {
  return String(left) === String(right)
}

function handleChoiceChange(event: Event): void {
  const value = (event as CustomEvent<{ value?: string }>).detail?.value
  const option = props.options.find((item) => String(item.value) === value)

  if (option && !option.disabled) emit('update:modelValue', option.value)
}

function syncDisplay(element = root.value): void {
  const display = element?.querySelector<HTMLElement>('[data-r8-choice-display]')
  if (display) display.textContent = selectedOption.value?.label ?? props.placeholder
}

watch(root, (current, previous) => {
  previous?.removeEventListener('r8:choice-change', handleChoiceChange)

  if (refreshFrame !== undefined) cancelAnimationFrame(refreshFrame)
  if (!current) return

  current.addEventListener('r8:choice-change', handleChoiceChange)
  refreshFrame = requestAnimationFrame(() => {
    window.Retro8UI?.refresh?.(current.parentElement ?? document)
    syncDisplay(current)
  })
}, { flush: 'post' })

watch([
  () => props.modelValue,
  () => selectedOption.value?.label
], async () => {
  await nextTick()
  syncDisplay()
}, { flush: 'post' })

onBeforeUnmount(() => {
  if (refreshFrame !== undefined) cancelAnimationFrame(refreshFrame)
  root.value?.removeEventListener('r8:choice-change', handleChoiceChange)
})
</script>

<style scoped>
.app-select {
  min-width: 0;
}

.r8-select__trigger {
  min-width: 0;
  width: 100%;
}

[data-r8-choice-display] {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-select--compact .r8-select__trigger {
  font-size: 0.75rem;
  min-height: 2rem;
  padding: 0.35rem 0.5rem;
}

.app-select--compact .r8-select__menu {
  left: auto;
  min-width: 11rem;
  right: 0;
}

.app-select--compact .r8-select__option {
  font-size: 0.75rem;
  min-height: 2rem;
  padding: 0.5rem;
}
</style>

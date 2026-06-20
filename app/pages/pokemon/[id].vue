<template>
  <main class="dex-main">
    <div class="pokemon-detail-page">
      <NuxtLink to="/" class="r8-btn r8-btn--sm r8-btn--secondary pokemon-detail-page__back">
        <ArrowLeft class="pokemon-icon" aria-hidden="true" />
        {{ t('detail.back') }}
      </NuxtLink>

      <div v-if="loading" class="pokemon-detail__body" aria-busy="true">
        <div class="pokemon-detail__hero">
          <div class="r8-skeleton" style="aspect-ratio:1; max-width:170px;">
            <div class="r8-skeleton__media" style="height:100%;" />
          </div>
          <div class="r8-skeleton" style="flex:1;">
            <div class="r8-skeleton__line r8-skeleton__line--short" />
            <div class="r8-skeleton__title" />
            <div class="r8-skeleton__line r8-skeleton__line--medium" />
            <div class="r8-skeleton__footer">
              <div class="r8-skeleton__button" />
              <div class="r8-skeleton__button" />
            </div>
          </div>
        </div>
        <div class="r8-skeleton">
          <div class="r8-skeleton__footer">
            <div class="r8-skeleton__button" />
            <div class="r8-skeleton__button" />
            <div class="r8-skeleton__button" />
            <div class="r8-skeleton__button" />
          </div>
        </div>
        <div class="r8-skeleton">
          <div class="r8-skeleton__line" />
          <div class="r8-skeleton__line" />
        </div>
        <div class="r8-skeleton r8-skeleton--card">
          <div class="r8-skeleton__line r8-skeleton__line--short" />
          <div class="r8-skeleton__line" />
          <div class="r8-skeleton__line" />
          <div class="r8-skeleton__line r8-skeleton__line--medium" />
          <div class="r8-skeleton__line" />
          <div class="r8-skeleton__line r8-skeleton__line--short" />
          <div class="r8-skeleton__line" />
        </div>
        <div class="r8-skeleton r8-skeleton--card">
          <div class="r8-skeleton__line r8-skeleton__line--short" />
          <div class="r8-skeleton__block" />
        </div>
        <div class="r8-skeleton r8-skeleton--card">
          <div class="r8-skeleton__line r8-skeleton__line--short" />
          <div class="r8-skeleton__line" />
          <div class="r8-skeleton__line r8-skeleton__line--medium" />
        </div>
      </div>

      <div v-else-if="detail" class="pokemon-detail__body">
        <div class="pokemon-detail__hero">
          <div class="pokemon-detail__art-wrap">
            <img
              class="pokemon-detail__art"
              :src="shiny ? detail.shinyImage : detail.image"
              :alt="detail.displayName"
            >
          </div>
          <div class="pokemon-detail__identity">
            <span class="pokemon-detail__number">#{{ detail.id.toString().padStart(4, '0') }}</span>
            <h1 class="pokemon-detail__name">{{ detail.displayName }}</h1>
            <p v-if="detail.species.genus" class="pokemon-detail__genus">{{ detail.species.genus }}</p>
            <div class="pokemon-detail__types">
              <PokemonTypeTag
                v-for="type in detail.types"
                :key="type.name"
                :type="type.name"
                :display-name="type.displayName"
              />
            </div>
            <div class="pokemon-detail__flags">
              <span v-if="detail.species.legendary" class="r8-badge r8-badge--warning">{{ t('detail.legendary') }}</span>
              <span v-if="detail.species.mythical" class="r8-badge r8-badge--info">{{ t('detail.mythical') }}</span>
              <span class="r8-badge r8-badge--success">{{ detail.species.generation }}</span>
            </div>
          </div>
        </div>

        <div class="pokemon-detail__toolbar">
          <button
            class="r8-btn r8-btn--sm"
            :class="shiny ? 'r8-btn--primary' : 'r8-btn--secondary'"
            type="button"
            @click="shiny = !shiny"
          >
            <Sparkles class="pokemon-icon" aria-hidden="true" />
            {{ t('detail.shiny') }}
          </button>
          <button
            v-if="detail.cries.latest"
            class="r8-btn r8-btn--sm r8-btn--secondary"
            type="button"
            @click="playCry(detail.cries.latest)"
          >
            <Volume2 class="pokemon-icon" aria-hidden="true" />
            {{ t('detail.cry') }}
          </button>
          <button
            class="r8-btn r8-btn--sm"
            :class="isFavorite ? 'r8-btn--danger' : 'r8-btn--ghost'"
            type="button"
            @click="toggleFavorite"
          >
            <Heart class="pokemon-icon" aria-hidden="true" :fill="isFavorite ? 'currentColor' : 'none'" />
            {{ isFavorite ? t('detail.favorited') : t('detail.favorite') }}
          </button>
          <button
            class="r8-btn r8-btn--sm"
            :class="isCaught ? 'r8-btn--success' : 'r8-btn--ghost'"
            type="button"
            @click="toggleCaught"
          >
            <Check class="pokemon-icon" aria-hidden="true" />
            {{ isCaught ? t('detail.caught') : t('detail.captureAction') }}
          </button>
        </div>

        <p v-if="detail.species.flavorText" class="pokemon-detail__flavor">
          {{ detail.species.flavorText }}
        </p>

        <div class="detail-metric-grid">
          <div class="detail-metric">
            <span>{{ t('detail.height') }}</span>
            <strong>{{ formatNumber(detail.height / 10, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) }} m</strong>
          </div>
          <div class="detail-metric">
            <span>{{ t('detail.weight') }}</span>
            <strong>{{ formatNumber(detail.weight / 10, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) }} kg</strong>
          </div>
          <div class="detail-metric">
            <span>{{ t('detail.captureRate') }}</span>
            <strong>{{ detail.species.captureRate }}</strong>
          </div>
          <div class="detail-metric">
            <span>{{ t('detail.baseXp') }}</span>
            <strong>{{ detail.baseExperience ?? t('common.notAvailable') }}</strong>
          </div>
        </div>

        <section class="detail-section">
          <h3 class="detail-section__title">{{ t('detail.baseStats') }}</h3>
          <div class="stat-list">
            <div v-for="stat in detail.stats" :key="stat.name" class="stat-row">
              <span class="stat-row__label">{{ stat.displayName }}</span>
              <div class="stat-row__bar" aria-hidden="true">
                <span :style="{ width: `${Math.min(stat.value, 180) / 180 * 100}%` }" />
              </div>
              <strong>{{ stat.value }}</strong>
            </div>
          </div>
        </section>

        <section class="detail-section">
          <h3 class="detail-section__title">{{ t('detail.profile') }}</h3>
          <dl class="detail-list">
            <div>
              <dt>{{ t('detail.habitat') }}</dt>
              <dd>{{ detail.species.habitat ?? t('common.unknown') }}</dd>
            </div>
            <div>
              <dt>{{ t('detail.growth') }}</dt>
              <dd>{{ detail.species.growthRate }}</dd>
            </div>
            <div>
              <dt>{{ t('detail.eggs') }}</dt>
              <dd>{{ detail.species.eggGroups.join(', ') }}</dd>
            </div>
            <div>
              <dt>{{ t('detail.varieties') }}</dt>
              <dd>{{ detail.varieties.length }}</dd>
            </div>
          </dl>
        </section>

        <section class="detail-section">
          <h3 class="detail-section__title">{{ t('detail.abilities') }}</h3>
          <div class="chip-row">
            <span
              v-for="ability in detail.abilities"
              :key="ability.name"
              class="r8-badge"
              :class="ability.hidden ? 'r8-badge--warning' : 'r8-badge--info'"
            >
              {{ ability.displayName }}{{ ability.hidden ? ` (${t('detail.hidden')})` : '' }}
            </span>
          </div>
        </section>

        <section class="detail-section">
          <h3 class="detail-section__title">{{ t('detail.damage') }}</h3>
          <div class="damage-grid">
            <div>
              <span class="detail-section__eyebrow">{{ t('detail.weak') }}</span>
              <div class="chip-row">
                <span
                  v-for="item in detail.damage.weaknesses"
                  :key="item.name"
                  class="r8-badge r8-badge--danger damage-chip"
                >
                  {{ item.displayName }} x{{ item.multiplier }}
                </span>
                <span v-if="!detail.damage.weaknesses.length" class="muted-text">{{ t('common.none') }}</span>
              </div>
            </div>
            <div>
              <span class="detail-section__eyebrow">{{ t('detail.resists') }}</span>
              <div class="chip-row">
                <span
                  v-for="item in detail.damage.resistances"
                  :key="item.name"
                  class="r8-badge r8-badge--success damage-chip"
                >
                  {{ item.displayName }} x{{ item.multiplier }}
                </span>
                <span v-if="!detail.damage.resistances.length" class="muted-text">{{ t('common.none') }}</span>
              </div>
            </div>
            <div>
              <span class="detail-section__eyebrow">{{ t('detail.immune') }}</span>
              <div class="chip-row">
                <span
                  v-for="item in detail.damage.immunities"
                  :key="item.name"
                  class="r8-badge r8-badge--info damage-chip"
                >
                  {{ item.displayName }}
                </span>
                <span v-if="!detail.damage.immunities.length" class="muted-text">{{ t('common.none') }}</span>
              </div>
            </div>
          </div>
        </section>

        <section class="detail-section">
          <h3 class="detail-section__title">{{ t('detail.evolution') }}</h3>
          <ol class="evolution-list">
            <li
              v-for="node in detail.evolution"
              :key="`${node.name}-${node.depth}`"
              class="evolution-node"
              :style="{ '--evolution-depth': node.depth }"
            >
              <img :src="node.image" :alt="node.displayName" loading="lazy">
              <div>
                <strong>{{ node.displayName }}</strong>
                <span>{{ node.trigger }}</span>
              </div>
            </li>
          </ol>
        </section>

        <section class="detail-section">
          <h3 class="detail-section__title">{{ t('detail.moves') }}</h3>
          <div class="move-grid">
            <span v-for="move in detail.moves" :key="move.name" class="move-pill">
              {{ move.displayName }}
              <small v-if="move.level !== null">Lv. {{ move.level }}</small>
            </span>
          </div>
        </section>
      </div>

      <div v-else class="r8-panel dex-error">
        <div class="r8-panel__body">
          <strong>{{ t('detail.notFound') }}</strong>
          <NuxtLink to="/" class="r8-btn r8-btn--primary">{{ t('detail.back') }}</NuxtLink>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ArrowLeft, Check, Heart, Sparkles, Volume2 } from '@lucide/vue'
import type { PokemonDetail } from '../../types/pokedex'
import { fetchPokemonDetail } from '../../utils/pokeapi-client'

const route = useRoute()
const id = route.params.id as string
const { locale, t, formatNumber } = useAppI18n()

const detail = ref<PokemonDetail | null>(null)
const loading = ref(true)
const shiny = ref(false)
const favoriteNames = ref<string[]>([])
const caughtNames = ref<string[]>([])

const isFavorite = computed(() => detail.value ? favoriteNames.value.includes(detail.value.speciesName) : false)
const isCaught = computed(() => detail.value ? caughtNames.value.includes(detail.value.speciesName) : false)

useHead(() => ({ title: detail.value ? `Retrodex - ${detail.value.displayName}` : 'Retrodex' }))

onMounted(() => {
  favoriteNames.value = readStorageList('retrodex:favorites')
  caughtNames.value = readStorageList('retrodex:caught')
  void loadDetail()
})

watch(locale, () => void loadDetail())

let detailRequest = 0

async function loadDetail() {
  const request = ++detailRequest
  loading.value = true

  try {
    const result = await fetchPokemonDetail(id, locale.value)
    if (request === detailRequest) detail.value = result
  } finally {
    if (request === detailRequest) loading.value = false
  }
}

function toggleFavorite() {
  if (!detail.value) return
  favoriteNames.value = toggleInList(favoriteNames.value, detail.value.speciesName)
  writeStorageList('retrodex:favorites', favoriteNames.value)
}

function toggleCaught() {
  if (!detail.value) return
  caughtNames.value = toggleInList(caughtNames.value, detail.value.speciesName)
  writeStorageList('retrodex:caught', caughtNames.value)
}

function playCry(src: string) {
  void new Audio(src).play()
}

function toggleInList(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((i) => i !== value) : [...list, value]
}

function readStorageList(key: string): string[] {
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : []
  } catch { return [] }
}

function writeStorageList(key: string, value: string[]) {
  localStorage.setItem(key, JSON.stringify(value))
}
</script>

<style scoped>
.pokemon-detail-page {
  display: grid;
  gap: 1.5rem;
  max-width: 900px;
  margin: 0 auto;
}

.pokemon-detail-page__back {
  justify-self: start;
}
</style>

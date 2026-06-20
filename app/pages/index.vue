<template>
  <main id="pokedex" class="dex-main">
    <section class="dex-hero" aria-labelledby="dex-title">
      <div class="dex-hero__copy">
        <span class="dex-kicker">{{ t('home.kicker') }}</span>
        <h1 id="dex-title">{{ t('home.heading') }}</h1>
        <p>{{ t('home.intro') }}</p>
      </div>
      <div class="dex-hero__stats" :aria-label="t('home.summary')">
        <div class="dex-stat">
          <span>{{ t('home.species') }}</span>
          <strong>{{ bootstrap?.totalSpecies ?? '...' }}</strong>
        </div>
        <div class="dex-stat">
          <span>{{ t('home.generations') }}</span>
          <strong>{{ bootstrap?.generations.length ?? '...' }}</strong>
        </div>
        <div class="dex-stat">
          <span>{{ t('home.caught') }}</span>
          <strong>{{ caughtNames.length }}</strong>
        </div>
        <div class="dex-stat">
          <span>{{ t('home.favorites') }}</span>
          <strong>{{ favoriteNames.length }}</strong>
        </div>
      </div>
    </section>

    <section class="r8-panel dex-controls" :aria-label="t('home.filtersLabel')">
      <div class="r8-panel__header dex-controls__header">
        <div>
          <h2 class="r8-panel__title">{{ t('home.filters') }}</h2>
          <p class="r8-panel__meta">
            {{ t('home.results', { count: filteredPokemon.length }) }}
          </p>
        </div>
        <button class="r8-btn r8-btn--sm r8-btn--secondary" type="button" @click="resetFilters">
          <RotateCcw class="pokemon-icon" aria-hidden="true" />
          {{ t('home.clear') }}
        </button>
      </div>

      <div class="r8-panel__body dex-controls__body">
        <label class="r8-field dex-search">
          <span class="r8-label">{{ t('home.search') }}</span>
          <div class="r8-input-shell" data-r8-clearable="true">
            <span class="r8-input__prefix">
              <Search class="pokemon-icon" aria-hidden="true" />
            </span>
            <input
              v-model.trim="search"
              class="r8-input"
              type="text"
              inputmode="search"
              enterkeyhint="search"
              :placeholder="t('home.searchPlaceholder')"
              :aria-label="t('home.searchAria')"
              autocomplete="off"
            >
            <div class="r8-input__actions">
              <button class="r8-input__clear" type="button" :aria-label="t('home.clearSearch')" hidden>
                <X class="pokemon-icon" aria-hidden="true" />
              </button>
            </div>
          </div>
        </label>

        <div class="r8-field">
          <span class="r8-label">{{ t('home.generation') }}</span>
          <RetroSelect
            :model-value="generationFilter"
            :options="generationOptions"
            :accessible-label="t('home.generationFilterAria')"
            @update:model-value="generationFilter = String($event)"
          />
        </div>

        <div class="r8-field">
          <span class="r8-label">{{ t('home.type') }}</span>
          <RetroSelect
            :model-value="typeFilter"
            :options="typeOptions"
            :accessible-label="t('home.typeFilterAria')"
            @update:model-value="typeFilter = String($event)"
          />
        </div>

        <div class="r8-field">
          <span class="r8-label">{{ t('home.sort') }}</span>
          <RetroSelect
            :model-value="sortMode"
            :options="sortOptions"
            :accessible-label="t('home.sortAria')"
            @update:model-value="updateSortMode"
          />
        </div>

        <div class="r8-field">
          <span class="r8-label">{{ t('home.perPage') }}</span>
          <RetroSelect
            :model-value="pageSize"
            :options="pageSizeOptions"
            :accessible-label="t('home.pageSizeAria')"
            @update:model-value="pageSize = Number($event)"
          />
        </div>
      </div>
    </section>

    <section id="generations" class="generation-strip" :aria-label="t('home.generationShortcuts')">
      <button
        class="r8-btn r8-btn--sm"
        :class="generationFilter === 'all' ? 'r8-btn--primary' : 'r8-btn--secondary'"
        type="button"
        @click="generationFilter = 'all'"
      >
        {{ t('home.allFeminine') }}
      </button>
      <button
        v-for="generation in bootstrap?.generations"
        :key="generation.id"
        class="r8-btn r8-btn--sm"
        :class="generationFilter === String(generation.id) ? 'r8-btn--primary' : 'r8-btn--secondary'"
        type="button"
        @click="generationFilter = String(generation.id)"
      >
        {{ generation.label }}
        <span class="generation-strip__region">{{ generation.region }}</span>
      </button>
    </section>

    <section class="dex-list-section" aria-labelledby="list-title">
      <div class="dex-list-header">
        <div>
          <span class="dex-kicker">{{ t('home.box') }}</span>
          <h2 id="list-title">{{ t('home.records') }}</h2>
        </div>
        <div class="dex-pagination">
          <button
            class="r8-btn r8-btn--sm r8-btn--secondary pokemon-icon-btn"
            type="button"
            :aria-label="t('home.previousPage')"
            :disabled="page <= 1"
            @click="page -= 1"
          >
            <ChevronLeft class="pokemon-icon" aria-hidden="true" />
          </button>
          <span>{{ page }} / {{ totalPages }}</span>
          <button
            class="r8-btn r8-btn--sm r8-btn--secondary pokemon-icon-btn"
            type="button"
            :aria-label="t('home.nextPage')"
            :disabled="page >= totalPages"
            @click="page += 1"
          >
            <ChevronRight class="pokemon-icon" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div v-if="pending" class="pokemon-grid" aria-busy="true">
        <div v-for="index in pageSize" :key="index" class="r8-skeleton r8-skeleton--card pokemon-card">
          <div class="r8-skeleton__line r8-skeleton__line--short" />
          <div class="r8-skeleton__media" />
          <div class="r8-skeleton__title" />
          <div class="r8-skeleton__line r8-skeleton__line--medium" />
          <div class="r8-skeleton__footer">
            <div class="r8-skeleton__button" />
            <div class="r8-skeleton__button" />
          </div>
        </div>
      </div>

      <div v-else-if="error" class="r8-panel dex-error">
        <div class="r8-panel__body">
          <strong>{{ t('home.apiError') }}</strong>
          <p>{{ error.message }}</p>
          <button class="r8-btn r8-btn--primary" type="button" @click="retryBootstrap">
            {{ t('home.retry') }}
          </button>
        </div>
      </div>

      <div v-else-if="pagedPokemon.length" class="pokemon-grid">
        <PokemonCard
          v-for="pokemon in pagedPokemon"
          :key="pokemon.name"
          :pokemon="pokemon"
          :selected="false"
          :favorite="favoriteSet.has(pokemon.name)"
          :caught="caughtSet.has(pokemon.name)"
          @select="goToDetail"
          @toggle-favorite="toggleFavorite"
          @toggle-caught="toggleCaught"
        />
      </div>

      <div v-else class="r8-panel dex-empty">
        <div class="r8-panel__body">
          <Search class="dex-empty__icon" aria-hidden="true" />
          <strong>{{ t('home.emptyTitle') }}</strong>
          <p>{{ t('home.emptyText') }}</p>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ChevronLeft, ChevronRight, RotateCcw, Search, X } from '@lucide/vue'
import type { PokedexBootstrap, PokemonEntry } from '../types/pokedex'
import { fetchPokedexBootstrap } from '../utils/pokeapi-client'

const { locale, t } = useAppI18n()

useHead(() => ({
  title: 'Retrodex',
  meta: [{ name: 'description', content: t('home.metaDescription') }]
}))

const route = useRoute()
const router = useRouter()

const emptyBootstrap: PokedexBootstrap = {
  locale: locale.value,
  generatedAt: '',
  totalSpecies: 0,
  generations: [],
  types: [],
  typeIndex: {},
  pokemon: []
}

const { data: bootstrap, pending, error, refresh } = await useAsyncData<PokedexBootstrap>(
  'pokedex-bootstrap',
  () => fetchPokedexBootstrap(locale.value),
  { default: () => emptyBootstrap, server: false }
)

watch(locale, () => void refresh())

// Query params sync
const search = ref(String(route.query.q ?? ''))
const generationFilter = ref(String(route.query.gen ?? 'all'))
const typeFilter = ref(String(route.query.type ?? 'all'))
const sortMode = ref<'national' | 'name' | 'generation' | 'captured' | 'favorites'>(
  (route.query.sort as any) ?? 'national'
)
const page = ref(Number(route.query.page) || 1)
const pageSize = ref(Number(route.query.size) || 24)

const favoriteNames = ref<string[]>([])
const caughtNames = ref<string[]>([])
const favoriteSet = computed(() => new Set(favoriteNames.value))
const caughtSet = computed(() => new Set(caughtNames.value))

const generationOptions = computed(() => [
  { value: 'all', label: t('home.allFeminine') },
  ...(bootstrap.value?.generations ?? []).map((generation) => ({
    value: String(generation.id),
    label: `${generation.label} · ${generation.region}`
  }))
])

const typeOptions = computed(() => [
  { value: 'all', label: t('home.allMasculine') },
  ...(bootstrap.value?.types ?? []).map((type) => ({
    value: type.name,
    label: type.displayName
  }))
])

const sortOptions = computed(() => [
  { value: 'national', label: t('sort.national') },
  { value: 'name', label: t('sort.name') },
  { value: 'generation', label: t('sort.generation') },
  { value: 'captured', label: t('sort.captured') },
  { value: 'favorites', label: t('sort.favorites') }
])

const pageSizeOptions = [
  { value: 12, label: '12' },
  { value: 24, label: '24' },
  { value: 48, label: '48' }
]

const selectedTypeSet = computed(() => {
  if (!bootstrap.value || typeFilter.value === 'all') return null
  return new Set(bootstrap.value.typeIndex[typeFilter.value] ?? [])
})

const filteredPokemon = computed(() => {
  const query = search.value.toLocaleLowerCase(locale.value)
  const typeSet = selectedTypeSet.value

  const filtered = (bootstrap.value?.pokemon ?? []).filter((pokemon) => {
    const matchesGeneration =
      generationFilter.value === 'all' || pokemon.generationId === Number(generationFilter.value)
    const matchesType = !typeSet || typeSet.has(pokemon.name)
    const matchesQuery =
      !query ||
      pokemon.name.includes(query) ||
      pokemon.displayName.toLocaleLowerCase(locale.value).includes(query) ||
      pokemon.id.toString() === query ||
      pokemon.id.toString().padStart(4, '0').includes(query) ||
      pokemon.generationLabel.toLocaleLowerCase(locale.value).includes(query) ||
      pokemon.region.toLocaleLowerCase(locale.value).includes(query)
    return matchesGeneration && matchesType && matchesQuery
  })

  return sortPokemon(filtered)
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredPokemon.value.length / pageSize.value)))

const pagedPokemon = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredPokemon.value.slice(start, start + pageSize.value)
})

// Sync filters -> query params
watch([search, generationFilter, typeFilter, sortMode, page, pageSize], () => {
  const query: Record<string, string> = {}
  if (search.value) query.q = search.value
  if (generationFilter.value !== 'all') query.gen = generationFilter.value
  if (typeFilter.value !== 'all') query.type = typeFilter.value
  if (sortMode.value !== 'national') query.sort = sortMode.value
  if (page.value > 1) query.page = String(page.value)
  if (pageSize.value !== 24) query.size = String(pageSize.value)
  router.replace({ query })
})

watch([search, generationFilter, typeFilter, pageSize, sortMode], () => {
  page.value = 1
})

watch(totalPages, (value) => {
  if (page.value > value) page.value = value
})

onMounted(() => {
  favoriteNames.value = readStorageList('retrodex:favorites')
  caughtNames.value = readStorageList('retrodex:caught')
})

watch(favoriteNames, (v) => writeStorageList('retrodex:favorites', v), { deep: true })
watch(caughtNames, (v) => writeStorageList('retrodex:caught', v), { deep: true })

function sortPokemon(pokemon: PokemonEntry[]): PokemonEntry[] {
  return [...pokemon].sort((a, b) => {
    if (sortMode.value === 'name') return a.displayName.localeCompare(b.displayName, locale.value)
    if (sortMode.value === 'generation') return a.generationId - b.generationId || a.id - b.id
    if (sortMode.value === 'captured') {
      return Number(caughtSet.value.has(b.name)) - Number(caughtSet.value.has(a.name)) || a.id - b.id
    }
    if (sortMode.value === 'favorites') {
      return Number(favoriteSet.value.has(b.name)) - Number(favoriteSet.value.has(a.name)) || a.id - b.id
    }
    return a.id - b.id
  })
}

function goToDetail(name: string) {
  const pokemon = bootstrap.value?.pokemon.find((p) => p.name === name)
  if (pokemon) navigateTo(`/pokemon/${pokemon.id}`)
}

function toggleFavorite(name: string) {
  favoriteNames.value = toggleInList(favoriteNames.value, name)
}

function toggleCaught(name: string) {
  caughtNames.value = toggleInList(caughtNames.value, name)
}

function resetFilters() {
  search.value = ''
  generationFilter.value = 'all'
  typeFilter.value = 'all'
  sortMode.value = 'national'
  pageSize.value = 24
}

function retryBootstrap() {
  void refresh()
}

function updateSortMode(value: string | number) {
  sortMode.value = String(value) as typeof sortMode.value
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

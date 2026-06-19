<template>
  <main id="pokedex" class="dex-main">
    <section class="dex-hero" aria-labelledby="dex-title">
      <div class="dex-hero__copy">
        <span class="dex-kicker">Personal Dex</span>
        <h1 id="dex-title">Retrodex pessoal</h1>
        <p>
          Catálogo completo por geração, tipo, captura, favoritos, cadeia evolutiva,
          estatísticas, dano recebido e variantes oficiais da PokeAPI.
        </p>
      </div>
      <div class="dex-hero__stats" aria-label="Resumo da Pokedex">
        <div class="dex-stat">
          <span>Espécies</span>
          <strong>{{ bootstrap?.totalSpecies ?? '...' }}</strong>
        </div>
        <div class="dex-stat">
          <span>Gerações</span>
          <strong>{{ bootstrap?.generations.length ?? '...' }}</strong>
        </div>
        <div class="dex-stat">
          <span>Capturados</span>
          <strong>{{ caughtNames.length }}</strong>
        </div>
        <div class="dex-stat">
          <span>Favoritos</span>
          <strong>{{ favoriteNames.length }}</strong>
        </div>
      </div>
    </section>

    <section class="r8-panel dex-controls" aria-label="Filtros da Pokedex">
      <div class="r8-panel__header dex-controls__header">
        <div>
          <h2 class="r8-panel__title">Filtros</h2>
          <p class="r8-panel__meta">
            {{ filteredPokemon.length }} registros encontrados
          </p>
        </div>
        <button class="r8-btn r8-btn--sm r8-btn--secondary" type="button" @click="resetFilters">
          <RotateCcw class="pokemon-icon" aria-hidden="true" />
          Limpar
        </button>
      </div>

      <div class="r8-panel__body dex-controls__body">
        <label class="r8-field dex-search">
          <span class="r8-label">Busca</span>
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
              placeholder="Nome, número, geração ou região"
              aria-label="Buscar Pokémon"
              autocomplete="off"
            >
            <div class="r8-input__actions">
              <button class="r8-input__clear" type="button" aria-label="Limpar busca" hidden>
                <X class="pokemon-icon" aria-hidden="true" />
              </button>
            </div>
          </div>
        </label>

        <div class="r8-field">
          <span class="r8-label">Geração</span>
          <RetroSelect
            :model-value="generationFilter"
            :options="generationOptions"
            accessible-label="Filtrar por geração"
            @update:model-value="generationFilter = String($event)"
          />
        </div>

        <div class="r8-field">
          <span class="r8-label">Tipo</span>
          <RetroSelect
            :model-value="typeFilter"
            :options="typeOptions"
            accessible-label="Filtrar por tipo"
            @update:model-value="typeFilter = String($event)"
          />
        </div>

        <div class="r8-field">
          <span class="r8-label">Ordenar</span>
          <RetroSelect
            :model-value="sortMode"
            :options="sortOptions"
            accessible-label="Ordenar registros"
            @update:model-value="updateSortMode"
          />
        </div>

        <div class="r8-field">
          <span class="r8-label">Por página</span>
          <RetroSelect
            :model-value="pageSize"
            :options="pageSizeOptions"
            accessible-label="Registros por página"
            @update:model-value="pageSize = Number($event)"
          />
        </div>
      </div>
    </section>

    <section id="generations" class="generation-strip" aria-label="Atalhos por geração">
      <button
        class="r8-btn r8-btn--sm"
        :class="generationFilter === 'all' ? 'r8-btn--primary' : 'r8-btn--secondary'"
        type="button"
        @click="generationFilter = 'all'"
      >
        Todas
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
          <span class="dex-kicker">Box</span>
          <h2 id="list-title">Registros</h2>
        </div>
        <div class="dex-pagination">
          <button
            class="r8-btn r8-btn--sm r8-btn--secondary pokemon-icon-btn"
            type="button"
            aria-label="Página anterior"
            :disabled="page <= 1"
            @click="page -= 1"
          >
            <ChevronLeft class="pokemon-icon" aria-hidden="true" />
          </button>
          <span>{{ page }} / {{ totalPages }}</span>
          <button
            class="r8-btn r8-btn--sm r8-btn--secondary pokemon-icon-btn"
            type="button"
            aria-label="Próxima página"
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
          <strong>Não foi possível carregar a PokeAPI.</strong>
          <p>{{ error.message }}</p>
          <button class="r8-btn r8-btn--primary" type="button" @click="retryBootstrap">
            Tentar novamente
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
          <strong>Nenhum registro encontrado.</strong>
          <p>Ajuste busca, tipo ou geração para continuar explorando.</p>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ChevronLeft, ChevronRight, RotateCcw, Search, X } from '@lucide/vue'
import type { PokedexBootstrap, PokemonEntry } from '../types/pokedex'
import { fetchPokedexBootstrap } from '../utils/pokeapi-client'

useHead({ title: 'Retrodex' })

const route = useRoute()
const router = useRouter()

const emptyBootstrap: PokedexBootstrap = {
  generatedAt: '',
  totalSpecies: 0,
  generations: [],
  types: [],
  typeIndex: {},
  pokemon: []
}

const { data: bootstrap, pending, error, refresh } = await useAsyncData<PokedexBootstrap>(
  'pokedex-bootstrap',
  fetchPokedexBootstrap,
  { default: () => emptyBootstrap, server: false }
)

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
  { value: 'all', label: 'Todas' },
  ...(bootstrap.value?.generations ?? []).map((generation) => ({
    value: String(generation.id),
    label: `${generation.label} · ${generation.region}`
  }))
])

const typeOptions = computed(() => [
  { value: 'all', label: 'Todos' },
  ...(bootstrap.value?.types ?? []).map((type) => ({
    value: type.name,
    label: type.displayName
  }))
])

const sortOptions = [
  { value: 'national', label: 'National Dex' },
  { value: 'name', label: 'Nome' },
  { value: 'generation', label: 'Geração' },
  { value: 'captured', label: 'Capturados primeiro' },
  { value: 'favorites', label: 'Favoritos primeiro' }
]

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
  const query = search.value.toLowerCase()
  const typeSet = selectedTypeSet.value

  const filtered = (bootstrap.value?.pokemon ?? []).filter((pokemon) => {
    const matchesGeneration =
      generationFilter.value === 'all' || pokemon.generationId === Number(generationFilter.value)
    const matchesType = !typeSet || typeSet.has(pokemon.name)
    const matchesQuery =
      !query ||
      pokemon.name.includes(query) ||
      pokemon.displayName.toLowerCase().includes(query) ||
      pokemon.id.toString() === query ||
      pokemon.id.toString().padStart(4, '0').includes(query) ||
      pokemon.generationLabel.toLowerCase().includes(query) ||
      pokemon.region.toLowerCase().includes(query)
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
    if (sortMode.value === 'name') return a.displayName.localeCompare(b.displayName)
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

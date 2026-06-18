<template>
  <div class="dex-app">
    <header class="dex-topbar">
      <nav class="r8-navbar r8-navbar--dark" data-r8-expand="lg" aria-label="Navegação principal da Pokedex">
        <div class="r8-navbar__container dex-navbar__container">
          <a class="r8-navbar__brand dex-brand" href="#pokedex">
            <span class="dex-brand__mark" aria-hidden="true">
              <Compass class="pokemon-icon" />
            </span>
            <span>RetroDex Pro</span>
          </a>
          <button
            class="r8-navbar__toggle"
            type="button"
            aria-label="Alternar navegação"
            aria-controls="dex-navbar-menu"
          >
            <span class="r8-navbar__toggle-icon" aria-hidden="true" />
          </button>
          <div id="dex-navbar-menu" class="r8-navbar__collapse">
            <ul class="r8-navbar__menu">
              <li><a class="r8-navbar__item" href="#pokedex" aria-current="page">Pokedex</a></li>
              <li><a class="r8-navbar__item" href="#generations">Gerações</a></li>
              <li><a class="r8-navbar__item" href="#details">Detalhes</a></li>
            </ul>
            <p class="r8-navbar__text">PokeAPI · Nuxt 4 · Retro8 UI</p>
            <div class="r8-navbar__actions">
              <span class="r8-badge r8-badge--info">{{ bootstrap?.totalSpecies ?? 0 }} espécies</span>
            </div>
          </div>
        </div>
      </nav>
    </header>

    <main id="pokedex" class="dex-main">
      <section class="dex-hero" aria-labelledby="dex-title">
        <div class="dex-hero__copy">
          <span class="dex-kicker">National Dex</span>
          <h1 id="dex-title">Pokedex profissional</h1>
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
                type="search"
                placeholder="Nome, número, geração ou região"
                autocomplete="off"
              >
            </div>
          </label>

          <label class="r8-field">
            <span class="r8-label">Geração</span>
            <select v-model="generationFilter" class="r8-input">
              <option value="all">Todas</option>
              <option
                v-for="generation in bootstrap?.generations"
                :key="generation.id"
                :value="String(generation.id)"
              >
                {{ generation.label }} · {{ generation.region }}
              </option>
            </select>
          </label>

          <label class="r8-field">
            <span class="r8-label">Tipo</span>
            <select v-model="typeFilter" class="r8-input">
              <option value="all">Todos</option>
              <option v-for="type in bootstrap?.types" :key="type.name" :value="type.name">
                {{ type.displayName }}
              </option>
            </select>
          </label>

          <label class="r8-field">
            <span class="r8-label">Ordenar</span>
            <select v-model="sortMode" class="r8-input">
              <option value="national">National Dex</option>
              <option value="name">Nome</option>
              <option value="generation">Geração</option>
              <option value="captured">Capturados primeiro</option>
              <option value="favorites">Favoritos primeiro</option>
            </select>
          </label>

          <label class="r8-field">
            <span class="r8-label">Página</span>
            <select v-model.number="pageSize" class="r8-input">
              <option :value="12">12</option>
              <option :value="24">24</option>
              <option :value="48">48</option>
            </select>
          </label>
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

      <div class="dex-workbench">
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
            <div v-for="index in 12" :key="index" class="r8-panel pokemon-card pokemon-card--skeleton">
              <div class="detail-skeleton detail-skeleton--image" />
              <div class="detail-skeleton" />
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
              :selected="selectedName === pokemon.name"
              :favorite="favoriteSet.has(pokemon.name)"
              :caught="caughtSet.has(pokemon.name)"
              @select="selectPokemon"
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

        <aside id="details" class="dex-detail-panel">
          <PokemonDetail
            :detail="selectedDetail"
            :loading="detailLoading"
            :shiny="showShiny"
            :favorite="selectedDetail ? favoriteSet.has(selectedDetail.speciesName) : false"
            :caught="selectedDetail ? caughtSet.has(selectedDetail.speciesName) : false"
            @toggle-favorite="toggleFavorite"
            @toggle-caught="toggleCaught"
            @toggle-shiny="showShiny = !showShiny"
          />
        </aside>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import {
  ChevronLeft,
  ChevronRight,
  Compass,
  RotateCcw,
  Search
} from '@lucide/vue'
import type { PokedexBootstrap, PokemonDetail, PokemonEntry } from './types/pokedex'
import { fetchPokedexBootstrap, fetchPokemonDetail } from './utils/pokeapi-client'

const emptyBootstrap: PokedexBootstrap = {
  generatedAt: '',
  totalSpecies: 0,
  generations: [],
  types: [],
  typeIndex: {},
  pokemon: []
}

useHead({
  title: 'RetroDex Pro',
  meta: [
    {
      name: 'description',
      content: 'Pokedex profissional em Nuxt 4, Retro8 UI e PokeAPI.'
    }
  ]
})

const { data: bootstrap, pending, error, refresh } = await useAsyncData<PokedexBootstrap>(
  'pokedex-bootstrap',
  fetchPokedexBootstrap,
  {
    default: () => emptyBootstrap,
    server: false
  }
)

const search = ref('')
const generationFilter = ref('all')
const typeFilter = ref('all')
const sortMode = ref<'national' | 'name' | 'generation' | 'captured' | 'favorites'>('national')
const page = ref(1)
const pageSize = ref(24)
const selectedName = ref<string | null>(null)
const selectedDetail = ref<PokemonDetail | null>(null)
const detailLoading = ref(false)
const showShiny = ref(false)
const favoriteNames = ref<string[]>([])
const caughtNames = ref<string[]>([])

const favoriteSet = computed(() => new Set(favoriteNames.value))
const caughtSet = computed(() => new Set(caughtNames.value))

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

watch([search, generationFilter, typeFilter, pageSize, sortMode], () => {
  page.value = 1
})

watch(totalPages, (value) => {
  if (page.value > value) page.value = value
})

watch(filteredPokemon, (pokemon) => {
  if (!pokemon.length) {
    selectedName.value = null
    selectedDetail.value = null
    return
  }

  if (!selectedName.value || !pokemon.some((entry) => entry.name === selectedName.value)) {
    selectedName.value = pokemon[0]?.name ?? null
  }
}, { immediate: true })

let detailRequestId = 0
watch(selectedName, async (name) => {
  if (!name) return

  const requestId = ++detailRequestId
  detailLoading.value = true
  showShiny.value = false

  try {
    const detail = await fetchPokemonDetail(name)
    if (requestId === detailRequestId) selectedDetail.value = detail
  } finally {
    if (requestId === detailRequestId) detailLoading.value = false
  }
}, { immediate: true })

onMounted(() => {
  favoriteNames.value = readStorageList('retrodex:favorites')
  caughtNames.value = readStorageList('retrodex:caught')
})

watch(favoriteNames, (value) => {
  writeStorageList('retrodex:favorites', value)
}, { deep: true })

watch(caughtNames, (value) => {
  writeStorageList('retrodex:caught', value)
}, { deep: true })

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

function selectPokemon(name: string) {
  selectedName.value = name
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

function toggleInList(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

function readStorageList(key: string): string[] {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : []
  } catch {
    return []
  }
}

function writeStorageList(key: string, value: string[]) {
  localStorage.setItem(key, JSON.stringify(value))
}
</script>

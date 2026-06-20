<template>
  <main class="dex-main locations-page">
    <section class="r8-window locations-hero" aria-labelledby="locations-title">
      <div class="r8-window__titlebar">
        <span class="r8-window__title">{{ t('locations.kicker') }}</span>
      </div>
      <div class="r8-window__body locations-hero__body">
        <div class="locations-hero__copy">
          <MapPinned class="locations-hero__icon" :size="34" aria-hidden="true" />
          <div>
            <h1 id="locations-title">{{ t('locations.title') }}</h1>
            <p>{{ t('locations.intro') }}</p>
          </div>
        </div>
        <div class="locations-stats" :aria-label="t('locations.kicker')">
          <div class="locations-stat">
            <span>{{ t('locations.regions') }}</span>
            <strong>{{ bootstrap.counts.regions || '...' }}</strong>
          </div>
          <div class="locations-stat">
            <span>{{ t('locations.locations') }}</span>
            <strong>{{ bootstrap.counts.locations || '...' }}</strong>
          </div>
          <div class="locations-stat">
            <span>{{ t('locations.areas') }}</span>
            <strong>{{ bootstrap.counts.areas || '...' }}</strong>
          </div>
          <div class="locations-stat">
            <span>{{ t('locations.palParkAreas') }}</span>
            <strong>{{ bootstrap.counts.palParkAreas || '...' }}</strong>
          </div>
        </div>
      </div>
      <div class="r8-window__statusbar">PokéAPI · /location · /location-area · /region · /pal-park-area</div>
    </section>

    <section class="r8-panel locations-controls" :aria-label="t('locations.filters')">
      <div class="r8-panel__header locations-panel__header">
        <h2 class="r8-panel__title">{{ t('locations.filters') }}</h2>
        <p class="r8-panel__meta">{{ currentRegion?.displayName ?? t('common.select') }}</p>
      </div>
      <div class="r8-panel__body locations-controls__grid">
        <div class="r8-field">
          <span class="r8-label">{{ t('locations.region') }}</span>
          <RetroSelect
            :model-value="selectedRegion"
            :options="regionOptions"
            :accessible-label="t('locations.regionAria')"
            @update:model-value="selectedRegion = String($event)"
          />
        </div>
        <div class="r8-field">
          <span class="r8-label">{{ t('locations.location') }}</span>
          <RetroSelect
            :model-value="selectedLocation"
            :options="locationOptions"
            :accessible-label="t('locations.locationAria')"
            @update:model-value="selectedLocation = String($event)"
          />
        </div>
        <div class="r8-field">
          <span class="r8-label">{{ t('locations.area') }}</span>
          <RetroSelect
            :model-value="selectedArea"
            :options="areaOptions"
            :accessible-label="t('locations.areaAria')"
            @update:model-value="selectedArea = String($event)"
          />
        </div>
        <label class="r8-field locations-search">
          <span class="r8-label">{{ t('locations.search') }}</span>
          <div class="r8-input-shell">
            <span class="r8-input__prefix"><Search :size="16" aria-hidden="true" /></span>
            <input
              v-model.trim="encounterSearch"
              class="r8-input"
              type="search"
              :placeholder="t('locations.searchPlaceholder')"
              :aria-label="t('locations.search')"
            >
            <div v-if="encounterSearch" class="r8-input__actions">
              <button
                class="r8-input__clear"
                type="button"
                :aria-label="t('locations.clearSearch')"
                @click="encounterSearch = ''"
              >
                <X :size="15" aria-hidden="true" />
              </button>
            </div>
          </div>
        </label>
      </div>
    </section>

    <div v-if="pending" class="r8-panel locations-feedback" aria-busy="true">
      <div class="r8-panel__body">
        <div class="r8-loading" aria-hidden="true" />
        <strong>{{ t('locations.loading') }}</strong>
      </div>
    </div>

    <div v-else-if="error" class="r8-panel locations-feedback">
      <div class="r8-panel__body">
        <MapPinOff :size="34" aria-hidden="true" />
        <strong>{{ t('locations.error') }}</strong>
        <button class="r8-btn r8-btn--primary" type="button" @click="refresh">
          {{ t('locations.retry') }}
        </button>
      </div>
    </div>

    <div v-else class="locations-workbench">
      <aside v-if="currentRegion" class="r8-panel region-profile" :aria-labelledby="`region-${currentRegion.id}`">
        <div class="r8-panel__header locations-panel__header">
          <span class="r8-panel__meta">#{{ currentRegion.id.toString().padStart(2, '0') }}</span>
          <h2 :id="`region-${currentRegion.id}`" class="r8-panel__title">{{ currentRegion.displayName }}</h2>
        </div>
        <div class="r8-panel__body region-profile__body">
          <div class="region-profile__metric">
            <span>{{ t('locations.mainGeneration') }}</span>
            <strong>{{ currentRegion.mainGeneration }}</strong>
          </div>
          <div class="region-profile__metric">
            <span>{{ t('locations.locations') }}</span>
            <strong>{{ currentRegion.locations.length }}</strong>
          </div>

          <section class="region-profile__section">
            <h3>{{ t('locations.pokedexes') }}</h3>
            <div class="locations-chip-list">
              <span v-for="pokedex in currentRegion.pokedexes" :key="pokedex" class="r8-badge r8-badge--info">
                {{ pokedex }}
              </span>
              <span v-if="!currentRegion.pokedexes.length" class="muted-text">{{ t('common.none') }}</span>
            </div>
          </section>

          <section class="region-profile__section">
            <h3>{{ t('locations.gameVersions') }}</h3>
            <div class="locations-chip-list">
              <span v-for="version in currentRegion.versionGroups" :key="version" class="r8-badge">
                {{ version }}
              </span>
            </div>
          </section>
        </div>
        <div class="r8-panel__footer locations-panel__footer">
          {{ t('locations.locationCount', { count: currentRegion.locations.length }) }}
        </div>
      </aside>

      <section class="r8-window location-console" aria-live="polite">
        <div class="r8-window__titlebar">
          <span class="r8-window__title">
            {{ locationDetail?.displayName ?? t('locations.locationDetails') }}
          </span>
          <div class="r8-window__controls" aria-hidden="true">
            <span class="r8-window__control" />
            <span class="r8-window__control" />
          </div>
        </div>

        <div v-if="locationLoading" class="r8-window__body location-console__loading" aria-busy="true">
          <div class="r8-skeleton r8-skeleton--card">
            <div class="r8-skeleton__title" />
            <div class="r8-skeleton__line" />
            <div class="r8-skeleton__line r8-skeleton__line--medium" />
          </div>
        </div>

        <div v-else-if="locationDetail" class="r8-window__body location-console__body">
          <header class="location-heading">
            <div>
              <span class="dex-kicker">#{{ locationDetail.id.toString().padStart(4, '0') }}</span>
              <h2>{{ locationDetail.displayName }}</h2>
            </div>
            <div class="locations-chip-list">
              <span class="r8-badge r8-badge--success">{{ locationDetail.regionDisplayName }}</span>
              <span class="r8-badge r8-badge--info">
                {{ t('locations.areaCount', { count: locationDetail.areas.length }) }}
              </span>
            </div>
          </header>

          <section class="location-subsection">
            <h3>{{ t('locations.gameIndices') }}</h3>
            <div class="game-index-grid">
              <div v-for="entry in locationDetail.gameIndices" :key="`${entry.generation}-${entry.index}`" class="game-index-card">
                <span>{{ entry.generation }}</span>
                <strong>#{{ entry.index }}</strong>
              </div>
              <p v-if="!locationDetail.gameIndices.length" class="muted-text">{{ t('locations.noGameIndices') }}</p>
            </div>
          </section>

          <div v-if="!locationDetail.areas.length" class="locations-empty">
            <MapPinOff :size="30" aria-hidden="true" />
            <p>{{ t('locations.noAreas') }}</p>
          </div>

          <template v-else>
            <section class="location-subsection">
              <h3>{{ t('locations.encounterMethods') }}</h3>
              <div v-if="areaLoading" class="r8-skeleton">
                <div class="r8-skeleton__line" />
                <div class="r8-skeleton__line r8-skeleton__line--medium" />
              </div>
              <div v-else-if="areaDetail?.encounterMethods.length" class="r8-table-wrap encounter-method-table">
                <table class="r8-table r8-table--striped r8-table--hover r8-table--sm">
                  <thead>
                    <tr>
                      <th scope="col">{{ t('locations.methods') }}</th>
                      <th scope="col">{{ t('locations.version') }}</th>
                      <th scope="col">{{ t('locations.rate') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <template v-for="method in areaDetail.encounterMethods" :key="method.name">
                      <tr v-for="(version, index) in method.versions" :key="`${method.name}-${version.name}`">
                        <td>{{ index === 0 ? method.displayName : '' }}</td>
                        <td>{{ version.displayName }}</td>
                        <td class="r8-table__cell--numeric">{{ version.rate }}%</td>
                      </tr>
                    </template>
                  </tbody>
                </table>
              </div>
              <p v-else class="muted-text">{{ t('locations.noEncounterMethods') }}</p>
            </section>

            <section class="location-subsection encounters-section">
              <div class="encounters-header">
                <div>
                  <h3>{{ t('locations.pokemonEncounters') }}</h3>
                  <span class="muted-text">{{ filteredEncounters.length }}</span>
                </div>
                <div class="dex-pagination">
                  <button
                    class="r8-btn r8-btn--sm r8-btn--secondary pokemon-icon-btn"
                    type="button"
                    :aria-label="t('locations.previousPage')"
                    :disabled="encounterPage <= 1"
                    @click="encounterPage -= 1"
                  >
                    <ChevronLeft :size="17" aria-hidden="true" />
                  </button>
                  <span>{{ t('locations.pageStatus', { current: encounterPage, total: encounterTotalPages }) }}</span>
                  <button
                    class="r8-btn r8-btn--sm r8-btn--secondary pokemon-icon-btn"
                    type="button"
                    :aria-label="t('locations.nextPage')"
                    :disabled="encounterPage >= encounterTotalPages"
                    @click="encounterPage += 1"
                  >
                    <ChevronRight :size="17" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div v-if="areaLoading" class="encounter-skeleton-grid" aria-busy="true">
                <div v-for="item in 6" :key="item" class="r8-skeleton r8-skeleton--card" />
              </div>
              <div v-else-if="pagedEncounters.length" class="r8-table-wrap encounters-table">
                <table class="r8-table r8-table--striped r8-table--hover r8-table--sm">
                  <thead>
                    <tr>
                      <th scope="col">{{ t('locations.pokemon') }}</th>
                      <th scope="col">{{ t('locations.chance') }}</th>
                      <th scope="col">{{ t('locations.levels') }}</th>
                      <th scope="col">{{ t('locations.methods') }}</th>
                      <th scope="col">{{ t('locations.versions') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="encounter in pagedEncounters" :key="encounter.name">
                      <td>
                        <NuxtLink :to="`/pokemon/${encounter.id}`" class="encounter-pokemon">
                          <img :src="encounter.image" :alt="encounter.displayName" loading="lazy">
                          <span>
                            <strong>{{ encounter.displayName }}</strong>
                            <small>#{{ encounter.id.toString().padStart(4, '0') }}</small>
                            <small v-if="encounter.conditions.length" :title="encounter.conditions.join(', ')">
                              {{ encounter.conditions.join(', ') }}
                            </small>
                          </span>
                        </NuxtLink>
                      </td>
                      <td class="r8-table__cell--numeric"><strong>{{ encounter.maxChance }}%</strong></td>
                      <td>Lv. {{ encounter.minLevel }}–{{ encounter.maxLevel }}</td>
                      <td>
                        <div class="locations-chip-list locations-chip-list--nowrap">
                          <span v-for="method in encounter.methods" :key="method" class="r8-badge r8-badge--info">{{ method }}</span>
                        </div>
                      </td>
                      <td class="locations-version-cell" :title="encounter.versions.join(', ')">
                        {{ encounter.versions.join(', ') }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-else class="locations-empty">
                <Search :size="30" aria-hidden="true" />
                <p>{{ t('locations.noEncounters') }}</p>
              </div>
            </section>
          </template>
        </div>

        <div v-else class="r8-window__body locations-empty">
          <MapPin :size="30" aria-hidden="true" />
          <p>{{ t('locations.selectLocation') }}</p>
        </div>
        <div class="r8-window__statusbar">
          {{ areaDetail?.displayName || locationDetail?.displayName || t('locations.selectLocation') }}
        </div>
      </section>
    </div>

    <section v-if="!pending && !error" class="r8-window pal-park" aria-labelledby="pal-park-title">
      <div class="r8-window__titlebar">
        <span id="pal-park-title" class="r8-window__title">{{ t('locations.palPark') }}</span>
      </div>
      <div class="r8-window__body pal-park__body">
        <header class="pal-park__header">
          <div>
            <p>{{ t('locations.palParkIntro') }}</p>
          </div>
          <div class="r8-field pal-park__select">
            <span class="r8-label">{{ t('locations.palParkArea') }}</span>
            <RetroSelect
              :model-value="selectedPalPark"
              :options="palParkOptions"
              :accessible-label="t('locations.palParkAreaAria')"
              @update:model-value="selectedPalPark = String($event)"
            />
          </div>
        </header>

        <div class="encounters-header">
          <div>
            <h3>{{ currentPalPark?.displayName }}</h3>
            <span class="muted-text">{{ currentPalPark?.encounters.length ?? 0 }} Pokémon</span>
          </div>
          <div class="dex-pagination">
            <button
              class="r8-btn r8-btn--sm r8-btn--secondary pokemon-icon-btn"
              type="button"
              :aria-label="t('locations.previousPage')"
              :disabled="palParkPage <= 1"
              @click="palParkPage -= 1"
            >
              <ChevronLeft :size="17" aria-hidden="true" />
            </button>
            <span>{{ t('locations.pageStatus', { current: palParkPage, total: palParkTotalPages }) }}</span>
            <button
              class="r8-btn r8-btn--sm r8-btn--secondary pokemon-icon-btn"
              type="button"
              :aria-label="t('locations.nextPage')"
              :disabled="palParkPage >= palParkTotalPages"
              @click="palParkPage += 1"
            >
              <ChevronRight :size="17" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div v-if="pagedPalParkEncounters.length" class="r8-table-wrap pal-park__table">
          <table class="r8-table r8-table--striped r8-table--hover r8-table--sm">
            <thead>
              <tr>
                <th scope="col">{{ t('locations.pokemon') }}</th>
                <th scope="col">{{ t('locations.rarityRate') }}</th>
                <th scope="col">{{ t('locations.baseScore') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="encounter in pagedPalParkEncounters" :key="encounter.name">
                <td>
                  <NuxtLink :to="`/pokemon/${encounter.id}`" class="encounter-pokemon">
                    <img :src="encounter.image" :alt="encounter.displayName" loading="lazy">
                    <span>
                      <strong>{{ encounter.displayName }}</strong>
                      <small>#{{ encounter.id.toString().padStart(4, '0') }}</small>
                    </span>
                  </NuxtLink>
                </td>
                <td class="r8-table__cell--numeric">{{ encounter.rate }}</td>
                <td class="r8-table__cell--numeric">{{ encounter.baseScore }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="locations-empty">
          <p>{{ t('locations.noPalEncounters') }}</p>
        </div>
      </div>
      <div class="r8-window__statusbar">Pal Park · {{ currentPalPark?.displayName ?? '—' }}</div>
    </section>
  </main>
</template>

<script setup lang="ts">
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  MapPinned,
  MapPinOff,
  Search,
  X
} from '@lucide/vue'
import type {
  LocationAreaDetailModel,
  LocationDetailModel,
  LocationsBootstrap
} from '../types/locations'
import {
  fetchLocationAreaDetail,
  fetchLocationDetail,
  fetchLocationsBootstrap
} from '../utils/pokeapi-locations'

const { locale, t } = useAppI18n()

useHead(() => ({
  title: `Retrodex - ${t('nav.locations')}`,
  meta: [{ name: 'description', content: t('locations.metaDescription') }]
}))

const emptyBootstrap: LocationsBootstrap = {
  locale: locale.value,
  counts: { regions: 0, locations: 0, areas: 0, palParkAreas: 0 },
  regions: [],
  palParkAreas: []
}

const { data: bootstrapData, pending, error, refresh } = await useAsyncData<LocationsBootstrap>(
  'locations-bootstrap',
  () => fetchLocationsBootstrap(locale.value),
  { default: () => emptyBootstrap, server: false }
)

const bootstrap = computed(() => bootstrapData.value ?? emptyBootstrap)
const selectedRegion = ref('kanto')
const selectedLocation = ref('')
const selectedArea = ref('')
const selectedPalPark = ref('forest')
const encounterSearch = ref('')
const encounterPage = ref(1)
const palParkPage = ref(1)
const pageSize = 12

const locationDetail = ref<LocationDetailModel | null>(null)
const areaDetail = ref<LocationAreaDetailModel | null>(null)
const locationLoading = ref(false)
const areaLoading = ref(false)
let locationRequest = 0
let areaRequest = 0

const currentRegion = computed(() =>
  bootstrap.value.regions.find((region) => region.name === selectedRegion.value) ?? null
)
const currentPalPark = computed(() =>
  bootstrap.value.palParkAreas.find((area) => area.name === selectedPalPark.value) ?? null
)

const regionOptions = computed(() => bootstrap.value.regions.map((region) => ({
  value: region.name,
  label: `${region.displayName} · ${region.mainGeneration}`
})))
const locationOptions = computed(() => (currentRegion.value?.locations ?? []).map((location) => ({
  value: location.name,
  label: location.displayName
})))
const areaOptions = computed(() => (locationDetail.value?.areas ?? []).map((area) => ({
  value: area.name,
  label: area.displayName
})))
const palParkOptions = computed(() => bootstrap.value.palParkAreas.map((area) => ({
  value: area.name,
  label: `${area.displayName} · ${area.encounters.length}`
})))

const filteredEncounters = computed(() => {
  const query = encounterSearch.value.toLocaleLowerCase(locale.value)
  if (!query) return areaDetail.value?.encounters ?? []
  return (areaDetail.value?.encounters ?? []).filter((encounter) =>
    encounter.displayName.toLocaleLowerCase(locale.value).includes(query)
    || encounter.name.includes(query)
    || encounter.id.toString() === query
  )
})
const encounterTotalPages = computed(() =>
  Math.max(1, Math.ceil(filteredEncounters.value.length / pageSize))
)
const pagedEncounters = computed(() => {
  const start = (encounterPage.value - 1) * pageSize
  return filteredEncounters.value.slice(start, start + pageSize)
})
const palParkTotalPages = computed(() =>
  Math.max(1, Math.ceil((currentPalPark.value?.encounters.length ?? 0) / pageSize))
)
const pagedPalParkEncounters = computed(() => {
  const start = (palParkPage.value - 1) * pageSize
  return currentPalPark.value?.encounters.slice(start, start + pageSize) ?? []
})

watch(locale, () => void refresh())

watch([() => bootstrap.value.locale, selectedRegion], () => {
  const regions = bootstrap.value.regions
  if (!regions.length) return

  if (!currentRegion.value) selectedRegion.value = regions[0]!.name
  const locations = currentRegion.value?.locations ?? []
  if (!locations.some((location) => location.name === selectedLocation.value)) {
    selectedLocation.value = locations[0]?.name ?? ''
  }
  void loadLocation()
}, { immediate: true })

watch(selectedLocation, () => void loadLocation())
watch(selectedArea, () => void loadArea())
watch([encounterSearch, selectedArea], () => { encounterPage.value = 1 })
watch(encounterTotalPages, (total) => {
  if (encounterPage.value > total) encounterPage.value = total
})
watch(selectedPalPark, () => { palParkPage.value = 1 })
watch(palParkTotalPages, (total) => {
  if (palParkPage.value > total) palParkPage.value = total
})

async function loadLocation() {
  const name = selectedLocation.value
  const request = ++locationRequest
  areaRequest += 1
  selectedArea.value = ''
  areaDetail.value = null

  if (!name) {
    locationDetail.value = null
    return
  }

  locationLoading.value = true
  try {
    const result = await fetchLocationDetail(name, locale.value)
    if (request !== locationRequest) return
    locationDetail.value = result
    selectedArea.value = result.areas[0]?.name ?? ''
  } finally {
    if (request === locationRequest) locationLoading.value = false
  }
}

async function loadArea() {
  const name = selectedArea.value
  const request = ++areaRequest

  if (!name) {
    areaDetail.value = null
    return
  }

  areaLoading.value = true
  try {
    const result = await fetchLocationAreaDetail(name, locale.value)
    if (request === areaRequest) areaDetail.value = result
  } finally {
    if (request === areaRequest) areaLoading.value = false
  }
}
</script>

<style scoped>
.locations-page {
  display: grid;
  gap: 1rem;
  padding-bottom: 3rem;
}

.locations-hero {
  margin-top: 1rem;
}

.locations-hero__body {
  align-items: stretch;
  display: grid;
  gap: 1rem;
  grid-template-columns: minmax(0, 1.25fr) minmax(400px, 0.75fr);
}

.locations-hero__copy {
  align-items: flex-start;
  display: flex;
  gap: 1rem;
  padding: clamp(0.5rem, 2vw, 1.25rem);
}

.locations-hero__icon {
  color: var(--dex-accent);
  flex: 0 0 auto;
}

.locations-hero h1 {
  font-size: clamp(2rem, 5vw, 3.75rem);
  line-height: 1;
  margin: 0;
}

.locations-hero p {
  color: var(--dex-muted);
  line-height: 1.65;
  margin: 1rem 0 0;
  max-width: 68ch;
}

.locations-stats {
  display: grid;
  gap: 0.5rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.locations-stat {
  background: var(--dex-surface-2);
  border: 2px solid var(--dex-line);
  display: grid;
  gap: 0.3rem;
  padding: 0.8rem;
}

.locations-stat span,
.region-profile__metric span {
  color: var(--dex-muted);
  font-size: 0.7rem;
  text-transform: uppercase;
}

.locations-stat strong {
  color: var(--dex-accent);
  font-size: 1.6rem;
}

.locations-controls__grid {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.locations-search .r8-input-shell {
  background: var(--dex-surface-2);
  border-color: var(--dex-line);
}

.locations-search .r8-input {
  background: transparent;
  color: var(--dex-ink);
  min-width: 0;
  width: 100%;
}

.locations-search .r8-input__prefix {
  align-items: center;
  color: var(--dex-muted);
  display: flex;
}

.locations-feedback .r8-panel__body {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  justify-content: center;
  min-height: 240px;
  text-align: center;
}

.locations-workbench {
  align-items: start;
  display: grid;
  gap: 1rem;
  grid-template-columns: minmax(240px, 0.28fr) minmax(0, 1fr);
}

.region-profile {
  position: sticky;
  top: 8.75rem;
}

.region-profile__body {
  display: grid;
  gap: 1rem;
}

.region-profile__metric {
  background: var(--dex-surface-2);
  border: 2px solid var(--dex-line);
  display: grid;
  gap: 0.3rem;
  padding: 0.75rem;
}

.region-profile__metric strong {
  color: var(--dex-accent);
}

.region-profile__section {
  display: grid;
  gap: 0.55rem;
}

.region-profile__section h3,
.location-subsection h3,
.encounters-header h3,
.pal-park h3 {
  color: var(--dex-accent);
  font-size: 0.95rem;
  margin: 0;
}

.locations-chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.locations-chip-list--nowrap {
  flex-wrap: nowrap;
}

.location-console {
  min-width: 0;
}

.location-console__loading,
.locations-empty {
  display: grid;
  gap: 0.75rem;
  min-height: 180px;
  place-content: center;
  text-align: center;
}

.location-console__body {
  display: grid;
  gap: 1.25rem;
}

.location-heading {
  align-items: center;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
}

.location-heading h2 {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  margin: 0;
}

.location-subsection {
  display: grid;
  gap: 0.75rem;
}

.game-index-grid {
  display: grid;
  gap: 0.5rem;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
}

.game-index-card {
  background: var(--dex-surface-2);
  border: 2px solid var(--dex-line);
  display: flex;
  gap: 0.75rem;
  justify-content: space-between;
  padding: 0.65rem;
}

.game-index-card span {
  color: var(--dex-muted);
  font-size: 0.75rem;
}

.encounter-method-table {
  max-height: 20rem;
  overflow: auto;
}

.encounters-header {
  align-items: center;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
}

.encounters-table table {
  min-width: 780px;
}

.encounter-pokemon {
  align-items: center;
  color: inherit;
  display: flex;
  gap: 0.55rem;
  min-width: 10rem;
  text-decoration: none;
}

.encounter-pokemon:focus-visible {
  outline: var(--r8-focus-width) solid var(--r8-color-focus);
  outline-offset: var(--r8-focus-offset);
}

.encounter-pokemon img {
  height: 42px;
  image-rendering: pixelated;
  object-fit: contain;
  width: 42px;
}

.encounter-pokemon span {
  display: grid;
  gap: 0.15rem;
}

.encounter-pokemon small {
  color: var(--dex-muted);
  font-size: 0.65rem;
}

.locations-version-cell {
  max-width: 18rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.encounter-skeleton-grid {
  display: grid;
  gap: 0.5rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.pal-park__body {
  display: grid;
  gap: 1rem;
}

.pal-park__header {
  align-items: end;
  display: grid;
  gap: 1rem;
  grid-template-columns: minmax(0, 1fr) minmax(220px, 0.35fr);
}

.pal-park__header p {
  color: var(--dex-muted);
  line-height: 1.6;
  margin: 0;
}

.pal-park__table table {
  min-width: 520px;
}

@media (max-width: 1100px) {
  .locations-hero__body,
  .locations-workbench {
    grid-template-columns: 1fr;
  }

  .region-profile {
    position: static;
  }

  .region-profile__body {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .region-profile__section {
    grid-column: 1 / -1;
  }
}

@media (max-width: 820px) {
  .locations-controls__grid,
  .pal-park__header {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .pal-park__header > div:first-child {
    grid-column: 1 / -1;
  }
}

@media (max-width: 560px) {
  .locations-hero__copy,
  .location-heading,
  .encounters-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .locations-stats,
  .locations-controls__grid,
  .region-profile__body,
  .pal-park__header {
    grid-template-columns: 1fr;
  }

  .pal-park__header > div:first-child {
    grid-column: auto;
  }

  .encounter-skeleton-grid {
    grid-template-columns: 1fr;
  }
}
</style>

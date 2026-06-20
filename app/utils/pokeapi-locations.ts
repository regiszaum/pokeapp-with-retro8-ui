import type { AppLocale } from '../i18n/config'
import { POKEAPI_LANGUAGE_CHAIN } from '../i18n/config'
import { translate } from '../i18n/messages'
import type {
  LocationAreaDetailModel,
  LocationDetailModel,
  LocationOption,
  LocationsBootstrap,
  PalParkAreaDirectory,
  PokemonLocationEncounter,
  RegionDirectory
} from '../types/locations'
import { formatName, idFromUrl, pokemonSprite } from './format'
import { fetchLocalizedSpeciesNames } from './pokeapi-client'

const POKE_API = 'https://pokeapi.co/api/v2'
const locationCache = new Map<string, Promise<unknown>>()

interface NamedResource {
  name: string
  url: string
}

interface LocalizedName {
  name: string
  language: NamedResource
}

interface ListResponse {
  count: number
  results: NamedResource[]
}

interface RegionResponse {
  id: number
  name: string
  names: LocalizedName[]
  main_generation: NamedResource | null
  pokedexes: NamedResource[]
  version_groups: NamedResource[]
  locations: NamedResource[]
}

interface LocationResponse {
  id: number
  name: string
  names: LocalizedName[]
  region: NamedResource | null
  game_indices: {
    game_index: number
    generation: NamedResource
  }[]
  areas: NamedResource[]
}

interface LocationAreaResponse {
  id: number
  name: string
  names: LocalizedName[]
  game_index: number
  location: NamedResource
  encounter_method_rates: {
    encounter_method: NamedResource
    version_details: {
      rate: number
      version: NamedResource
    }[]
  }[]
  pokemon_encounters: {
    pokemon: NamedResource
    version_details: {
      max_chance: number
      version: NamedResource
      encounter_details: {
        chance: number
        min_level: number
        max_level: number
        method: NamedResource
        condition_values: NamedResource[]
      }[]
    }[]
  }[]
}

interface PalParkAreaResponse {
  id: number
  name: string
  names: LocalizedName[]
  pokemon_encounters: {
    base_score: number
    rate: number
    pokemon_species: NamedResource
  }[]
}

interface LocalizableResponse {
  names?: LocalizedName[]
}

const PAL_PARK_NAMES: Record<AppLocale, Record<string, string>> = {
  'pt-BR': { forest: 'Floresta', field: 'Campo', mountain: 'Montanha', pond: 'Lago', sea: 'Mar' },
  en: { forest: 'Forest', field: 'Field', mountain: 'Mountain', pond: 'Pond', sea: 'Sea' },
  ja: { forest: '森', field: '草原', mountain: '山', pond: '池', sea: '海' }
}

const ENCOUNTER_METHOD_NAMES: Partial<Record<AppLocale, Record<string, string>>> = {
  'pt-BR': {
    walk: 'Caminhando', 'old-rod': 'Vara velha', 'good-rod': 'Vara boa', 'super-rod': 'Supervara',
    surf: 'Surf', 'rock-smash': 'Quebra-pedra', 'headbutt': 'Cabeçada', 'dark-grass': 'Grama escura',
    'grass-spots': 'Pontos na grama', 'cave-spots': 'Pontos na caverna', 'bridge-spots': 'Pontos na ponte',
    'super-rod-spots': 'Pontos de Supervara', 'surf-spots': 'Pontos de Surf', 'yellow-flowers': 'Flores amarelas',
    'purple-flowers': 'Flores roxas', 'red-flowers': 'Flores vermelhas', 'rough-terrain': 'Terreno acidentado'
  }
}

async function locationFetch<T>(pathOrUrl: string): Promise<T> {
  const url = pathOrUrl.startsWith('http') ? pathOrUrl : `${POKE_API}${pathOrUrl}`
  const cached = locationCache.get(url) as Promise<T> | undefined
  if (cached) return await cached

  const request = $fetch<T>(url, { retry: 2, retryDelay: 150 }) as Promise<T>
  locationCache.set(url, request)

  try {
    return await request
  } catch (error) {
    locationCache.delete(url)
    throw error
  }
}

function localizedName(
  entries: LocalizedName[] | undefined,
  canonicalName: string,
  locale: AppLocale
): string {
  for (const language of POKEAPI_LANGUAGE_CHAIN[locale]) {
    const match = entries?.find((entry) => entry.language.name === language)
    if (match?.name) return match.name
  }
  return formatName(canonicalName)
}

function generationName(resource: NamedResource | null, locale: AppLocale): string {
  if (!resource) return translate(locale, 'common.unknown')
  const id = idFromUrl(resource.url)
  const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][id - 1]
  return roman ? translate(locale, 'api.generation', { roman }) : formatName(resource.name)
}

function locationOption(resource: NamedResource): LocationOption {
  return {
    id: idFromUrl(resource.url),
    name: resource.name,
    displayName: formatName(resource.name),
    url: resource.url
  }
}

async function encounterMethodName(resource: NamedResource, locale: AppLocale): Promise<string> {
  const manual = ENCOUNTER_METHOD_NAMES[locale]?.[resource.name]
  if (manual) return manual

  try {
    const response = await locationFetch<LocalizableResponse>(resource.url)
    return localizedName(response.names, resource.name, locale)
  } catch {
    return formatName(resource.name)
  }
}

export async function fetchLocationsBootstrap(locale: AppLocale): Promise<LocationsBootstrap> {
  const [regionList, locationList, areaList, palParkList, speciesNames] = await Promise.all([
    locationFetch<ListResponse>('/region?limit=100'),
    locationFetch<ListResponse>('/location?limit=1'),
    locationFetch<ListResponse>('/location-area?limit=1'),
    locationFetch<ListResponse>('/pal-park-area?limit=100'),
    fetchLocalizedSpeciesNames(locale)
  ])

  const [regionDetails, palParkDetails] = await Promise.all([
    Promise.all(regionList.results.map((region) => locationFetch<RegionResponse>(region.url))),
    Promise.all(palParkList.results.map((area) => locationFetch<PalParkAreaResponse>(area.url)))
  ])

  const regions: RegionDirectory[] = regionDetails
    .map((region) => ({
      id: region.id,
      name: region.name,
      displayName: localizedName(region.names, region.name, locale),
      mainGeneration: generationName(region.main_generation, locale),
      pokedexes: region.pokedexes.map((item) => formatName(item.name)),
      versionGroups: region.version_groups.map((item) => formatName(item.name)),
      locations: region.locations.map(locationOption).sort((a, b) =>
        a.displayName.localeCompare(b.displayName, locale)
      )
    }))
    .sort((a, b) => a.id - b.id)

  const palParkAreas: PalParkAreaDirectory[] = palParkDetails
    .map((area) => ({
      id: area.id,
      name: area.name,
      displayName: PAL_PARK_NAMES[locale][area.name]
        ?? localizedName(area.names, area.name, locale),
      encounters: area.pokemon_encounters.map((encounter) => {
        const id = idFromUrl(encounter.pokemon_species.url)
        return {
          id,
          name: encounter.pokemon_species.name,
          displayName: speciesNames.get(id) || formatName(encounter.pokemon_species.name),
          rate: encounter.rate,
          baseScore: encounter.base_score,
          image: pokemonSprite(id)
        }
      })
    }))
    .sort((a, b) => a.id - b.id)

  return {
    locale,
    counts: {
      regions: regionList.count,
      locations: locationList.count,
      areas: areaList.count,
      palParkAreas: palParkList.count
    },
    regions,
    palParkAreas
  }
}

export async function fetchLocationDetail(
  requestedName: string,
  locale: AppLocale
): Promise<LocationDetailModel> {
  const location = await locationFetch<LocationResponse>(`/location/${requestedName}`)
  const region = location.region
    ? await locationFetch<RegionResponse>(location.region.url)
    : null

  return {
    id: location.id,
    name: location.name,
    displayName: localizedName(location.names, location.name, locale),
    regionName: location.region?.name ?? '',
    regionDisplayName: region
      ? localizedName(region.names, region.name, locale)
      : translate(locale, 'common.unknown'),
    gameIndices: location.game_indices.map((entry) => ({
      generation: generationName(entry.generation, locale),
      index: entry.game_index
    })),
    areas: location.areas.map(locationOption)
  }
}

export async function fetchLocationAreaDetail(
  requestedName: string,
  locale: AppLocale
): Promise<LocationAreaDetailModel> {
  const [area, speciesNames] = await Promise.all([
    locationFetch<LocationAreaResponse>(`/location-area/${requestedName}`),
    fetchLocalizedSpeciesNames(locale)
  ])

  const methodResources = [
    ...new Map(
      [
        ...area.encounter_method_rates.map((rate) => rate.encounter_method),
        ...area.pokemon_encounters.flatMap((encounter) =>
          encounter.version_details.flatMap((version) =>
            version.encounter_details.map((detail) => detail.method)
          )
        )
      ].map((resource) => [resource.name, resource])
    ).values()
  ]
  const methodNames = new Map(
    await Promise.all(methodResources.map(async (resource) => [
      resource.name,
      await encounterMethodName(resource, locale)
    ] as const))
  )

  const encounters: PokemonLocationEncounter[] = area.pokemon_encounters.map((encounter) => {
    const id = idFromUrl(encounter.pokemon.url)
    const details = encounter.version_details.flatMap((version) => version.encounter_details)
    const levels = details.flatMap((detail) => [detail.min_level, detail.max_level])
    const methods = [...new Set(details.map((detail) =>
      methodNames.get(detail.method.name) ?? formatName(detail.method.name)
    ))]
    const versions = [...new Set(encounter.version_details.map((version) =>
      formatName(version.version.name)
    ))]
    const conditions = [...new Set(details.flatMap((detail) =>
      detail.condition_values.map((condition) => formatName(condition.name))
    ))]

    return {
      id,
      name: encounter.pokemon.name,
      displayName: speciesNames.get(id) || formatName(encounter.pokemon.name),
      image: pokemonSprite(id),
      minLevel: levels.length ? Math.min(...levels) : 0,
      maxLevel: levels.length ? Math.max(...levels) : 0,
      maxChance: Math.max(...encounter.version_details.map((version) => version.max_chance), 0),
      methods,
      versions,
      conditions
    }
  }).sort((a, b) => a.id - b.id)

  return {
    id: area.id,
    name: area.name,
    displayName: localizedName(area.names, area.name, locale),
    gameIndex: area.game_index,
    locationName: area.location.name,
    encounterMethods: area.encounter_method_rates.map((rate) => ({
      name: rate.encounter_method.name,
      displayName: methodNames.get(rate.encounter_method.name) ?? formatName(rate.encounter_method.name),
      versions: rate.version_details.map((version) => ({
        name: version.version.name,
        displayName: formatName(version.version.name),
        rate: version.rate
      }))
    })),
    encounters
  }
}

import type {
  DamageRelation,
  EvolutionNode,
  PokedexBootstrap,
  PokemonAbility,
  PokemonDetail,
  PokemonEntry,
  PokemonMove,
  PokemonStat
} from '../types/pokedex'
import type { AppLocale } from '../i18n/config'
import { POKEAPI_LANGUAGE_CHAIN } from '../i18n/config'
import { translate } from '../i18n/messages'
import type { ResourceCategory } from '../i18n/resources'
import { translateResourceName } from '../i18n/resources'

const POKE_API = 'https://pokeapi.co/api/v2'
const POKE_GRAPHQL = 'https://graphql.pokeapi.co/v1beta2'
const EXCLUDED_TYPES = new Set(['unknown', 'shadow'])
const responseCache = new Map<string, Promise<unknown>>()
const languageProfileCache = new Map<AppLocale, Promise<LanguageProfile>>()
const speciesNameIndexCache = new Map<AppLocale, Promise<Map<number, string>>>()

interface NamedResource {
  name: string
  url: string
}

interface LocalizedName {
  name: string
  language: NamedResource
}

interface LocalizableResourceResponse {
  names?: LocalizedName[]
}

interface LanguageResponse {
  id: number
  name: string
}

interface LanguageProfile {
  locale: AppLocale
  languages: LanguageResponse[]
}

interface ListResponse {
  count: number
  next: string | null
  previous: string | null
  results: NamedResource[]
}

interface GenerationResponse {
  id: number
  name: string
  names: LocalizedName[]
  main_region: NamedResource | null
  pokemon_species: NamedResource[]
}

interface TypeResponse {
  id: number
  name: string
  names: LocalizedName[]
  pokemon: {
    pokemon: NamedResource
    slot: number
  }[]
  damage_relations: {
    no_damage_from: NamedResource[]
    half_damage_from: NamedResource[]
    double_damage_from: NamedResource[]
  }
}

interface PokemonResponse {
  id: number
  name: string
  base_experience: number | null
  height: number
  weight: number
  species: NamedResource
  sprites: {
    front_default: string | null
    other?: {
      'official-artwork'?: {
        front_default: string | null
        front_shiny: string | null
      }
    }
  }
  cries?: {
    latest?: string | null
    legacy?: string | null
  }
  types: {
    slot: number
    type: NamedResource
  }[]
  stats: {
    base_stat: number
    stat: NamedResource
  }[]
  abilities: {
    is_hidden: boolean
    ability: NamedResource
  }[]
  moves: {
    move: NamedResource
    version_group_details: {
      level_learned_at: number
      move_learn_method: NamedResource
      version_group: NamedResource
    }[]
  }[]
}

interface PokemonSpeciesResponse {
  id: number
  name: string
  names: LocalizedName[]
  generation: NamedResource
  habitat: NamedResource | null
  color: NamedResource
  shape: NamedResource | null
  growth_rate: NamedResource
  egg_groups: NamedResource[]
  capture_rate: number
  base_happiness: number | null
  gender_rate: number
  is_legendary: boolean
  is_mythical: boolean
  evolution_chain: {
    url: string
  }
  genera: {
    genus: string
    language: NamedResource
  }[]
  flavor_text_entries: {
    flavor_text: string
    language: NamedResource
    version: NamedResource
  }[]
  varieties: {
    is_default: boolean
    pokemon: NamedResource
  }[]
}

interface RegionResponse {
  id: number
  name: string
  names: LocalizedName[]
}

interface EvolutionChainResponse {
  chain: EvolutionChainLink
}

interface EvolutionChainLink {
  species: NamedResource
  evolution_details: EvolutionDetail[]
  evolves_to: EvolutionChainLink[]
}

interface EvolutionDetail {
  min_level: number | null
  min_happiness: number | null
  min_affection: number | null
  min_beauty: number | null
  time_of_day: string
  item: NamedResource | null
  held_item: NamedResource | null
  known_move: NamedResource | null
  known_move_type: NamedResource | null
  location: NamedResource | null
  trigger: NamedResource | null
}

interface SpeciesNamesGraphqlResponse {
  data?: {
    pokemonspeciesname: {
      pokemon_species_id: number
      language_id: number
      name: string
    }[]
  }
  errors?: { message: string }[]
}

async function pokeFetch<T>(pathOrUrl: string): Promise<T> {
  const url = pathOrUrl.startsWith('http') ? pathOrUrl : `${POKE_API}${pathOrUrl}`
  const cached = responseCache.get(url) as Promise<T> | undefined
  if (cached) return await cached

  const request = $fetch<T>(url, {
    retry: 2,
    retryDelay: 150
  }) as Promise<T>

  responseCache.set(url, request)

  try {
    return await request
  } catch (error) {
    responseCache.delete(url)
    throw error
  }
}

function idFromUrl(url: string): number {
  const match = url.match(/\/(\d+)\/?$/)
  return match ? Number(match[1]) : 0
}

function generationLabel(name: string, id: number, locale: AppLocale): string {
  const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][id - 1]
  return roman ? translate(locale, 'api.generation', { roman }) : formatName(name)
}

async function getLanguageProfile(locale: AppLocale): Promise<LanguageProfile> {
  const cached = languageProfileCache.get(locale)
  if (cached) return await cached

  const request = Promise.all(
    POKEAPI_LANGUAGE_CHAIN[locale].map((language) =>
      pokeFetch<LanguageResponse>(`/language/${language}`)
    )
  ).then((languages) => ({ locale, languages }))

  languageProfileCache.set(locale, request)
  return await request
}

function preferredNames(profile: LanguageProfile): string[] {
  if (profile.locale === 'en') return ['en']
  return profile.languages.map((language) => language.name).filter((name) => name !== 'en')
}

function findPreferredName(entries: LocalizedName[] | undefined, profile: LanguageProfile): string | undefined {
  for (const language of preferredNames(profile)) {
    const match = entries?.find((entry) => entry.language.name === language)
    if (match?.name) return match.name
  }

  return undefined
}

function localizedName(
  entries: LocalizedName[] | undefined,
  canonicalName: string,
  profile: LanguageProfile,
  category?: ResourceCategory
): string {
  const preferred = findPreferredName(entries, profile)
  if (preferred) return preferred

  const localFallback = category
    ? translateResourceName(profile.locale, category, canonicalName)
    : undefined
  if (localFallback) return localFallback

  for (const language of profile.languages) {
    const match = entries?.find((entry) => entry.language.name === language.name)
    if (match?.name) return match.name
  }

  return formatName(canonicalName)
}

async function fetchResourceName(
  resource: NamedResource,
  profile: LanguageProfile,
  category?: ResourceCategory
): Promise<string> {
  const localFallback = category
    ? translateResourceName(profile.locale, category, resource.name)
    : undefined

  if (localFallback && profile.locale === 'pt-BR') return localFallback

  try {
    const response = await pokeFetch<LocalizableResourceResponse>(resource.url)
    return localizedName(response.names, resource.name, profile, category)
  } catch {
    return localFallback ?? formatName(resource.name)
  }
}

async function fetchSpeciesNameIndex(profile: LanguageProfile): Promise<Map<number, string>> {
  const cached = speciesNameIndexCache.get(profile.locale)
  if (cached) return await cached

  const request = (async () => {
    const response = await $fetch<SpeciesNamesGraphqlResponse>(POKE_GRAPHQL, {
      method: 'POST',
      retry: 2,
      retryDelay: 200,
      body: {
        query: `query SpeciesNames($languageIds: [Int!]) {
          pokemonspeciesname(
            where: { language_id: { _in: $languageIds } }
            limit: 10000
            order_by: { pokemon_species_id: asc }
          ) {
            pokemon_species_id
            language_id
            name
          }
        }`,
        variables: { languageIds: profile.languages.map((language) => language.id) }
      }
    })

    if (response.errors?.length) throw new Error(response.errors[0]?.message ?? 'PokéAPI GraphQL error')

    const rows = response.data?.pokemonspeciesname ?? []
    const bySpecies = new Map<number, Map<number, string>>()

    for (const row of rows) {
      const names = bySpecies.get(row.pokemon_species_id) ?? new Map<number, string>()
      names.set(row.language_id, row.name)
      bySpecies.set(row.pokemon_species_id, names)
    }

    return new Map(
      [...bySpecies.entries()].map(([speciesId, names]) => {
        const displayName = profile.languages
          .map((language) => names.get(language.id))
          .find((name): name is string => Boolean(name))
        return [speciesId, displayName ?? '']
      })
    )
  })().catch(() => new Map<number, string>())

  speciesNameIndexCache.set(profile.locale, request)
  return await request
}

export async function fetchLocalizedSpeciesNames(locale: AppLocale): Promise<Map<number, string>> {
  return await fetchSpeciesNameIndex(await getLanguageProfile(locale))
}

function pokemonImage(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
}

function pokemonShinyImage(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${id}.png`
}

function pokemonSprite(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
}

function normalizeFlavorText(value: string): string {
  return value.replace(/\f/g, ' ').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
}

function mapStats(pokemon: PokemonResponse, locale: AppLocale): PokemonStat[] {
  return pokemon.stats.map((stat) => ({
    name: stat.stat.name,
    displayName: translateResourceName(locale, 'stat', stat.stat.name) ?? formatName(stat.stat.name),
    value: stat.base_stat
  }))
}

async function mapAbilities(pokemon: PokemonResponse, profile: LanguageProfile): Promise<PokemonAbility[]> {
  return await Promise.all(pokemon.abilities.map(async (ability) => ({
    name: ability.ability.name,
    displayName: await fetchResourceName(ability.ability, profile),
    hidden: ability.is_hidden
  })))
}

async function mapMoves(pokemon: PokemonResponse, profile: LanguageProfile): Promise<PokemonMove[]> {
  const moves = pokemon.moves.map((move) => {
    const levelUp = move.version_group_details
      .filter((detail) => detail.move_learn_method.name === 'level-up')
      .sort((a, b) => b.version_group.url.localeCompare(a.version_group.url))[0]
    const latest = move.version_group_details.at(-1)

    return {
      name: move.move.name,
      resource: move.move,
      level: levelUp?.level_learned_at ?? null,
      method: levelUp?.move_learn_method.name ?? latest?.move_learn_method.name ?? 'unknown'
    }
  })

  const selected = moves
    .sort((a, b) => {
      if (a.level !== null && b.level !== null) return a.level - b.level
      if (a.level !== null) return -1
      if (b.level !== null) return 1
      return a.name.localeCompare(b.name)
    })
    .slice(0, 16)

  return await Promise.all(selected.map(async (move): Promise<PokemonMove> => ({
    name: move.name,
    displayName: await fetchResourceName(move.resource, profile),
    level: move.level,
    method: move.method
  })))
}

async function evolutionTrigger(
  detail: EvolutionDetail | undefined,
  depth: number,
  profile: LanguageProfile
): Promise<string> {
  const locale = profile.locale
  if (!detail || depth === 0) return translate(locale, 'api.evolution.base')
  if (detail.min_level) return translate(locale, 'api.evolution.level', { value: detail.min_level })
  if (detail.item) return translate(locale, 'api.evolution.use', { name: await fetchResourceName(detail.item, profile) })
  if (detail.held_item) return translate(locale, 'api.evolution.hold', { name: await fetchResourceName(detail.held_item, profile) })
  if (detail.min_happiness) return translate(locale, 'api.evolution.happiness', { value: detail.min_happiness })
  if (detail.min_affection) return translate(locale, 'api.evolution.affection', { value: detail.min_affection })
  if (detail.min_beauty) return translate(locale, 'api.evolution.beauty', { value: detail.min_beauty })
  if (detail.known_move) return translate(locale, 'api.evolution.learn', { name: await fetchResourceName(detail.known_move, profile) })
  if (detail.known_move_type) return translate(locale, 'api.evolution.moveType', { name: await fetchResourceName(detail.known_move_type, profile, 'type') })
  if (detail.location) return translate(locale, 'api.evolution.at', { name: await fetchResourceName(detail.location, profile) })
  if (detail.trigger?.name === 'trade') return translate(locale, 'api.evolution.trade')
  if (detail.time_of_day === 'day') return translate(locale, 'api.time.day')
  if (detail.time_of_day === 'night') return translate(locale, 'api.time.night')
  if (detail.trigger) return await fetchResourceName(detail.trigger, profile)
  return translate(locale, 'api.evolution.default')
}

async function flattenEvolution(
  chain: EvolutionChainLink,
  profile: LanguageProfile,
  speciesNames: Map<number, string>,
  depth = 0
): Promise<EvolutionNode[]> {
  const id = idFromUrl(chain.species.url)
  const current: EvolutionNode = {
    id,
    name: chain.species.name,
    displayName: speciesNames.get(id) || formatName(chain.species.name),
    trigger: await evolutionTrigger(chain.evolution_details[0], depth, profile),
    depth,
    image: pokemonSprite(id)
  }

  const children = await Promise.all(
    chain.evolves_to.map((child) => flattenEvolution(child, profile, speciesNames, depth + 1))
  )

  return [
    current,
    ...children.flat()
  ]
}

function summarizeDamage(typeDetails: TypeResponse[], locale: AppLocale): {
  weaknesses: DamageRelation[]
  resistances: DamageRelation[]
  immunities: DamageRelation[]
} {
  const multipliers = new Map<string, number>()

  for (const type of typeDetails) {
    for (const relation of type.damage_relations.double_damage_from) {
      multipliers.set(relation.name, (multipliers.get(relation.name) ?? 1) * 2)
    }

    for (const relation of type.damage_relations.half_damage_from) {
      multipliers.set(relation.name, (multipliers.get(relation.name) ?? 1) * 0.5)
    }

    for (const relation of type.damage_relations.no_damage_from) {
      multipliers.set(relation.name, 0)
    }
  }

  const mapRelation = ([name, multiplier]: [string, number]): DamageRelation => ({
    name,
    displayName: translateResourceName(locale, 'type', name) ?? formatName(name),
    multiplier
  })

  const sortByImpact = (a: DamageRelation, b: DamageRelation) =>
    b.multiplier - a.multiplier || a.displayName.localeCompare(b.displayName, locale)

  return {
    weaknesses: [...multipliers.entries()]
      .filter(([, multiplier]) => multiplier > 1)
      .map(mapRelation)
      .sort(sortByImpact),
    resistances: [...multipliers.entries()]
      .filter(([, multiplier]) => multiplier > 0 && multiplier < 1)
      .map(mapRelation)
      .sort((a, b) => a.multiplier - b.multiplier || a.displayName.localeCompare(b.displayName, locale)),
    immunities: [...multipliers.entries()]
      .filter(([, multiplier]) => multiplier === 0)
      .map(mapRelation)
      .sort((a, b) => a.displayName.localeCompare(b.displayName, locale))
  }
}

function localizedText<T extends { language: NamedResource }>(
  entries: T[],
  profile: LanguageProfile,
  getText: (entry: T) => string
): string {
  for (const language of profile.languages) {
    const matches = entries.filter((entry) => entry.language.name === language.name)
    const value = matches.map(getText).filter(Boolean).at(-1)
    if (value) return value
  }

  return ''
}

export async function fetchPokedexBootstrap(locale: AppLocale = 'pt-BR'): Promise<PokedexBootstrap> {
  const [profile, generationsList, typeList] = await Promise.all([
    getLanguageProfile(locale),
    pokeFetch<ListResponse>('/generation?limit=100'),
    pokeFetch<ListResponse>('/type?limit=100')
  ])

  const [generations, typeDetails, localizedSpeciesNames] = await Promise.all([
    Promise.all(
      generationsList.results.map((generation) => pokeFetch<GenerationResponse>(generation.url))
    ),
    Promise.all(
      typeList.results
        .filter((type) => !EXCLUDED_TYPES.has(type.name))
        .map((type) => pokeFetch<TypeResponse>(type.url))
    ),
    fetchSpeciesNameIndex(profile)
  ])

  const regionResources = [
    ...new Map(
      generations
        .map((generation) => generation.main_region)
        .filter((region): region is NamedResource => Boolean(region))
        .map((region) => [region.url, region])
    ).values()
  ]
  const regions = await Promise.all(
    regionResources.map((region) => pokeFetch<RegionResponse>(region.url))
  )
  const regionsByName = new Map(regions.map((region) => [region.name, region]))

  const generationSummaries = generations
    .sort((a, b) => a.id - b.id)
    .map((generation) => {
      const speciesIds = generation.pokemon_species.map((species) => idFromUrl(species.url))
      const region = generation.main_region
        ? regionsByName.get(generation.main_region.name)
        : undefined

      return {
        id: generation.id,
        name: generation.name,
        label: findPreferredName(generation.names, profile)
          ?? generationLabel(generation.name, generation.id, locale),
        region: generation.main_region
          ? localizedName(region?.names, generation.main_region.name, profile)
          : translate(locale, 'api.global'),
        speciesCount: generation.pokemon_species.length,
        firstSpeciesId: Math.min(...speciesIds),
        lastSpeciesId: Math.max(...speciesIds)
      }
    })

  const pokemon: PokemonEntry[] = generations
    .flatMap((generation) =>
      generation.pokemon_species.map((species) => {
        const id = idFromUrl(species.url)
        const summary = generationSummaries.find((item) => item.id === generation.id)

        return {
          id,
          name: species.name,
          displayName: localizedSpeciesNames.get(id) || formatName(species.name),
          generationId: generation.id,
          generationName: generation.name,
          generationLabel: summary?.label ?? generationLabel(generation.name, generation.id, locale),
          region: summary?.region ?? translate(locale, 'api.global'),
          url: species.url,
          image: pokemonImage(id)
        }
      })
    )
    .sort((a, b) => a.id - b.id)

  const speciesNames = new Set(pokemon.map((entry) => entry.name))
  const resolveSpeciesName = (pokemonName: string) => {
    if (speciesNames.has(pokemonName)) return pokemonName

    const parts = pokemonName.split('-')
    for (let index = parts.length - 1; index > 0; index -= 1) {
      const candidate = parts.slice(0, index).join('-')
      if (speciesNames.has(candidate)) return candidate
    }

    return pokemonName
  }

  const typeIndex = Object.fromEntries(
    typeDetails.map((type) => [
      type.name,
      [...new Set(type.pokemon.map((entry) => resolveSpeciesName(entry.pokemon.name)))].sort()
    ])
  )

  const types = typeDetails
    .map((type) => ({
      name: type.name,
      displayName: localizedName(type.names, type.name, profile, 'type'),
      pokemonCount: type.pokemon.length
    }))
    .filter((type) => type.pokemonCount > 0)
    .sort((a, b) => a.displayName.localeCompare(b.displayName, locale))

  return {
    locale,
    generatedAt: new Date().toISOString(),
    totalSpecies: pokemon.length,
    generations: generationSummaries,
    types,
    typeIndex,
    pokemon
  }
}

export async function fetchPokemonDetail(
  requestedName: string,
  locale: AppLocale = 'pt-BR'
): Promise<PokemonDetail> {
  const [profile, species] = await Promise.all([
    getLanguageProfile(locale),
    pokeFetch<PokemonSpeciesResponse>(`/pokemon-species/${requestedName}`)
  ])
  const defaultVariety = species.varieties.find((variety) => variety.is_default) ?? species.varieties[0]
  const pokemon = await pokeFetch<PokemonResponse>(defaultVariety?.pokemon.url ?? `/pokemon/${requestedName}`)
  const sortedTypes = [...pokemon.types].sort((a, b) => a.slot - b.slot)

  const [evolutionChain, generation, localizedSpeciesNames, ...typeDetails] = await Promise.all([
    pokeFetch<EvolutionChainResponse>(species.evolution_chain.url),
    pokeFetch<GenerationResponse>(species.generation.url),
    fetchSpeciesNameIndex(profile),
    ...sortedTypes
      .map((slot) => pokeFetch<TypeResponse>(slot.type.url))
  ])

  const generationId = idFromUrl(species.generation.url)
  const official = pokemon.sprites.other?.['official-artwork']
  const [stats, abilities, moves, evolution, habitat, growthRate, eggGroups, color, shape] = await Promise.all([
    Promise.resolve(mapStats(pokemon, locale)),
    mapAbilities(pokemon, profile),
    mapMoves(pokemon, profile),
    flattenEvolution(evolutionChain.chain, profile, localizedSpeciesNames),
    species.habitat ? fetchResourceName(species.habitat, profile, 'habitat') : Promise.resolve(null),
    fetchResourceName(species.growth_rate, profile, 'growth-rate'),
    Promise.all(species.egg_groups.map((group) => fetchResourceName(group, profile, 'egg-group'))),
    fetchResourceName(species.color, profile),
    species.shape ? fetchResourceName(species.shape, profile) : Promise.resolve(null)
  ])
  const displayName = localizedSpeciesNames.get(species.id)
    || localizedName(species.names, species.name, profile)

  return {
    id: pokemon.id,
    name: pokemon.name,
    displayName,
    speciesName: species.name,
    types: typeDetails.map((type) => ({
      name: type.name,
      displayName: localizedName(type.names, type.name, profile, 'type')
    })),
    height: pokemon.height,
    weight: pokemon.weight,
    baseExperience: pokemon.base_experience,
    image: official?.front_default ?? pokemonImage(pokemon.id),
    shinyImage: official?.front_shiny ?? pokemonShinyImage(pokemon.id),
    sprite: pokemon.sprites.front_default ?? pokemonSprite(pokemon.id),
    cries: {
      latest: pokemon.cries?.latest ?? null,
      legacy: pokemon.cries?.legacy ?? null
    },
    stats,
    abilities,
    moves,
    moveCount: pokemon.moves.length,
    species: {
      generation: findPreferredName(generation.names, profile)
        ?? generationLabel(species.generation.name, generationId, locale),
      generationId,
      genus: localizedText(species.genera, profile, (entry) => entry.genus),
      flavorText: normalizeFlavorText(
        localizedText(species.flavor_text_entries, profile, (entry) => entry.flavor_text)
      ),
      habitat,
      color,
      shape,
      growthRate,
      eggGroups,
      captureRate: species.capture_rate,
      baseHappiness: species.base_happiness,
      genderRate: species.gender_rate,
      legendary: species.is_legendary,
      mythical: species.is_mythical
    },
    varieties: species.varieties.map((variety) => ({
      name: variety.pokemon.name,
      displayName: variety.is_default ? displayName : formatName(variety.pokemon.name),
      default: variety.is_default
    })),
    evolution,
    damage: summarizeDamage(typeDetails, locale)
  }
}

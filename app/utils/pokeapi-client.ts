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

const POKE_API = 'https://pokeapi.co/api/v2'
const EXCLUDED_TYPES = new Set(['unknown', 'shadow'])

interface NamedResource {
  name: string
  url: string
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
  main_region: NamedResource | null
  pokemon_species: NamedResource[]
}

interface TypeResponse {
  id: number
  name: string
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

const STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  attack: 'Ataque',
  defense: 'Defesa',
  'special-attack': 'Ataque Esp.',
  'special-defense': 'Defesa Esp.',
  speed: 'Velocidade'
}

async function pokeFetch<T>(pathOrUrl: string): Promise<T> {
  const url = pathOrUrl.startsWith('http') ? pathOrUrl : `${POKE_API}${pathOrUrl}`
  return await $fetch<T>(url, {
    retry: 2,
    retryDelay: 150
  }) as T
}

function idFromUrl(url: string): number {
  const match = url.match(/\/(\d+)\/?$/)
  return match ? Number(match[1]) : 0
}

function formatStatName(value: string): string {
  return STAT_LABELS[value] ?? formatName(value)
}

function generationLabel(name: string, id: number): string {
  const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][id - 1]
  return roman ? `Geração ${roman}` : formatName(name)
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

function mapStats(pokemon: PokemonResponse): PokemonStat[] {
  return pokemon.stats.map((stat) => ({
    name: stat.stat.name,
    displayName: formatStatName(stat.stat.name),
    value: stat.base_stat
  }))
}

function mapAbilities(pokemon: PokemonResponse): PokemonAbility[] {
  return pokemon.abilities.map((ability) => ({
    name: ability.ability.name,
    displayName: formatName(ability.ability.name),
    hidden: ability.is_hidden
  }))
}

function mapMoves(pokemon: PokemonResponse): PokemonMove[] {
  const moves = pokemon.moves.map((move) => {
    const levelUp = move.version_group_details
      .filter((detail) => detail.move_learn_method.name === 'level-up')
      .sort((a, b) => b.version_group.url.localeCompare(a.version_group.url))[0]
    const latest = move.version_group_details.at(-1)

    return {
      name: move.move.name,
      displayName: formatName(move.move.name),
      level: levelUp?.level_learned_at ?? null,
      method: levelUp?.move_learn_method.name ?? latest?.move_learn_method.name ?? 'unknown'
    }
  })

  return moves
    .sort((a, b) => {
      if (a.level !== null && b.level !== null) return a.level - b.level
      if (a.level !== null) return -1
      if (b.level !== null) return 1
      return a.displayName.localeCompare(b.displayName)
    })
    .slice(0, 16)
}

function evolutionTrigger(detail: EvolutionDetail | undefined, depth: number): string {
  if (!detail || depth === 0) return 'Base'
  if (detail.min_level) return `Nível ${detail.min_level}`
  if (detail.item) return `Usar ${formatName(detail.item.name)}`
  if (detail.held_item) return `Segurar ${formatName(detail.held_item.name)}`
  if (detail.min_happiness) return `Felicidade ${detail.min_happiness}+`
  if (detail.min_affection) return `Afeição ${detail.min_affection}+`
  if (detail.min_beauty) return `Beleza ${detail.min_beauty}+`
  if (detail.known_move) return `Aprender ${formatName(detail.known_move.name)}`
  if (detail.known_move_type) return `Golpe ${formatName(detail.known_move_type.name)}`
  if (detail.location) return `Em ${formatName(detail.location.name)}`
  if (detail.trigger?.name === 'trade') return 'Troca'
  if (detail.time_of_day) return formatName(detail.time_of_day)
  return detail.trigger ? formatName(detail.trigger.name) : 'Evolução'
}

function flattenEvolution(chain: EvolutionChainLink, depth = 0): EvolutionNode[] {
  const id = idFromUrl(chain.species.url)
  const current: EvolutionNode = {
    id,
    name: chain.species.name,
    displayName: formatName(chain.species.name),
    trigger: evolutionTrigger(chain.evolution_details[0], depth),
    depth,
    image: pokemonSprite(id)
  }

  return [
    current,
    ...chain.evolves_to.flatMap((child) => flattenEvolution(child, depth + 1))
  ]
}

function summarizeDamage(typeDetails: TypeResponse[]): {
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
    displayName: formatName(name),
    multiplier
  })

  const sortByImpact = (a: DamageRelation, b: DamageRelation) =>
    b.multiplier - a.multiplier || a.displayName.localeCompare(b.displayName)

  return {
    weaknesses: [...multipliers.entries()]
      .filter(([, multiplier]) => multiplier > 1)
      .map(mapRelation)
      .sort(sortByImpact),
    resistances: [...multipliers.entries()]
      .filter(([, multiplier]) => multiplier > 0 && multiplier < 1)
      .map(mapRelation)
      .sort((a, b) => a.multiplier - b.multiplier || a.displayName.localeCompare(b.displayName)),
    immunities: [...multipliers.entries()]
      .filter(([, multiplier]) => multiplier === 0)
      .map(mapRelation)
      .sort((a, b) => a.displayName.localeCompare(b.displayName))
  }
}

export async function fetchPokedexBootstrap(): Promise<PokedexBootstrap> {
  const generationsList = await pokeFetch<ListResponse>('/generation?limit=100')
  const typeList = await pokeFetch<ListResponse>('/type?limit=100')

  const generations = await Promise.all(
    generationsList.results.map((generation) => pokeFetch<GenerationResponse>(generation.url))
  )

  const typeDetails = await Promise.all(
    typeList.results
      .filter((type) => !EXCLUDED_TYPES.has(type.name))
      .map((type) => pokeFetch<TypeResponse>(type.url))
  )

  const generationSummaries = generations
    .sort((a, b) => a.id - b.id)
    .map((generation) => {
      const speciesIds = generation.pokemon_species.map((species) => idFromUrl(species.url))

      return {
        id: generation.id,
        name: generation.name,
        label: generationLabel(generation.name, generation.id),
        region: generation.main_region ? formatName(generation.main_region.name) : 'Global',
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
          displayName: formatName(species.name),
          generationId: generation.id,
          generationName: generation.name,
          generationLabel: summary?.label ?? generationLabel(generation.name, generation.id),
          region: summary?.region ?? 'Global',
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
      displayName: formatName(type.name),
      pokemonCount: type.pokemon.length
    }))
    .filter((type) => type.pokemonCount > 0)
    .sort((a, b) => a.displayName.localeCompare(b.displayName))

  return {
    generatedAt: new Date().toISOString(),
    totalSpecies: pokemon.length,
    generations: generationSummaries,
    types,
    typeIndex,
    pokemon
  }
}

export async function fetchPokemonDetail(requestedName: string): Promise<PokemonDetail> {
  const species = await pokeFetch<PokemonSpeciesResponse>(`/pokemon-species/${requestedName}`)
  const defaultVariety = species.varieties.find((variety) => variety.is_default) ?? species.varieties[0]
  const pokemon = await pokeFetch<PokemonResponse>(defaultVariety?.pokemon.url ?? `/pokemon/${requestedName}`)

  const [evolutionChain, ...typeDetails] = await Promise.all([
    pokeFetch<EvolutionChainResponse>(species.evolution_chain.url),
    ...pokemon.types
      .sort((a, b) => a.slot - b.slot)
      .map((slot) => pokeFetch<TypeResponse>(slot.type.url))
  ])

  const genus = species.genera.find((entry) => entry.language.name === 'en')?.genus ?? ''
  const flavorText = species.flavor_text_entries.find((entry) => entry.language.name === 'en')
  const generationId = idFromUrl(species.generation.url)
  const official = pokemon.sprites.other?.['official-artwork']

  return {
    id: pokemon.id,
    name: pokemon.name,
    displayName: formatName(species.name),
    speciesName: species.name,
    types: pokemon.types.sort((a, b) => a.slot - b.slot).map((slot) => slot.type.name),
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
    stats: mapStats(pokemon),
    abilities: mapAbilities(pokemon),
    moves: mapMoves(pokemon),
    moveCount: pokemon.moves.length,
    species: {
      generation: generationLabel(species.generation.name, generationId),
      generationId,
      genus,
      flavorText: flavorText ? normalizeFlavorText(flavorText.flavor_text) : '',
      habitat: species.habitat?.name ?? null,
      color: species.color.name,
      shape: species.shape?.name ?? null,
      growthRate: formatName(species.growth_rate.name),
      eggGroups: species.egg_groups.map((group) => formatName(group.name)),
      captureRate: species.capture_rate,
      baseHappiness: species.base_happiness,
      genderRate: species.gender_rate,
      legendary: species.is_legendary,
      mythical: species.is_mythical
    },
    varieties: species.varieties.map((variety) => ({
      name: variety.pokemon.name,
      displayName: formatName(variety.pokemon.name),
      default: variety.is_default
    })),
    evolution: flattenEvolution(evolutionChain.chain),
    damage: summarizeDamage(typeDetails)
  }
}

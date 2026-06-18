export interface GenerationSummary {
  id: number
  name: string
  label: string
  region: string
  speciesCount: number
  firstSpeciesId: number
  lastSpeciesId: number
}

export interface TypeSummary {
  name: string
  displayName: string
  pokemonCount: number
}

export interface PokemonEntry {
  id: number
  name: string
  displayName: string
  generationId: number
  generationName: string
  generationLabel: string
  region: string
  url: string
  image: string
}

export interface PokedexBootstrap {
  generatedAt: string
  totalSpecies: number
  generations: GenerationSummary[]
  types: TypeSummary[]
  typeIndex: Record<string, string[]>
  pokemon: PokemonEntry[]
}

export interface PokemonStat {
  name: string
  displayName: string
  value: number
}

export interface PokemonAbility {
  name: string
  displayName: string
  hidden: boolean
}

export interface PokemonMove {
  name: string
  displayName: string
  level: number | null
  method: string
}

export interface EvolutionNode {
  id: number
  name: string
  displayName: string
  trigger: string
  depth: number
  image: string
}

export interface DamageRelation {
  name: string
  displayName: string
  multiplier: number
}

export interface PokemonDetail {
  id: number
  name: string
  displayName: string
  speciesName: string
  types: string[]
  height: number
  weight: number
  baseExperience: number | null
  image: string
  shinyImage: string
  sprite: string
  cries: {
    latest: string | null
    legacy: string | null
  }
  stats: PokemonStat[]
  abilities: PokemonAbility[]
  moves: PokemonMove[]
  moveCount: number
  species: {
    generation: string
    generationId: number
    genus: string
    flavorText: string
    habitat: string | null
    color: string
    shape: string | null
    growthRate: string
    eggGroups: string[]
    captureRate: number
    baseHappiness: number | null
    genderRate: number
    legendary: boolean
    mythical: boolean
  }
  varieties: {
    name: string
    displayName: string
    default: boolean
  }[]
  evolution: EvolutionNode[]
  damage: {
    weaknesses: DamageRelation[]
    resistances: DamageRelation[]
    immunities: DamageRelation[]
  }
}

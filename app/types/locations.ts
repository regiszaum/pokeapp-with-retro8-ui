import type { AppLocale } from '../i18n/config'

export interface LocationOption {
  id: number
  name: string
  displayName: string
  url: string
}

export interface RegionDirectory {
  id: number
  name: string
  displayName: string
  mainGeneration: string
  pokedexes: string[]
  versionGroups: string[]
  locations: LocationOption[]
}

export interface PalParkEncounter {
  id: number
  name: string
  displayName: string
  rate: number
  baseScore: number
  image: string
}

export interface PalParkAreaDirectory {
  id: number
  name: string
  displayName: string
  encounters: PalParkEncounter[]
}

export interface LocationsBootstrap {
  locale: AppLocale
  counts: {
    regions: number
    locations: number
    areas: number
    palParkAreas: number
  }
  regions: RegionDirectory[]
  palParkAreas: PalParkAreaDirectory[]
}

export interface LocationDetailModel {
  id: number
  name: string
  displayName: string
  regionName: string
  regionDisplayName: string
  gameIndices: {
    generation: string
    index: number
  }[]
  areas: LocationOption[]
}

export interface EncounterMethodRate {
  name: string
  displayName: string
  versions: {
    name: string
    displayName: string
    rate: number
  }[]
}

export interface PokemonLocationEncounter {
  id: number
  name: string
  displayName: string
  image: string
  minLevel: number
  maxLevel: number
  maxChance: number
  methods: string[]
  versions: string[]
  conditions: string[]
}

export interface LocationAreaDetailModel {
  id: number
  name: string
  displayName: string
  gameIndex: number
  locationName: string
  encounterMethods: EncounterMethodRate[]
  encounters: PokemonLocationEncounter[]
}

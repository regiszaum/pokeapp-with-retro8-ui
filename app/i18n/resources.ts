import type { AppLocale } from './config'

type ResourceCategory = 'type' | 'stat' | 'habitat' | 'growth-rate' | 'egg-group'

const ptBR: Partial<Record<ResourceCategory, Record<string, string>>> = {
  type: {
    normal: 'Normal', fire: 'Fogo', water: 'Água', electric: 'Elétrico', grass: 'Planta', ice: 'Gelo',
    fighting: 'Lutador', poison: 'Veneno', ground: 'Terrestre', flying: 'Voador', psychic: 'Psíquico',
    bug: 'Inseto', rock: 'Pedra', ghost: 'Fantasma', dragon: 'Dragão', dark: 'Sombrio', steel: 'Aço', fairy: 'Fada'
  },
  stat: {
    hp: 'HP', attack: 'Ataque', defense: 'Defesa', 'special-attack': 'Ataque Esp.',
    'special-defense': 'Defesa Esp.', speed: 'Velocidade'
  },
  habitat: {
    cave: 'Caverna', forest: 'Floresta', grassland: 'Campo', mountain: 'Montanha', rare: 'Raro',
    'rough-terrain': 'Terreno acidentado', sea: 'Mar', urban: 'Urbano', 'waters-edge': "Margem d'água"
  },
  'growth-rate': {
    slow: 'Lento', medium: 'Médio', fast: 'Rápido', 'medium-slow': 'Médio-lento',
    'slow-then-very-fast': 'Lento, depois muito rápido', 'fast-then-very-slow': 'Rápido, depois muito lento'
  },
  'egg-group': {
    monster: 'Monstro', water1: 'Água 1', bug: 'Inseto', flying: 'Voador', field: 'Campo', fairy: 'Fada',
    grass: 'Planta', 'human-like': 'Humanoide', water3: 'Água 3', mineral: 'Mineral', amorphous: 'Amorfo',
    water2: 'Água 2', ditto: 'Ditto', dragon: 'Dragão', undiscovered: 'Desconhecido'
  }
}

const ja: Partial<Record<ResourceCategory, Record<string, string>>> = {
  type: {
    normal: 'ノーマル', fire: 'ほのお', water: 'みず', electric: 'でんき', grass: 'くさ', ice: 'こおり',
    fighting: 'かくとう', poison: 'どく', ground: 'じめん', flying: 'ひこう', psychic: 'エスパー',
    bug: 'むし', rock: 'いわ', ghost: 'ゴースト', dragon: 'ドラゴン', dark: 'あく', steel: 'はがね', fairy: 'フェアリー'
  },
  stat: {
    hp: 'HP', attack: 'こうげき', defense: 'ぼうぎょ', 'special-attack': 'とくこう',
    'special-defense': 'とくぼう', speed: 'すばやさ'
  },
  habitat: {
    cave: '洞窟', forest: '森', grassland: '草原', mountain: '山', rare: '特殊',
    'rough-terrain': '荒れ地', sea: '海', urban: '街', 'waters-edge': '水辺'
  },
  'growth-rate': {
    slow: '遅い', medium: '普通', fast: '早い', 'medium-slow': 'やや遅い',
    'slow-then-very-fast': '初めは遅く後で非常に早い',
    'fast-then-very-slow': '初めは早く後で非常に遅い'
  }
}

export function translateResourceName(
  locale: AppLocale,
  category: ResourceCategory,
  name: string
): string | undefined {
  if (locale === 'pt-BR') return ptBR[category]?.[name]
  if (locale === 'ja') return ja[category]?.[name]
  return undefined
}

export type { ResourceCategory }

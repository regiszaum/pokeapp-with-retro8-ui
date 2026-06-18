const STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  attack: 'Ataque',
  defense: 'Defesa',
  'special-attack': 'Ataque Esp.',
  'special-defense': 'Defesa Esp.',
  speed: 'Velocidade'
}

export function formatName(value: string): string {
  return value
    .split('-')
    .map((part) => {
      if (part === 'mr') return 'Mr.'
      if (part === 'mime') return 'Mime'
      if (part === 'jr') return 'Jr.'
      if (part === 'hp') return 'HP'
      return part.charAt(0).toUpperCase() + part.slice(1)
    })
    .join(' ')
    .replace('Nidoran F', 'Nidoran ♀')
    .replace('Nidoran M', 'Nidoran ♂')
}

export function formatStatName(value: string): string {
  return STAT_LABELS[value] ?? formatName(value)
}

export function pokemonImage(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
}

export function pokemonShinyImage(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${id}.png`
}

export function pokemonSprite(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
}

export function idFromUrl(url: string): number {
  const match = url.match(/\/(\d+)\/?$/)
  return match ? Number(match[1]) : 0
}

export function generationLabel(name: string, id: number): string {
  const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][id - 1]
  return roman ? `Geração ${roman}` : formatName(name)
}

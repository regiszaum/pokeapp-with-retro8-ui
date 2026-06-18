<template>
  <article
    class="r8-panel pokemon-card"
    :class="{ 'is-selected': selected, 'is-caught': caught }"
  >
    <button
      class="pokemon-card__select"
      type="button"
      :aria-label="`Abrir detalhes de ${pokemon.displayName}`"
      :aria-pressed="selected"
      @click="$emit('select', pokemon.name)"
    >
      <span class="pokemon-card__number">#{{ pokemon.id.toString().padStart(4, '0') }}</span>
      <span class="pokemon-card__image-wrap">
        <img
          class="pokemon-card__image"
          :src="pokemon.image"
          :alt="pokemon.displayName"
          loading="lazy"
        >
      </span>
      <span class="pokemon-card__name">{{ pokemon.displayName }}</span>
      <span class="pokemon-card__meta">{{ pokemon.generationLabel }} · {{ pokemon.region }}</span>
    </button>

    <div class="pokemon-card__actions">
      <button
        class="r8-btn r8-btn--sm pokemon-icon-btn"
        :class="favorite ? 'r8-btn--danger' : 'r8-btn--secondary'"
        type="button"
        :aria-label="favorite ? `Remover ${pokemon.displayName} dos favoritos` : `Favoritar ${pokemon.displayName}`"
        data-r8-toggle="tooltip"
        :data-r8-target="`#tip-fav-${pokemon.name}`"
        @click="$emit('toggleFavorite', pokemon.name)"
      >
        <Heart class="pokemon-icon" aria-hidden="true" :fill="favorite ? 'currentColor' : 'none'" />
      </button>
      <div :id="`tip-fav-${pokemon.name}`" class="r8-poptip" data-r8-variant="hint" hidden>
        {{ favorite ? 'Remover favorito' : 'Favoritar' }}
      </div>

      <button
        class="r8-btn r8-btn--sm pokemon-icon-btn"
        :class="caught ? 'r8-btn--success' : 'r8-btn--secondary'"
        type="button"
        :aria-label="caught ? `Marcar ${pokemon.displayName} como não capturado` : `Marcar ${pokemon.displayName} como capturado`"
        data-r8-toggle="tooltip"
        :data-r8-target="`#tip-caught-${pokemon.name}`"
        @click="$emit('toggleCaught', pokemon.name)"
      >
        <Check class="pokemon-icon" aria-hidden="true" />
      </button>
      <div :id="`tip-caught-${pokemon.name}`" class="r8-poptip" data-r8-variant="hint" hidden>
        {{ caught ? 'Capturado' : 'Marcar capturado' }}
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { Check, Heart } from '@lucide/vue'
import type { PokemonEntry } from '../types/pokedex'

defineProps<{
  pokemon: PokemonEntry
  selected: boolean
  favorite: boolean
  caught: boolean
}>()

defineEmits<{
  select: [name: string]
  toggleFavorite: [name: string]
  toggleCaught: [name: string]
}>()
</script>

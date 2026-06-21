<template>
  <article
    class="r8-panel pokemon-card"
    :class="{ 'is-selected': selected, 'is-caught': caught }"
  >
    <button
      class="pokemon-card__select"
      type="button"
      :aria-label="t('card.open', { name: pokemon.displayName })"
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
        :aria-label="favorite ? t('card.removeFavoriteFor', { name: pokemon.displayName }) : t('card.addFavoriteFor', { name: pokemon.displayName })"
        data-r8-toggle="tooltip"
        :data-r8-target="`#tip-fav-${pokemon.name}`"
        @click="$emit('toggleFavorite', pokemon.name)"
      >
        <PixelIcon class="pokemon-icon" name="heart" />
      </button>
      <div :id="`tip-fav-${pokemon.name}`" class="r8-poptip" data-r8-variant="hint" hidden>
        {{ favorite ? t('card.removeFavorite') : t('card.favorite') }}
      </div>

      <button
        class="r8-btn r8-btn--sm pokemon-icon-btn"
        :class="caught ? 'r8-btn--success' : 'r8-btn--secondary'"
        type="button"
        :aria-label="caught ? t('card.markNotCaught', { name: pokemon.displayName }) : t('card.markCaught', { name: pokemon.displayName })"
        data-r8-toggle="tooltip"
        :data-r8-target="`#tip-caught-${pokemon.name}`"
        @click="$emit('toggleCaught', pokemon.name)"
      >
        <PixelIcon class="pokemon-icon" name="check" />
      </button>
      <div :id="`tip-caught-${pokemon.name}`" class="r8-poptip" data-r8-variant="hint" hidden>
        {{ caught ? t('card.caught') : t('card.markCaughtShort') }}
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { PokemonEntry } from '../types/pokedex'

const { t } = useAppI18n()

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

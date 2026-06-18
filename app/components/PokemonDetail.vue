<template>
  <section class="r8-window pokemon-detail" aria-live="polite">
    <div class="r8-window__titlebar">
      <span class="r8-window__title">Registro nacional</span>
      <div v-if="detail" class="pokemon-detail__window-actions">
        <button
          class="r8-btn r8-btn--sm pokemon-icon-btn"
          :class="favorite ? 'r8-btn--primary' : 'r8-btn--secondary'"
          type="button"
          :aria-label="favorite ? 'Remover favorito' : 'Favoritar'"
          title="Favorito"
          @click="$emit('toggleFavorite', detail.speciesName)"
        >
          <Heart class="pokemon-icon" aria-hidden="true" :fill="favorite ? 'currentColor' : 'none'" />
        </button>
        <button
          class="r8-btn r8-btn--sm pokemon-icon-btn"
          :class="caught ? 'r8-btn--primary' : 'r8-btn--secondary'"
          type="button"
          :aria-label="caught ? 'Remover capturado' : 'Marcar capturado'"
          title="Capturado"
          @click="$emit('toggleCaught', detail.speciesName)"
        >
          <Check class="pokemon-icon" aria-hidden="true" />
        </button>
      </div>
    </div>

    <div v-if="loading" class="r8-window__body pokemon-detail__loading">
      <div class="detail-skeleton detail-skeleton--image" />
      <div class="detail-skeleton" />
      <div class="detail-skeleton detail-skeleton--wide" />
      <div class="detail-skeleton detail-skeleton--wide" />
    </div>

    <div v-else-if="detail" class="r8-window__body pokemon-detail__body">
      <div class="pokemon-detail__hero">
        <div class="pokemon-detail__art-wrap">
          <img
            class="pokemon-detail__art"
            :src="shiny ? detail.shinyImage : detail.image"
            :alt="detail.displayName"
          >
        </div>
        <div class="pokemon-detail__identity">
          <span class="pokemon-detail__number">#{{ detail.id.toString().padStart(4, '0') }}</span>
          <h2 class="pokemon-detail__name">{{ detail.displayName }}</h2>
          <p v-if="detail.species.genus" class="pokemon-detail__genus">{{ detail.species.genus }}</p>
          <div class="pokemon-detail__types">
            <PokemonTypeTag v-for="type in detail.types" :key="type" :type="type" />
          </div>
          <div class="pokemon-detail__flags">
            <span v-if="detail.species.legendary" class="r8-badge r8-badge--warning">lendário</span>
            <span v-if="detail.species.mythical" class="r8-badge r8-badge--info">mítico</span>
            <span class="r8-badge r8-badge--success">{{ detail.species.generation }}</span>
          </div>
        </div>
      </div>

      <div class="pokemon-detail__toolbar">
        <button
          class="r8-btn r8-btn--sm"
          :class="shiny ? 'r8-btn--primary' : 'r8-btn--secondary'"
          type="button"
          :aria-pressed="shiny"
          @click="$emit('toggleShiny')"
        >
          <Sparkles class="pokemon-icon" aria-hidden="true" />
          Shiny
        </button>
        <button
          v-if="detail.cries.latest"
          class="r8-btn r8-btn--sm r8-btn--secondary"
          type="button"
          @click="playCry(detail.cries.latest)"
        >
          <Volume2 class="pokemon-icon" aria-hidden="true" />
          Cry
        </button>
      </div>

      <p v-if="detail.species.flavorText" class="pokemon-detail__flavor">
        {{ detail.species.flavorText }}
      </p>

      <div class="detail-metric-grid">
        <div class="detail-metric">
          <span>Altura</span>
          <strong>{{ (detail.height / 10).toFixed(1) }} m</strong>
        </div>
        <div class="detail-metric">
          <span>Peso</span>
          <strong>{{ (detail.weight / 10).toFixed(1) }} kg</strong>
        </div>
        <div class="detail-metric">
          <span>Captura</span>
          <strong>{{ detail.species.captureRate }}</strong>
        </div>
        <div class="detail-metric">
          <span>Base XP</span>
          <strong>{{ detail.baseExperience ?? 'N/A' }}</strong>
        </div>
      </div>

      <section class="detail-section">
        <h3 class="detail-section__title">Base stats</h3>
        <div class="stat-list">
          <div v-for="stat in detail.stats" :key="stat.name" class="stat-row">
            <span class="stat-row__label">{{ stat.displayName }}</span>
            <div class="stat-row__bar" aria-hidden="true">
              <span :style="{ width: `${Math.min(stat.value, 180) / 180 * 100}%` }" />
            </div>
            <strong>{{ stat.value }}</strong>
          </div>
        </div>
      </section>

      <section class="detail-section">
        <h3 class="detail-section__title">Perfil</h3>
        <dl class="detail-list">
          <div>
            <dt>Habitat</dt>
            <dd>{{ detail.species.habitat ? formatName(detail.species.habitat) : 'desconhecido' }}</dd>
          </div>
          <div>
            <dt>Crescimento</dt>
            <dd>{{ detail.species.growthRate }}</dd>
          </div>
          <div>
            <dt>Ovos</dt>
            <dd>{{ detail.species.eggGroups.join(', ') }}</dd>
          </div>
          <div>
            <dt>Variedades</dt>
            <dd>{{ detail.varieties.length }}</dd>
          </div>
        </dl>
      </section>

      <section class="detail-section">
        <h3 class="detail-section__title">Habilidades</h3>
        <div class="chip-row">
          <span
            v-for="ability in detail.abilities"
            :key="ability.name"
            class="r8-badge"
            :class="ability.hidden ? 'r8-badge--warning' : 'r8-badge--info'"
          >
            {{ ability.displayName }}{{ ability.hidden ? ' (oculta)' : '' }}
          </span>
        </div>
      </section>

      <section class="detail-section">
        <h3 class="detail-section__title">Dano recebido</h3>
        <div class="damage-grid">
          <div>
            <span class="detail-section__eyebrow">Fraco</span>
            <div class="chip-row">
              <span
                v-for="item in detail.damage.weaknesses"
                :key="item.name"
                class="r8-badge r8-badge--danger damage-chip"
              >
                {{ item.displayName }} x{{ item.multiplier }}
              </span>
              <span v-if="!detail.damage.weaknesses.length" class="muted-text">nenhum</span>
            </div>
          </div>
          <div>
            <span class="detail-section__eyebrow">Resiste</span>
            <div class="chip-row">
              <span
                v-for="item in detail.damage.resistances"
                :key="item.name"
                class="r8-badge r8-badge--success damage-chip"
              >
                {{ item.displayName }} x{{ item.multiplier }}
              </span>
              <span v-if="!detail.damage.resistances.length" class="muted-text">nenhum</span>
            </div>
          </div>
          <div>
            <span class="detail-section__eyebrow">Imune</span>
            <div class="chip-row">
              <span
                v-for="item in detail.damage.immunities"
                :key="item.name"
                class="r8-badge r8-badge--info damage-chip"
              >
                {{ item.displayName }}
              </span>
              <span v-if="!detail.damage.immunities.length" class="muted-text">nenhum</span>
            </div>
          </div>
        </div>
      </section>

      <section class="detail-section">
        <h3 class="detail-section__title">Evolução</h3>
        <ol class="evolution-list">
          <li
            v-for="node in detail.evolution"
            :key="`${node.name}-${node.depth}`"
            class="evolution-node"
            :style="{ '--evolution-depth': node.depth }"
          >
            <img :src="node.image" :alt="node.displayName" loading="lazy">
            <div>
              <strong>{{ node.displayName }}</strong>
              <span>{{ node.trigger }}</span>
            </div>
          </li>
        </ol>
      </section>

      <section class="detail-section">
        <h3 class="detail-section__title">Golpes</h3>
        <div class="move-grid">
          <span v-for="move in detail.moves" :key="move.name" class="move-pill">
            {{ move.displayName }}
            <small v-if="move.level !== null">Lv. {{ move.level }}</small>
          </span>
        </div>
      </section>
    </div>

    <div v-else class="r8-window__body pokemon-detail__empty">
      <Search class="pokemon-detail__empty-icon" aria-hidden="true" />
      <p>Selecione um Pokémon para abrir o registro completo.</p>
    </div>

    <div class="r8-window__statusbar">
      {{ detail ? `${detail.varieties.length} variedades · ${detail.moveCount} golpes catalogados` : 'Aguardando seleção' }}
    </div>
  </section>
</template>

<script setup lang="ts">
import { Check, Heart, Search, Sparkles, Volume2 } from '@lucide/vue'
import type { PokemonDetail } from '../types/pokedex'

defineProps<{
  detail: PokemonDetail | null
  loading: boolean
  shiny: boolean
  favorite: boolean
  caught: boolean
}>()

defineEmits<{
  toggleFavorite: [name: string]
  toggleCaught: [name: string]
  toggleShiny: []
}>()

function playCry(src: string) {
  const audio = new Audio(src)
  void audio.play()
}
</script>

<template>
  <section class="r8-panel r8-panel--muted music-player" :aria-label="t('player.label')">
    <div class="r8-panel__body music-player__body">
      <div class="music-player__identity" aria-hidden="true">
        <Music2 class="music-player__identity-icon" :size="20" :stroke-width="2.5" />
        <span class="music-player__identity-copy">
          <strong>Retro Radio</strong>
          <small>{{ t('player.trackCount', { current: currentIndex + 1, total: tracks.length }) }}</small>
        </span>
      </div>

      <div class="music-player__display" role="status" aria-live="polite" aria-atomic="true">
        <span class="music-player__state">
          <span class="music-player__led" :class="`is-${playbackState}`" aria-hidden="true" />
          {{ playbackLabel }}
        </span>
        <span class="music-player__screen">
          <span :key="currentTrackTitle" class="music-player__ticker">
            <span class="music-player__track">{{ currentTrackTitle }}</span>
            <span class="music-player__track" aria-hidden="true">{{ currentTrackTitle }}</span>
          </span>
        </span>
      </div>

      <div class="music-player__volume">
        <Volume2 class="music-player__volume-icon" :size="18" aria-hidden="true" />
        <div
          ref="volumeSlider"
          class="r8-slider music-player__volume-slider"
          :data-r8-value="volume"
          :style="{ '--r8-progress-value': `${volume}%` }"
        >
          <div
            class="r8-slider__track"
            role="slider"
            tabindex="0"
            :aria-label="t('player.volumeAria')"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-valuenow="volume"
            :aria-valuetext="`${volume}%`"
          >
            <div class="r8-slider__fill" />
            <div class="r8-slider__thumb" aria-hidden="true" />
          </div>
          <span class="r8-text r8-text--muted music-player__volume-output" data-r8-slider-output>
            {{ t('player.volume') }}: {{ volume }}%
          </span>
        </div>
      </div>

      <div class="music-player__controls" role="group" :aria-label="t('player.controls')">
        <button
          class="r8-btn r8-btn--sm r8-btn--secondary music-player__button"
          type="button"
          :aria-label="t('player.previousAria')"
          :title="t('player.previousAria')"
          @click="previousTrack"
        >
          <SkipBack class="r8-btn__icon" :size="18" aria-hidden="true" />
          <span class="music-player__button-label">{{ t('player.previous') }}</span>
        </button>
        <button
          class="r8-btn r8-btn--sm music-player__button"
          :class="isPlaying ? 'r8-btn--success' : 'r8-btn--primary'"
          type="button"
          :disabled="isPlaying"
          :aria-label="t('player.playAria')"
          :title="t('player.playAria')"
          @click="play"
        >
          <Play class="r8-btn__icon" :size="18" aria-hidden="true" />
          <span class="music-player__button-label">{{ t('player.play') }}</span>
        </button>
        <button
          class="r8-btn r8-btn--sm r8-btn--secondary music-player__button"
          type="button"
          :disabled="!isPlaying"
          :aria-label="t('player.pauseAria')"
          :title="t('player.pauseAria')"
          @click="pause"
        >
          <Pause class="r8-btn__icon" :size="18" aria-hidden="true" />
          <span class="music-player__button-label">{{ t('player.pause') }}</span>
        </button>
        <button
          class="r8-btn r8-btn--sm r8-btn--secondary music-player__button"
          type="button"
          :disabled="playbackState === 'stopped'"
          :aria-label="t('player.stopAria')"
          :title="t('player.stopAria')"
          @click="stop"
        >
          <Square class="r8-btn__icon" :size="16" aria-hidden="true" />
          <span class="music-player__button-label">{{ t('player.stop') }}</span>
        </button>
        <button
          class="r8-btn r8-btn--sm r8-btn--secondary music-player__button"
          type="button"
          :aria-label="t('player.nextAria')"
          :title="t('player.nextAria')"
          @click="nextTrack"
        >
          <SkipForward class="r8-btn__icon" :size="18" aria-hidden="true" />
          <span class="music-player__button-label">{{ t('player.next') }}</span>
        </button>
      </div>

      <audio
        ref="audioElement"
        :src="currentTrack.src"
        preload="metadata"
        hidden
        @ended="handleEnded"
        @error="handleAudioError"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { Music2, Pause, Play, SkipBack, SkipForward, Square, Volume2 } from '@lucide/vue'
import type { MessageKey } from '../i18n/messages'
import track01 from '~/assets/ogg/01_monster_town_morning_original_8bit.ogg'
import track02 from '~/assets/ogg/02_wild_grass_encounter_original_8bit.ogg'
import track03 from '~/assets/ogg/03_gym_leader_challenge_original_8bit.ogg'
import track04 from '~/assets/ogg/04_mystery_cave_original_8bit.ogg'
import track05 from '~/assets/ogg/05_healing_center_lullaby_original_8bit.ogg'
import track06 from '~/assets/ogg/06_rival_duel_original_8bit.ogg'
import track07 from '~/assets/ogg/07_victory_fanfare_original_8bit.ogg'
import track08 from '~/assets/ogg/08_ocean_route_adventure_original_8bit.ogg'
import track09 from '~/assets/ogg/09_lavender_town_inspired_original_8bit.ogg'
import track10 from '~/assets/ogg/10_pokemon_battle_inspired_original_8bit.ogg'
import track11 from '~/assets/ogg/11_pokemon_route_inspired_original_8bit.ogg'

type PlaybackState = 'stopped' | 'playing' | 'paused' | 'error'

const DEFAULT_VOLUME = 30

interface Track {
  titleKey: MessageKey
  src: string
}

const tracks: Track[] = [
  { titleKey: 'player.track.01', src: track01 },
  { titleKey: 'player.track.02', src: track02 },
  { titleKey: 'player.track.03', src: track03 },
  { titleKey: 'player.track.04', src: track04 },
  { titleKey: 'player.track.05', src: track05 },
  { titleKey: 'player.track.06', src: track06 },
  { titleKey: 'player.track.07', src: track07 },
  { titleKey: 'player.track.08', src: track08 },
  { titleKey: 'player.track.09', src: track09 },
  { titleKey: 'player.track.10', src: track10 },
  { titleKey: 'player.track.11', src: track11 }
]

const { t } = useAppI18n()
const audioElement = ref<HTMLAudioElement | null>(null)
const volumeSlider = ref<HTMLElement | null>(null)
const currentIndex = ref(0)
const playbackState = ref<PlaybackState>('stopped')
const volume = ref(DEFAULT_VOLUME)

const currentTrack = computed(() => tracks[currentIndex.value]!)
const currentTrackTitle = computed(() => t(currentTrack.value.titleKey))
const isPlaying = computed(() => playbackState.value === 'playing')
const playbackLabel = computed(() => {
  const labels: Record<PlaybackState, MessageKey> = {
    stopped: 'player.state.stopped',
    playing: 'player.state.playing',
    paused: 'player.state.paused',
    error: 'player.state.error'
  }

  return t(labels[playbackState.value])
})

async function play() {
  if (!audioElement.value) return

  try {
    await audioElement.value.play()
    playbackState.value = 'playing'
  } catch {
    playbackState.value = 'error'
  }
}

function pause() {
  if (!audioElement.value || !isPlaying.value) return

  audioElement.value.pause()
  playbackState.value = 'paused'
}

function stop() {
  if (!audioElement.value) return

  audioElement.value.pause()
  audioElement.value.currentTime = 0
  playbackState.value = 'stopped'
}

async function changeTrack(offset: number, forcePlayback = false) {
  const shouldPlay = forcePlayback || isPlaying.value

  currentIndex.value = (currentIndex.value + offset + tracks.length) % tracks.length
  playbackState.value = 'stopped'

  await nextTick()
  audioElement.value?.load()

  if (shouldPlay) await play()
}

function previousTrack() {
  void changeTrack(-1)
}

function nextTrack() {
  void changeTrack(1)
}

function handleEnded() {
  void changeTrack(1, true)
}

function handleAudioError() {
  playbackState.value = 'error'
}

function setVolume(value: number) {
  const normalized = Math.min(100, Math.max(0, Math.round(value)))
  volume.value = normalized

  if (audioElement.value) audioElement.value.volume = normalized / 100
}

function handleVolumeChange(event: Event) {
  const value = Number((event as CustomEvent<{ value?: number }>).detail?.value)
  if (Number.isFinite(value)) setVolume(value)
}

let refreshFrame: number | undefined

onMounted(() => {
  setVolume(DEFAULT_VOLUME)
  volumeSlider.value?.addEventListener('r8:slider-change', handleVolumeChange)

  refreshFrame = requestAnimationFrame(() => {
    if (volumeSlider.value) window.Retro8UI?.refresh?.(volumeSlider.value.parentElement ?? document)
  })
})

onBeforeUnmount(() => {
  if (refreshFrame !== undefined) cancelAnimationFrame(refreshFrame)
  volumeSlider.value?.removeEventListener('r8:slider-change', handleVolumeChange)
  audioElement.value?.pause()
})
</script>

<style scoped>
.music-player {
  --player-display-bg: #07150c;
  --player-display-glow: rgba(105, 255, 120, 0.62);
  --player-display-ink: #8dff96;
  --player-display-inset: rgba(0, 0, 0, 0.38);
  --player-display-scanline: rgba(122, 255, 133, 0.035);
  --player-led-active: #8dff96;
  --player-led-glow: rgba(105, 255, 120, 0.86);
  --player-led-idle: #5a665b;
  --player-led-paused: #ffcb47;
  background: var(--dex-surface-2);
  border-left: 0;
  border-right: 0;
  box-shadow: 0 4px 0 color-mix(in srgb, var(--dex-bg) 72%, transparent);
}

:global([data-theme='light']) .music-player {
  --player-display-bg: #dce8c8;
  --player-display-glow: rgba(23, 67, 31, 0.18);
  --player-display-ink: #17431f;
  --player-display-inset: rgba(28, 23, 33, 0.2);
  --player-display-scanline: rgba(23, 67, 31, 0.07);
  --player-led-active: #247a35;
  --player-led-glow: rgba(36, 122, 53, 0.38);
  --player-led-idle: #73806b;
  --player-led-paused: #9a6b00;
}

.music-player__body {
  align-items: center;
  display: grid;
  gap: 0.75rem;
  grid-template-columns: auto minmax(240px, 1fr) minmax(9rem, 0.2fr) auto;
  margin: 0 auto;
  max-width: 1500px;
  padding: 0.65rem 1rem;
}

.music-player__identity {
  align-items: center;
  color: var(--dex-accent);
  display: flex;
  gap: 0.55rem;
  min-width: 8.5rem;
  text-transform: uppercase;
}

.music-player__identity-icon {
  flex: 0 0 auto;
}

.music-player__identity-copy {
  display: grid;
  line-height: 1;
}

.music-player__identity-copy strong {
  font-size: 0.78rem;
  letter-spacing: 0.08em;
}

.music-player__identity-copy small {
  color: var(--dex-muted);
  font-size: 0.65rem;
  margin-top: 0.3rem;
}

.music-player__display {
  align-items: center;
  background:
    repeating-linear-gradient(0deg, var(--player-display-scanline) 0 1px, transparent 1px 3px),
    var(--player-display-bg);
  border: 2px solid var(--dex-line);
  box-shadow: inset 3px 3px 0 var(--player-display-inset);
  color: var(--player-display-ink);
  display: grid;
  font-variant-numeric: tabular-nums;
  gap: 0.7rem;
  grid-template-columns: auto minmax(0, 1fr);
  min-height: 2.5rem;
  min-width: 0;
  padding: 0.4rem 0.65rem;
  text-shadow: 0 0 7px var(--player-display-glow);
  text-transform: uppercase;
}

.music-player__state {
  align-items: center;
  display: inline-flex;
  font-size: 0.65rem;
  gap: 0.4rem;
  letter-spacing: 0.08em;
  white-space: nowrap;
}

.music-player__led {
  background: var(--player-led-idle);
  box-shadow: 1px 1px 0 #000;
  display: inline-block;
  height: 0.5rem;
  width: 0.5rem;
}

.music-player__led.is-playing {
  animation: player-led-blink 1s steps(2, end) infinite;
  background: var(--player-led-active);
  box-shadow: 0 0 7px var(--player-led-glow);
}

.music-player__led.is-paused {
  background: var(--player-led-paused);
}

.music-player__led.is-error {
  background: var(--dex-red);
}

.music-player__screen {
  min-width: 0;
  overflow: hidden;
}

.music-player__ticker {
  animation: player-marquee 15s linear infinite;
  display: flex;
  width: max-content;
}

.music-player__track {
  flex: 0 0 auto;
  font-size: 0.82rem;
  letter-spacing: 0.06em;
  padding-right: 5rem;
  white-space: nowrap;
}

.music-player__controls {
  display: flex;
  gap: 0.4rem;
}

.music-player__volume {
  align-items: center;
  display: flex;
  gap: 0.5rem;
  min-width: 9rem;
}

.music-player__volume-icon {
  color: var(--dex-accent);
  flex: 0 0 auto;
}

.music-player__volume-slider {
  flex: 1;
  gap: 0.2rem;
  min-width: 0;
}

.music-player__volume .r8-slider__track {
  background: var(--dex-surface);
  border-color: var(--dex-line);
}

.music-player__volume .r8-slider__fill {
  background: var(--dex-accent);
}

.music-player__volume .r8-slider__thumb {
  background: var(--dex-surface-2);
  border-color: var(--dex-line);
}

.music-player__volume .r8-slider__track:focus-visible {
  outline: var(--r8-focus-width) solid var(--r8-color-focus);
  outline-offset: var(--r8-focus-offset);
}

.music-player__volume-output {
  color: var(--dex-muted);
  font-size: 0.62rem;
  line-height: 1;
  white-space: nowrap;
}

.music-player__button {
  min-width: 2.375rem;
  padding-inline: 0.65rem;
}

@keyframes player-marquee {
  to {
    transform: translateX(-50%);
  }
}

@keyframes player-led-blink {
  50% {
    opacity: 0.45;
  }
}

@media (max-width: 1280px) {
  .music-player__identity {
    min-width: auto;
  }

  .music-player__identity-copy {
    display: none;
  }

  .music-player__button-label {
    display: none;
  }
}

@media (max-width: 680px) {
  .music-player__body {
    gap: 0.6rem;
    grid-template-columns: minmax(0, 1fr);
    padding: 0.6rem 0.75rem 0.7rem;
  }

  .music-player__identity {
    display: none;
  }

  .music-player__controls {
    justify-content: center;
  }

  .music-player__volume {
    justify-self: center;
    width: min(100%, 14rem);
  }
}

@media (prefers-reduced-motion: reduce) {
  .music-player__led.is-playing,
  .music-player__ticker {
    animation: none;
  }

  .music-player__track[aria-hidden='true'] {
    display: none;
  }

  .music-player__track {
    max-width: 100%;
    overflow: hidden;
    padding-right: 0;
    text-overflow: ellipsis;
  }
}
</style>

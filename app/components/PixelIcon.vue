<template>
  <span class="pixel-icon" :style="iconStyle" aria-hidden="true" />
</template>

<script setup lang="ts">
import type { CSSProperties } from 'vue'
import arrowLeftUrl from 'pixelarticons/svg/arrow-left.svg'
import arrowLeftBoxUrl from 'pixelarticons/svg/arrow-left-box.svg'
import arrowRightBoxUrl from 'pixelarticons/svg/arrow-right-box.svg'
import briefcaseUrl from 'pixelarticons/svg/briefcase.svg'
import checkUrl from 'pixelarticons/svg/check.svg'
import chevronLeftUrl from 'pixelarticons/svg/chevron-left.svg'
import chevronRightUrl from 'pixelarticons/svg/chevron-right.svg'
import closeUrl from 'pixelarticons/svg/close.svg'
import cloudSunUrl from 'pixelarticons/svg/cloud-sun.svg'
import gitBranchUrl from 'pixelarticons/svg/git-branch.svg'
import heartUrl from 'pixelarticons/svg/heart.svg'
import mapPinUrl from 'pixelarticons/svg/map-pin.svg'
import mapPinHomeUrl from 'pixelarticons/svg/map-pin-home.svg'
import moonUrl from 'pixelarticons/svg/moon.svg'
import musicUrl from 'pixelarticons/svg/music.svg'
import playUrl from 'pixelarticons/svg/play.svg'
import reloadUrl from 'pixelarticons/svg/reload.svg'
import searchUrl from 'pixelarticons/svg/search.svg'
import sparklesUrl from 'pixelarticons/svg/sparkles.svg'
import squareUrl from 'pixelarticons/svg/square.svg'
import userUrl from 'pixelarticons/svg/user.svg'
import volumeUrl from 'pixelarticons/svg/volume-2.svg'
import pauseUrl from '~/assets/icons/pixelarticons-pause.svg'

const iconUrls = {
  'arrow-left': arrowLeftUrl,
  'briefcase': briefcaseUrl,
  'check': checkUrl,
  'chevron-left': chevronLeftUrl,
  'chevron-right': chevronRightUrl,
  'close': closeUrl,
  'git-branch': gitBranchUrl,
  'heart': heartUrl,
  'map-pin': mapPinUrl,
  'map-pin-home': mapPinHomeUrl,
  'moon': moonUrl,
  'music': musicUrl,
  'next': arrowRightBoxUrl,
  'pause': pauseUrl,
  'play': playUrl,
  'previous': arrowLeftBoxUrl,
  'reload': reloadUrl,
  'search': searchUrl,
  'sparkles': sparklesUrl,
  'stop': squareUrl,
  'sun': cloudSunUrl,
  'user': userUrl,
  'volume': volumeUrl
} as const

type PixelIconName = keyof typeof iconUrls

const props = withDefaults(defineProps<{
  name: PixelIconName
  size?: 12 | 24 | 48
}>(), {
  size: 24
})

const iconStyle = computed(() => ({
  '--pixel-icon-size': `${props.size}px`,
  '--pixel-icon-url': `url("${iconUrls[props.name]}")`
}) as CSSProperties)
</script>

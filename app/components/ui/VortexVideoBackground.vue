<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useHlsVideo } from '~/composables/useHlsVideo'
import { useReducedMotion } from '~/composables/useReducedMotion'
import { useScrollVideo } from '~/composables/useScrollVideo'
import { getMotionProfile } from '~/utils/motionProfile'

const props = defineProps<{
  localSrc: string
  hlsSrc?: string
  poster?: string
  mirrored?: boolean
  progress?: number
}>()
const emit = defineEmits<{ meta: [duration: number] }>()

/** ≥1 garante cobertura total (object-cover + translate); 0.76 gerava “letterbox” nas laterais. */
const videoZoom = 1.14

const videoRef = ref<HTMLVideoElement | null>(null)
const { attach } = useHlsVideo(videoRef)
const { prefersReducedMotion } = useReducedMotion()
const externalProgress = computed(() => props.progress)

const videoPreload = computed(() =>
  import.meta.client ? getMotionProfile().heroVideoPreload : 'metadata'
)

useScrollVideo(videoRef, { externalProgress })

onMounted(() => {
  if (!videoRef.value) return
  videoRef.value.addEventListener(
    'loadedmetadata',
    () => {
      const duration = Number(videoRef.value?.duration || 0)
      if (duration > 0) emit('meta', duration)
    },
    { once: true }
  )

  if (prefersReducedMotion.value) return
  if (props.hlsSrc) attach(props.hlsSrc)
})
</script>

<template>
  <div class="absolute inset-0 overflow-hidden bg-bg">
    <video
      ref="videoRef"
      :src="localSrc"
      :poster="poster"
      muted
      autoplay
      playsinline
      disablepictureinpicture
      :preload="videoPreload"
      class="pointer-events-none absolute left-1/2 top-1/2 h-full w-full min-h-full min-w-full max-w-none object-cover object-[44%_46%] max-md:object-[42%_48%]"
      :style="{
        transform: mirrored
          ? `translate(-50%, -50%) scale(${videoZoom}) scaleY(-1)`
          : `translate(-50%, -50%) scale(${videoZoom})`
      }"
    />
    <div class="absolute inset-0 bg-white/35" />
    <div class="absolute bottom-0 h-48 w-full bg-gradient-to-t from-bg to-transparent" />
  </div>
</template>

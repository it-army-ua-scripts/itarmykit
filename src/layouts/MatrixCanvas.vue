<template>
    <canvas v-if="appearanceStore.modeId === 'matrix'" ref="canvas" width="1000" height="2000" style="position: fixed; inset: 0; width: 100vw; height: 100vh; overflow: hidden; pointer-events: none; z-index: 0;" />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useAppearanceStore } from 'src/appearance/store'

const appearanceStore = useAppearanceStore()

const canvas = ref<HTMLCanvasElement>()

const zeroone = '01'

// const alphabet = katakana + latin + nums;
const alphabet = zeroone

const fontSize = 16
let columns = window.innerWidth / fontSize

const rainDrops = [] as Array<number>

watch([appearanceStore.$state], () => {
  setTimeout(() => {
    resize()
  }, 100)
}, { deep: true })

function draw () {
  if (appearanceStore.modeId !== 'matrix') return

  const context = canvas?.value?.getContext('2d')

  if (!context) return
  if (!canvas.value) return

  if (appearanceStore.isDarkTheme) {
    context.fillStyle = 'rgba(27, 27, 27, 0.1)'
  } else {
    context.fillStyle = 'rgba(255, 255, 255, 0.05)'
  }
  context.fillRect(0, 0, canvas.value.width, canvas.value.height)

  context.fillStyle = appearanceStore.isDarkTheme ? 'rgba(34, 197, 94, 0.42)' : 'rgba(16, 148, 48, 0.6)'
  context.font = fontSize + 'px monospace'

  for (let i = 0; i < rainDrops.length; i++) {
    const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length))
    context.fillText(text, i * fontSize, rainDrops[i] * fontSize)

    if (rainDrops[i] * fontSize > canvas.value.height && Math.random() > 0.9) {
      rainDrops[i] = 0
    }
    rainDrops[i]++
  }
}

let interval: ReturnType<typeof setInterval> | null = null

function resize () {
  if (!canvas.value) return
  canvas.value.width = window.innerWidth - 20
  canvas.value.height = window.innerHeight
  columns = window.innerWidth / fontSize
  for (let x = 0; x < columns; x++) {
    rainDrops[x] = Math.round(Math.random() * canvas.value.height / fontSize)
  }
}

onMounted(async () => {
  await appearanceStore.load()

  resize()
  window.addEventListener('resize', resize)
  interval = setInterval(draw, 33)
})

onUnmounted(() => {
  window.removeEventListener('resize', resize)
  if (interval) clearInterval(interval)
})

</script>

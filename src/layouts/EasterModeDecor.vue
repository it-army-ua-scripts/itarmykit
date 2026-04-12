<template>
  <div v-if="appearanceStore.modeId === 'easter'" class="easter-decor" aria-hidden="true">
    <div class="easter-glow easter-glow--left"></div>
    <div class="easter-glow easter-glow--right"></div>
    <div class="easter-ribbon">
      <span class="easter-ribbon__egg"></span>
      <span class="easter-ribbon__text">Pysanka Mode</span>
      <span class="easter-ribbon__egg easter-ribbon__egg--alt"></span>
    </div>

    <div
      v-for="egg in eggs"
      :key="egg.id"
      class="easter-egg"
      :class="`easter-egg--${egg.variant}`"
      :style="{
        left: egg.left,
        top: egg.top,
        animationDelay: egg.delay,
        '--egg-rotate': egg.rotate
      }"
    >
      <span class="easter-egg__stripe"></span>
      <span class="easter-egg__stripe easter-egg__stripe--middle"></span>
      <span class="easter-egg__dot"></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppearanceStore } from 'src/appearance/store'

const appearanceStore = useAppearanceStore()

const eggs = [
  { id: 1, left: '6%', top: '18%', delay: '0s', rotate: '-10deg', variant: 'gold' },
  { id: 2, left: '16%', top: '72%', delay: '1.1s', rotate: '8deg', variant: 'blue' },
  { id: 3, left: '78%', top: '16%', delay: '0.6s', rotate: '12deg', variant: 'pink' },
  { id: 4, left: '84%', top: '68%', delay: '1.8s', rotate: '-12deg', variant: 'green' },
  { id: 5, left: '48%', top: '10%', delay: '1.3s', rotate: '4deg', variant: 'gold' },
  { id: 6, left: '54%', top: '78%', delay: '0.4s', rotate: '-6deg', variant: 'blue' }
]
</script>

<style scoped>
.easter-decor {
  position: fixed;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.easter-glow {
  position: absolute;
  width: 38vw;
  height: 38vw;
  border-radius: 999px;
  filter: blur(14px);
  opacity: 0.55;
}

.easter-glow--left {
  left: -10vw;
  top: -8vw;
  background: radial-gradient(circle, rgba(244, 211, 94, 0.48) 0%, rgba(244, 211, 94, 0) 70%);
}

.easter-glow--right {
  right: -12vw;
  bottom: -10vw;
  background: radial-gradient(circle, rgba(236, 72, 153, 0.32) 0%, rgba(236, 72, 153, 0) 72%);
}

.easter-ribbon {
  position: absolute;
  top: 26px;
  left: 50%;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transform: translateX(-50%);
  padding: 10px 18px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.82);
  color: #7c2d12;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  box-shadow: 0 12px 30px rgba(124, 45, 18, 0.14);
}

.easter-ribbon__text {
  white-space: nowrap;
}

.easter-ribbon__egg {
  width: 14px;
  height: 18px;
  border-radius: 50% 50% 46% 46% / 58% 58% 42% 42%;
  background: linear-gradient(180deg, #fde68a 0%, #f59e0b 100%);
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.55);
}

.easter-ribbon__egg--alt {
  background: linear-gradient(180deg, #93c5fd 0%, #2563eb 100%);
}

.easter-egg {
  position: absolute;
  width: 82px;
  height: 112px;
  border-radius: 50% 50% 46% 46% / 58% 58% 42% 42%;
  border: 2px solid rgba(255, 255, 255, 0.55);
  box-shadow: 0 16px 28px rgba(15, 23, 42, 0.12);
  animation: float-egg 7s ease-in-out infinite;
  opacity: 0.95;
}

.easter-egg--gold {
  background: linear-gradient(180deg, #fde68a 0%, #f59e0b 100%);
}

.easter-egg--blue {
  background: linear-gradient(180deg, #93c5fd 0%, #2563eb 100%);
}

.easter-egg--pink {
  background: linear-gradient(180deg, #f9a8d4 0%, #db2777 100%);
}

.easter-egg--green {
  background: linear-gradient(180deg, #86efac 0%, #16a34a 100%);
}

.easter-egg__stripe,
.easter-egg__dot {
  position: absolute;
  left: 14%;
  right: 14%;
  background: rgba(255, 255, 255, 0.82);
}

.easter-egg__stripe {
  top: 28%;
  height: 8px;
  border-radius: 999px;
}

.easter-egg__stripe--middle {
  top: 52%;
  left: 18%;
  right: 18%;
  height: 6px;
}

.easter-egg__dot {
  width: 14px;
  height: 14px;
  left: calc(50% - 7px);
  top: 68%;
  border-radius: 999px;
}

@keyframes float-egg {
  0%, 100% {
    transform: translateY(0) rotate(var(--egg-rotate, 0deg));
  }

  50% {
    transform: translateY(-12px) rotate(calc(var(--egg-rotate, 0deg) + 2deg));
  }
}
</style>

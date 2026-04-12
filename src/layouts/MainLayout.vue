<template>
  <MatrixCanvas />
  <EasterModeDecor />
  <q-layout view="lHh Lpr lFf" class="app-shell-layout">
    <q-header bordered class="app-shell-header">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          color="primary"
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title
          class="text-right q-pr-md text-subtitle2 ellipsis"
          style="min-width: 0"
        >
          <ShortStatisticsComponent />
        </q-toolbar-title>

        <div>
          v{{ version }}
          <!--
          <q-btn flat class="q-pa-sm q-ma-xs" @click="showMurkaDialog = true">
            <q-avatar
              style="outline: 2px solid #555"
              class="cursor-pointer"
              square
            >
              <img src="./snowEffect/murka_the_cat.jpg" />
            </q-avatar>
            <q-tooltip> Slamy's (developer) cat </q-tooltip>
          </q-btn>
          -->

          <q-dialog v-model="showMurkaDialog">
            <MurkaDialog />
          </q-dialog>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" :width="260" show-if-above bordered class="app-shell-drawer">
      <q-list>
        <q-item-label header class="text-center text-bold text-uppercase text-h4 q-mt-md q-mb-md app-nav-title">
          IT Army Kit
          <!--🎅-->
        </q-item-label>
        <div class="row justify-center q-mb-md app-logo-wrap">
          <div
            v-if="appearanceStore.modeId === 'easter'"
            class="logo-easter-eggs"
            aria-hidden="true"
          >
            <span class="logo-easter-egg logo-easter-egg--1"></span>
            <span class="logo-easter-egg logo-easter-egg--2"></span>
            <span class="logo-easter-egg logo-easter-egg--3"></span>
            <span class="logo-easter-egg logo-easter-egg--4"></span>
            <span class="logo-easter-egg logo-easter-egg--5"></span>
            <span class="logo-easter-egg logo-easter-egg--6"></span>
            <span class="logo-easter-egg logo-easter-egg--7"></span>
            <span class="logo-easter-egg logo-easter-egg--8"></span>
            <span class="logo-easter-egg logo-easter-egg--9"></span>
            <span class="logo-easter-egg logo-easter-egg--10"></span>
            <span class="logo-easter-egg logo-easter-egg--11"></span>
            <span class="logo-easter-egg logo-easter-egg--12"></span>
            <span class="logo-easter-egg logo-easter-egg--13"></span>
            <span class="logo-easter-egg logo-easter-egg--14"></span>
            <span class="logo-easter-egg logo-easter-egg--15"></span>
            <span class="logo-easter-egg logo-easter-egg--16"></span>
          </div>
          <img src="~assets/icon.png" class="app-logo q-mt-sm" alt="IT Army Kit" />
        </div>

        <div class="row" style="border-top: solid 1px #aaa">
          <div
            v-for="page of pages"
            :key="page.name"
            class="row fit"
            @click="goToPage(page.page)"
          >
            <div
              class="col bg-yellow-7"
              style="
                max-width: 6px;
                border-bottom: solid 1px #aaa;
                border-right: solid 1px #aaa;
              "
              v-if="($route.name as string).startsWith(page.name)"
            ></div>
            <div
              :class="[
                'col text-subtitle1 text-bold q-pl-md selectable_menu app-nav-item',
                ($route.name as string).startsWith(page.name) ? 'app-nav-item--active' : ''
              ]"
              style="border-bottom: solid 1px #aaa"
            >
              <q-icon size="xs" :name="page.icon" class="q-mr-xs"></q-icon>
              {{ $t(page.title) }}
            </div>
          </div>
        </div>
        <div class="q-pa-sm">
          <SystemControlStatusComponent />
        </div>
      </q-list>
    </q-drawer>

    <q-page-container>
      <!-- <SnowEffectComponent /> -->
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { version } from '../../package.json'

const router = useRouter()

import MatrixCanvas from './MatrixCanvas.vue'
import EasterModeDecor from './EasterModeDecor.vue'
import MurkaDialog from './snowEffect/MurkaDialog.vue'

import ShortStatisticsComponent from './ShortStatisticsComponent.vue'
import SystemControlStatusComponent from 'src/pages/dashboard/SystemControlStatusComponent.vue'
import { useAppearanceStore } from 'src/appearance/store'

const pages = [
  {
    name: 'dashboard',
    title: 'layout.dashboard',
    page: 'dashboard',
    icon: 'dashboard'
  },
  {
    name: 'modules',
    title: 'layout.modules',
    page: 'modules_active',
    icon: 'fa-solid fa-layer-group'
  },
  {
    name: 'activeness',
    title: 'layout.activeness',
    page: 'activeness',
    icon: 'fa-solid fa-globe'
  },
  {
    name: 'settings',
    title: 'layout.settings',
    page: 'settings',
    icon: 'settings'
  },
  {
    name: 'schedule',
    title: 'layout.schedule',
    page: 'schedule',
    icon: 'schedule'
  },
  { name: 'top', title: 'layout.top', page: 'top', icon: 'leaderboard' },
  {
    name: 'developers',
    title: 'layout.developers',
    page: 'developers',
    icon: 'person'
  }
] as Array<{
  name: string;
  title: string;
  page: string;
  icon: string;
}>

const leftDrawerOpen = ref(false)
const appearanceStore = useAppearanceStore()

function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

async function goToPage (page: string) {
  await router.push({ name: page })
}

const showMurkaDialog = ref(false)
</script>

<style lang="scss" scoped>
.selectable_menu:hover {
  background-color: var(--app-nav-hover-bg);
  cursor: pointer;
}

.app-shell-header {
  background: var(--app-shell-surface);
  color: var(--app-shell-text);
}

.app-shell-drawer {
  background: var(--app-shell-surface);
  color: var(--app-shell-text);
}

.easter-side-badge__egg {
  width: 12px;
  height: 16px;
  border-radius: 50% 50% 46% 46% / 58% 58% 42% 42%;
  background: linear-gradient(180deg, #fde68a 0%, #f59e0b 100%);
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.4);
}

.easter-side-badge__egg--blue {
  background: linear-gradient(180deg, #93c5fd 0%, #2563eb 100%);
}

.easter-side-badge__egg--pink {
  background: linear-gradient(180deg, #f9a8d4 0%, #db2777 100%);
}

.app-nav-title {
  color: var(--app-shell-text-muted);
}

.app-nav-item {
  color: var(--app-shell-text);
}

.app-nav-item--active {
  background: var(--app-nav-active-bg);
}

.app-logo {
  width: 96px;
  height: 96px;
  object-fit: contain;
}

.app-logo-wrap {
  margin-top: -24px;
  position: relative;
  width: 170px;
  height: 150px;
  margin-left: auto;
  margin-right: auto;
}

.logo-easter-eggs {
  position: absolute;
  inset: 0 0 auto 0;
  width: 170px;
  height: 150px;
  pointer-events: none;
}

.logo-easter-egg {
  position: absolute;
  width: 14px;
  height: 18px;
  border-radius: 50% 50% 46% 46% / 58% 58% 42% 42%;
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.35),
    0 6px 10px rgba(15, 23, 42, 0.16),
    0 0 16px rgba(255, 255, 255, 0.08);
  animation: logo-easter-egg-float 4.2s ease-in-out infinite;
}

.logo-easter-egg--1 {
  left: 8px;
  top: 16px;
  background: linear-gradient(180deg, #facc15 0%, #fb923c 100%);
}

.logo-easter-egg--2 {
  left: 22px;
  top: 42px;
  width: 10px;
  height: 14px;
  background: linear-gradient(180deg, #93c5fd 0%, #2563eb 100%);
  animation-delay: 0.5s;
  animation-name: logo-easter-egg-bob;
}

.logo-easter-egg--3 {
  right: 12px;
  top: 12px;
  background: linear-gradient(180deg, #f9a8d4 0%, #db2777 100%);
  animation-delay: 1s;
}

.logo-easter-egg--4 {
  right: 26px;
  top: 42px;
  width: 11px;
  height: 15px;
  background: linear-gradient(180deg, #86efac 0%, #16a34a 100%);
  animation-delay: 1.4s;
  animation-name: logo-easter-egg-sway;
}

.logo-easter-egg--5 {
  left: 10px;
  bottom: 18px;
  width: 12px;
  height: 16px;
  background: linear-gradient(180deg, #fde68a 0%, #f59e0b 100%);
  animation-delay: 0.8s;
}

.logo-easter-egg--6 {
  left: 34px;
  bottom: 10px;
  width: 10px;
  height: 14px;
  background: linear-gradient(180deg, #c4b5fd 0%, #7c3aed 100%);
  animation-delay: 1.8s;
  animation-name: logo-easter-egg-bob;
}

.logo-easter-egg--7 {
  right: 28px;
  bottom: 18px;
  width: 12px;
  height: 16px;
  background: linear-gradient(180deg, #93c5fd 0%, #2563eb 100%);
  animation-delay: 2.1s;
}

.logo-easter-egg--8 {
  right: 8px;
  bottom: 10px;
  width: 10px;
  height: 14px;
  background: linear-gradient(180deg, #f9a8d4 0%, #db2777 100%);
  animation-delay: 2.6s;
  animation-name: logo-easter-egg-sway;
}

.logo-easter-egg--9 {
  left: 0;
  top: 64px;
  width: 9px;
  height: 12px;
  background: linear-gradient(180deg, #5eead4 0%, #0f766e 100%);
  animation-delay: 0.9s;
}

.logo-easter-egg--10 {
  right: 0;
  top: 66px;
  width: 9px;
  height: 12px;
  background: linear-gradient(180deg, #fda4af 0%, #e11d48 100%);
  animation-delay: 1.7s;
}

.logo-easter-egg--11 {
  left: 48px;
  top: 12px;
  width: 8px;
  height: 11px;
  background: linear-gradient(180deg, #bfdbfe 0%, #1d4ed8 100%);
  animation-delay: 2.3s;
  animation-name: logo-easter-egg-bob;
}

.logo-easter-egg--12 {
  right: 52px;
  top: 6px;
  width: 8px;
  height: 11px;
  background: linear-gradient(180deg, #fdba74 0%, #ea580c 100%);
  animation-delay: 0.3s;
}

.logo-easter-egg--13 {
  left: 52px;
  bottom: 2px;
  width: 8px;
  height: 11px;
  background: linear-gradient(180deg, #ddd6fe 0%, #7c3aed 100%);
  animation-delay: 1.1s;
  animation-name: logo-easter-egg-sway;
}

.logo-easter-egg--14 {
  right: 56px;
  bottom: 0;
  width: 8px;
  height: 11px;
  background: linear-gradient(180deg, #bbf7d0 0%, #15803d 100%);
  animation-delay: 2.8s;
}

.logo-easter-egg--15 {
  left: 18px;
  top: 108px;
  width: 9px;
  height: 12px;
  background: linear-gradient(180deg, #fef08a 0%, #ca8a04 100%);
  animation-delay: 3.1s;
}

.logo-easter-egg--16 {
  right: 16px;
  top: 106px;
  width: 9px;
  height: 12px;
  background: linear-gradient(180deg, #fecdd3 0%, #be185d 100%);
  animation-delay: 3.4s;
  animation-name: logo-easter-egg-bob;
}

@keyframes logo-easter-egg-float {
  0%, 100% {
    transform: translateY(0) rotate(0deg) scale(1);
  }

  50% {
    transform: translateY(-5px) rotate(6deg) scale(1.06);
  }
}

@keyframes logo-easter-egg-bob {
  0%, 100% {
    transform: translateY(0) scale(1);
  }

  50% {
    transform: translateY(-7px) scale(1.08);
  }
}

@keyframes logo-easter-egg-sway {
  0%, 100% {
    transform: rotate(-4deg) translateY(0);
  }

  50% {
    transform: rotate(5deg) translateY(-4px);
  }
}
</style>

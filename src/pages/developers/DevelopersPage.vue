<template>
  <q-linear-progress
    stripe
    size="5px"
    :value="biohazardActivationMenu"
    v-if="biohazardActivationMenu > 0.05"
  />
  <div class="row q-pt-lg justify-center">
    <q-card class="col-12 col-lg-8 bg-transparent" flat>
      <q-card-section class="row">
        <q-btn
          @click="biohazardClick"
          class="q-pa-xs col"
          style="max-width: 135px"
        >
          <img src="itArmyLogo.jpg" width="128" height="128" />
        </q-btn>
        <div class="col q-pl-md">
          <div class="full-width text-h4 text-bold">IT Army of Ukraine</div>
          <div class="full-width text-subtitle2">
            {{ $t("developers.itaySubtitle") }}
          </div>
          <a href="https://t.me/itarmyofukraine2022" target="_blank"
            >https://t.me/itarmyofukraine2022</a
          >
        </div>
      </q-card-section>

      <q-card-section />

      <div class="text-h5">{{ $t("developers.partners") }}</div>
      <q-separator></q-separator>

      <q-card-section class="items-center allign-center">

        <q-btn
          class="q-pa-sm q-ma-xs"
          @click="openExternalLink('https://www.ukraine.com.ua/')"
        >
          <q-avatar
            style="outline: 2px solid #555"
            class="cursor-pointer"
            square
          >
            <img src="./hosting_ukraine.jpg" />
          </q-avatar>
          <q-tooltip>Hosting Ukraine</q-tooltip>
        </q-btn>

        <q-btn
          class="q-pa-sm q-ma-xs"
          @click="openExternalLink('https://t.me/studentcyberarmy')"
        >
          <q-avatar
            style="outline: 2px solid #555"
            class="cursor-pointer"
            square
          >
            <img src="./SKKO.jpg" />
          </q-avatar>
          <q-tooltip>СККО</q-tooltip>
        </q-btn>
      </q-card-section>

      <div class="text-h5">{{ $t("developers.contacts") }}</div>
      <q-separator></q-separator>
      <q-card-section>
        <p>
          1. {{ $t("developers.contactP1") }}
          <a href="https://t.me/itarmyofukraine2022" target="_blank"
            >https://t.me/itarmyofukraine2022</a
          >. {{ $t("developers.contactP1_2") }}
        </p>
        <p>
          2. {{ $t("developers.contactP2") }}
          <a href="https://github.com/it-army-ua-scripts/itarmykit" target="_blank"
            >https://github.com/it-army-ua-scripts/itarmykit</a
          >, {{ $t("developers.contactP2_1") }}
        </p>
        <p>3. {{ $t("developers.contactP3") }}</p>
      </q-card-section>

      <div class="text-h5">{{ $t("developers.contributors") }}</div>
      <q-separator></q-separator>

      <q-card-section>
        <q-btn
          v-for="contributor of contributors"
          :key="contributor.id"
          class="q-pa-sm q-ma-xs"
          round
          @click="openContributorPage(contributor)"
        >
          <q-avatar style="outline: 2px solid #555" class="cursor-pointer">
            <img :src="contributor.avatar_url" />
          </q-avatar>
          <q-tooltip>
            {{ contributor.login }}:
            {{ contributor.contributions }} contributions
          </q-tooltip>
        </q-btn>
        <div class="text-subtitle2 text-grey text-center">
          {{ $t("developers.contributorsSubtitle") }}
        </div>
      </q-card-section>
    </q-card>
    <q-dialog v-model="showMurkaDialog">
      <q-img src="../../layouts/snowEffect/murka_the_cat.jpg"></q-img>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

import { Contributor } from "app/src-electron/handlers/developers";

const contributors = ref([] as Contributor[]);

async function loadContributors() {
  contributors.value = await window.developersAPI.getContributors();
}

const biohazardActivationMenu = ref(0);
function biohazardClick() {
  biohazardActivationMenu.value += 0.1;
  if (biohazardActivationMenu.value >= 1) {
    if (window.location.pathname == "/") {
      // DEV
      window.location.pathname = "/hazard/index.html";
    } else {
      window.location.pathname =
        window.location.pathname.split("index.html")[0] + "hazard/index.html";
    }
  }
}
function openContributorPage(contributor: Contributor) {
  window.open(contributor.html_url, "_blank");
}

function openExternalLink(link: string) {
  window.open(link, "_blank");
}

let hazardTimeout: NodeJS.Timeout | null = null;

const showMurkaDialog = ref(false);

onMounted(async () => {
  hazardTimeout = setInterval(() => {
    biohazardActivationMenu.value *= 0.8;
  }, 300);
  await loadContributors();
  console.log(contributors.value);
});
onUnmounted(() => {
  if (hazardTimeout) {
    clearInterval(hazardTimeout);
  }
});
</script>

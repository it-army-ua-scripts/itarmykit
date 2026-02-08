<template>
  <q-card flat bordered class="row bg-transparent full-height items-stretch" style="height: 100%;">
    <div class="stat-icon-box">
      <q-icon name="fa-solid fa-globe"></q-icon>
    </div>
    <div class="col q-pa-sm">
      <div class="text-caption text-uppercase text-bold text-grey">
        {{ $t("dashboard.activeness.score") }}
      </div>
      <div class="text-subtitle1 text-bold">{{ score }}</div>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";

const score = ref(0);
async function loadActivenessScore() {
  const response = await window.activenessAPI.getMyStats();
  score.value = response.score;
}

onMounted(async () => {
  await loadActivenessScore();
});
</script>

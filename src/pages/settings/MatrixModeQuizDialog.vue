<template>
    <q-card flat class="matrix-quiz-card" style="width: min(500px, 90vw);">
        <q-card-section>
            <div class="text-h5 text-bold matrix-quiz-title">{{ $t('settings.matrixQuiz.header', {name: itArmyUUID}) }}</div>
            <div class="text-caption matrix-quiz-body">{{ $t('settings.matrixQuiz.body') }}</div>
        </q-card-section>

        <q-card-section class="matrix-quiz-form">
            {{ $t('settings.matrixQuiz.q1')  }}
            <q-input
                filled
                v-model="q1Answer"
                ref="input1"
                :rules="[ val => val.toLowerCase() === '\u043b\u0438\u043f\u0430' || val.toLowerCase() === 'tilia' || '' ]"
            />
            {{ $t('settings.matrixQuiz.q2')  }}
            <q-input
                filled
                v-model="q2Answer"
                ref="input2"
                :rules="[ val => val.toLowerCase() === '\u0445\u0443\u0439\u043b\u043e' || val.toLowerCase() === 'dick' || '' ]"
            />
            {{ $t('settings.matrixQuiz.q3')  }}
            <q-input
                filled
                v-model="q3Answer"
                ref="input3"
                :rules="[ val => val.toLowerCase() === '\u0433\u0440\u0443\u0448\u0430' || val.toLowerCase() === 'pear' || '' ]"
            />
        </q-card-section>

        <q-card-actions>
            <div class="row fit q-col-gutter-sm">
                <q-btn color="blue-8" class="col-12 col-sm-6" @click="emit('onClose')">{{ $t('settings.matrixQuiz.cancell')  }}</q-btn>
                <q-btn color="red-8" class="col-12 col-sm-6" @click="solve">{{ $t('settings.matrixQuiz.submit')  }}</q-btn>
            </div>
        </q-card-actions>
    </q-card>
</template>

<script lang="ts" setup>
import { QInput } from 'quasar'
import { onMounted, ref } from 'vue'

import { useAppearanceStore } from 'src/appearance/store'

const appearanceStore = useAppearanceStore()

const emit = defineEmits(['onClose'])

const q1Answer = ref('')
const input1 = ref<QInput>()
const q2Answer = ref('')
const input2 = ref<QInput>()
const q3Answer = ref('')
const input3 = ref<QInput>()

const itArmyUUID = ref('')

async function solve () {
  const valid = await input1.value?.validate() && await input2.value?.validate() && await input3.value?.validate()
  if (!valid) {
    return
  }

  await appearanceStore.unlockMode('matrix')
  await appearanceStore.setMode('matrix')
  emit('onClose')
}

onMounted(async () => {
  const settings = await window.settingsAPI.get()
  itArmyUUID.value = settings.itarmy.uuid
})

</script>

<style scoped>
.matrix-quiz-card {
  background: var(--app-dialog-bg, var(--app-panel-bg));
  color: var(--app-shell-text);
  border: 1px solid var(--app-panel-border);
  border-radius: 16px;
}

.matrix-quiz-title {
  color: var(--app-matrix-accent, #16a34a);
}

.matrix-quiz-body {
  color: var(--app-matrix-accent-muted, #15803d);
}

.matrix-quiz-form :deep(.q-field--filled .q-field__control) {
  background: var(--app-input-bg, rgba(148, 163, 184, 0.1));
}

body.app-theme--dark .matrix-quiz-card {
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.45);
}

body.app-theme--light .matrix-quiz-title {
  color: #15803d;
}

body.app-theme--light .matrix-quiz-body {
  color: #166534;
}
</style>

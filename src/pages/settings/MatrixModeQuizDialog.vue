<template>
    <q-card flat style="width: min(500px, 90vw);">
        <q-card-section>
            <div class="text-h5 text-bold text-light-green-13">{{ $t('settings.matrixQuiz.header', {name: itArmyUUID}) }}</div>
            <div class="text-caption text-light-green-13">{{ $t('settings.matrixQuiz.body') }}</div>
        </q-card-section>

        <q-card-section>
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

import { useMatrixStore } from 'src/layouts/matrix.store'

const matrixStore = useMatrixStore()

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

  await window.settingsAPI.gui.setMatrixModeUnlocked(true)
  await matrixStore.setEnabled(true)
  emit('onClose')
}

onMounted(async () => {
  const settings = await window.settingsAPI.get()
  itArmyUUID.value = settings.itarmy.uuid
})

</script>

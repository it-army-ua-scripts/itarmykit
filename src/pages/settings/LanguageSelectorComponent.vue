<template>
  <q-select
    v-model="language"
    outlined
    :options="languages"
    :option-value="(opt) => opt.symbol"
    :option-label="(opt) => opt.name"
    behavior="menu"
    @update:model-value="onLanguageSelected"
  >
    <template v-slot:option="scope">
      <q-item class="menu-item" v-bind="scope.itemProps">
        <q-item-section>
          <q-item-label>{{ scope.opt.name }}</q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </q-select>

  <q-dialog v-model="showThatRussiaIsTerroistCountry" persistent>
    <PeopleAreLikeShipsComponent @closed="showThatRussiaIsTerroistCountry = false" />
  </q-dialog>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import PeopleAreLikeShipsComponent from '../top/achievements/PeopleAreLikeShipsComponent.vue'

const i18n = useI18n()

interface Language {
  name: string
  symbol: 'ua-UA' | 'en-US' | 'de-DE' | 'ru-RU'
}

const languages: Language[] = [
  {
    name: '\u0423\u043a\u0440\u0430\u0457\u043d\u0441\u044c\u043a\u0430',
    symbol: 'ua-UA'
  },
  {
    name: 'English',
    symbol: 'en-US'
  },
  {
    name: 'Deutsch',
    symbol: 'de-DE'
  },
  {
    name: '\u041c\u043e\u0441\u043a\u043e\u0432\u0441\u044c\u043a\u0438\u0439',
    symbol: 'ru-RU'
  }
]

const language = ref<Language>(languages[0])
const showThatRussiaIsTerroistCountry = ref(false)

async function onLanguageSelected (lang: Language) {
  if (lang.symbol === 'ru-RU') {
    showThatRussiaIsTerroistCountry.value = true
    await loadSavedLanguage()
    return
  }

  i18n.locale.value = lang.symbol
  await window.settingsAPI.system.setLanguage(lang.symbol as 'ua-UA' | 'en-US' | 'de-DE')
  language.value = lang
}

async function loadSavedLanguage () {
  const settings = await window.settingsAPI.get()
  language.value = languages.find((l) => l.symbol === settings.system.language) || languages[0]
}

onMounted(async () => {
  await loadSavedLanguage()
})
</script>

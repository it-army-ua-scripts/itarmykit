<template>
    <q-card>
        <img src="../../../assets/russianWarShip.jpeg">

        <q-card-section>
            <div class="text-h6">{{ $t('top.achievements.peopleAreLikeShips.title') }}</div>
            <div class="text-subtitle2">{{ $t('top.achievements.peopleAreLikeShips.subtitle') }}</div>
        </q-card-section>

        <q-card-section>
            {{ $t('top.achievements.peopleAreLikeShips.body') }}
        </q-card-section>

        <q-card-section>
            <div v-if="!showExplanation" class="text-grey text-subtitle2 cursor-pointer" @click="showExplanation = true">{{ $t('top.achievements.peopleAreLikeShips.explanationHint') }}</div>
            <div v-else>
                {{ $t('top.achievements.peopleAreLikeShips.explanation') }}
            </div>
        </q-card-section>

        <q-card-actions>
            <q-btn outline v-if="flip" class="fit q-mb-sm" color="positive" :label="$t('top.achievements.peopleAreLikeShips.goodButton')" @click="close"/>
            <q-btn outline class="full-width" :label="$t('top.achievements.peopleAreLikeShips.badButton')" color="negative" @mouseenter="flip = !flip"/>
            <q-btn outline v-if="!flip" class="full-width q-mt-sm" color="positive" :label="$t('top.achievements.peopleAreLikeShips.goodButton')" @click="close"/>
        </q-card-actions>
    </q-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ModuleName, Version } from 'app/lib/module/module';

const flip = ref(false)

const emit = defineEmits<{
    (event: 'closed'): void,
}>()

const showExplanation = ref(false)

function close() {
    emit('closed')
}
</script>
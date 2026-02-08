<template>
    <q-card flat bordered class="row bg-transparent items-stretch">
        <div class="stat-icon-box"><q-icon name="terminal"></q-icon></div>
        <div class="col q-pa-sm">
            <div class="text-caption text-uppercase text-bold text-grey">{{ $t('dashboard.updates') }}</div>
            <div class="text-subtitle1 text-bold"> {{ version }} | {{ $t('dashboard.latest') }}</div>
        </div>
    </q-card>
</template>

<script setup lang="ts">
import { version } from '../../../package.json'
</script>

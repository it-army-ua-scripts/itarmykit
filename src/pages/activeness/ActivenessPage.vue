<template>
  <q-page class="activeness-page q-pa-md">
    <q-spinner size="xl" class="q-ma-xl" v-if="loadingAll" />

    <div v-else-if="loginRequired">
      <q-card flat class="q-pa-md activeness-login-card">
        <q-card-section class="q-pb-sm">
          <div class="text-h5 text-center activeness-title">
            {{ $t("activeness.login.title") }}
          </div>
          <div class="text-subtitle1 text-center activeness-subtitle">
            {{ $t("activeness.login.info") }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-input
            outlined
            v-model="emailInput"
            :label="$t('activeness.login.email')"
            class="q-mb-sm"
          />
          <q-input
            outlined
            v-model="passwordInput"
            :label="$t('activeness.login.password')"
            type="password"
          />
        </q-card-section>

        <q-card-actions>
          <q-btn
            color="primary"
            class="fit"
            outline
            :label="$t('activeness.login.loginButton')"
            :loading="loginLoading"
            :disable="loginLoading || !emailInput || !passwordInput"
            @click="login"
          />
        </q-card-actions>
      </q-card>
    </div>

    <div v-else class="activeness-shell">
      <q-card flat bordered class="activeness-hero q-pa-md">
        <div class="activeness-hero__top">
          <div>
            <div class="text-h5 activeness-title">
              {{ $t('activeness.tasksTable.title') }}
            </div>
            <div class="activeness-subtitle q-mt-xs">
              {{ $t('activeness.summary.subtitle') }}
            </div>
          </div>

          <div class="activeness-hero__actions">
            <q-btn
              outline
              icon="fa-solid fa-circle-plus"
              :label="$t('activeness.suggesttarget')"
              @click="openSuggestPage"
            />
            <q-btn
              outline
              icon="logout"
              :label="$t('activeness.logoutButton')"
              @click="logout"
            />
          </div>
        </div>

        <div class="activeness-summary-grid q-mt-md">
          <q-card flat class="activeness-summary-card">
            <div class="activeness-summary-card__label">
              {{ $t('activeness.summary.available') }}
            </div>
            <div class="activeness-summary-card__value">
              {{ tasks.length }}
            </div>
          </q-card>

          <q-card flat class="activeness-summary-card">
            <div class="activeness-summary-card__label">
              {{ $t('activeness.summary.priority') }}
            </div>
            <div class="activeness-summary-card__value">
              {{ priorityTasksCount }}
            </div>
          </q-card>

          <q-card flat class="activeness-summary-card">
            <div class="activeness-summary-card__label">
              {{ $t('activeness.summary.nextStep') }}
            </div>
            <div class="activeness-summary-card__hint">
              {{ $t('activeness.summary.nextStepHint') }}
            </div>
          </q-card>
        </div>
      </q-card>

      <q-banner
        v-if="tasks.length > 0"
        inline-actions
        rounded
        class="activeness-tip q-mt-md"
      >
        {{ $t('activeness.summary.tip') }}
      </q-banner>

      <q-card
        v-if="tasks.length === 0"
        flat
        bordered
        class="activeness-empty q-pa-lg q-mt-md text-center"
      >
        <q-icon name="task_alt" size="42px" class="q-mb-sm" />
        <div class="text-h6">{{ $t('activeness.summary.emptyTitle') }}</div>
        <div class="activeness-subtitle q-mt-xs">
          {{ $t('activeness.summary.emptyBody') }}
        </div>
      </q-card>

      <q-table
        v-else-if="!$q.screen.lt.md"
        flat
        bordered
        class="q-mt-md activeness-table"
        :columns="columns"
        :rows="tasks"
        row-key="id"
        hide-bottom
        :pagination="{ rowsPerPage: 1000 }"
        :wrap-cells="true"
        dense
      >
        <template v-slot:body-cell-id="props">
          <q-td :props="props">
            <div class="activeness-task-id">#{{ props.row.id }}</div>
          </q-td>
        </template>

        <template v-slot:body-cell-what="props">
          <q-td :props="props">
            <div class="row items-center no-wrap q-gutter-sm">
              <q-icon
                v-if="props.row.priority"
                name="local_fire_department"
                color="red"
                size="sm"
              >
                <q-tooltip>
                  {{ $t("activeness.tasksTable.priority") }}
                </q-tooltip>
              </q-icon>
              <span class="text-weight-medium">{{ props.row.whattodo }}</span>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-link="props">
          <q-td :props="props" class="activeness-link-cell">
            <a
              :href="props.row.link"
              target="_blank"
              rel="noopener noreferrer"
              class="activeness-link"
              @click.prevent="openTaskLink(props.row)"
            >
              {{ shortenLink(props.row.link) }}
            </a>
          </q-td>
        </template>

        <template v-slot:body-cell-description="props">
          <q-td :props="props">
            <span class="activeness-description">
              {{ props.row.message || $t('activeness.summary.noDescription') }}
            </span>
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <div class="column items-end q-gutter-y-xs">
              <div
                v-if="!canMarkTaskDone(props.row)"
                class="activeness-action-hint"
              >
                {{ $t('activeness.actions.openFirst') }}
              </div>
              <div class="row no-wrap q-gutter-sm justify-end">
                <q-btn
                  unelevated
                  color="positive"
                  icon="done"
                  :label="$t('activeness.actions.done')"
                  :loading="taskActionLoading"
                  :disable="taskActionLoading || !canMarkTaskDone(props.row)"
                  @click="makeTaskDone(props.row)"
                />
                <q-btn
                  outline
                  color="negative"
                  icon="delete"
                  :label="$t('activeness.actions.ignore')"
                  :loading="taskActionLoading"
                  :disable="taskActionLoading"
                  @click="ignoreTask(props.row)"
                />
              </div>
            </div>
          </q-td>
        </template>
      </q-table>

      <div v-else class="q-mt-md activeness-mobile-list">
        <q-card
          v-for="task in tasks"
          :key="task.id"
          flat
          bordered
          class="activeness-task-card"
        >
          <div class="activeness-task-card__header">
            <div>
              <div class="activeness-task-id">#{{ task.id }}</div>
              <div class="text-subtitle1 text-weight-medium q-mt-xs">
                {{ task.whattodo }}
              </div>
            </div>
            <q-chip
              v-if="task.priority"
              dense
              color="negative"
              text-color="white"
              icon="local_fire_department"
            >
              {{ $t('activeness.summary.priorityTag') }}
            </q-chip>
          </div>

          <div class="q-mt-md">
            <div class="activeness-task-card__label">{{ $t('activeness.tasksTable.link') }}</div>
            <a
              :href="task.link"
              target="_blank"
              rel="noopener noreferrer"
              class="activeness-link"
              @click.prevent="openTaskLink(task)"
            >
              {{ shortenLink(task.link) }}
            </a>
          </div>

          <div
            v-if="!canMarkTaskDone(task)"
            class="activeness-action-hint q-mt-sm"
          >
            {{ $t('activeness.actions.openFirst') }}
          </div>

          <div class="q-mt-md">
            <div class="activeness-task-card__label">{{ $t('activeness.tasksTable.description') }}</div>
            <div class="activeness-description">
              {{ task.message || $t('activeness.summary.noDescription') }}
            </div>
          </div>

          <div class="row q-col-gutter-sm q-mt-md">
            <div class="col-12 col-sm-6">
              <q-btn
                unelevated
                color="positive"
                icon="done"
                class="full-width"
                :label="$t('activeness.actions.done')"
                :loading="taskActionLoading"
                :disable="taskActionLoading || !canMarkTaskDone(task)"
                @click="makeTaskDone(task)"
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-btn
                outline
                color="negative"
                icon="delete"
                class="full-width"
                :label="$t('activeness.actions.ignore')"
                :loading="taskActionLoading"
                :disable="taskActionLoading"
                @click="ignoreTask(task)"
              />
            </div>
          </div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { Task } from '../../../lib/activeness/api'
import { computed, onMounted, ref } from 'vue'
import { QTableColumn, useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'

const $q = useQuasar()
const $i18n = useI18n()

const loadingAll = ref(true)
const loginRequired = ref(true)

async function updateLoginStatus () {
  loadingAll.value = true
  try {
    loginRequired.value = !(await window.activenessAPI.isLoggedIn())
  } finally {
    loadingAll.value = false
  }
}

const loginLoading = ref(false)
const emailInput = ref('')
const passwordInput = ref('')

async function login () {
  loginLoading.value = true
  try {
    const response = await window.activenessAPI.login(
      emailInput.value,
      passwordInput.value
    )
    if (response.status !== 'ok') {
      $q.notify({
        message: response.errorType === 'REQUEST_FAILED'
          ? $i18n.t('activeness.login.networkFailed')
          : $i18n.t('activeness.login.failed'),
        type: 'negative',
        timeout: 5000
      })
      return
    }

    await updateLoginStatus()
    await loadTasks()
  } finally {
    loginLoading.value = false
    passwordInput.value = ''
  }
}

async function logout () {
  await window.activenessAPI.logout()
  await updateLoginStatus()
}

const columns = computed(
  () =>
    [
      {
        name: 'id',
        label: $i18n.t('activeness.tasksTable.id'),
        field: 'id',
        align: 'left',
        sortable: false
      },
      {
        name: 'what',
        label: $i18n.t('activeness.tasksTable.what'),
        field: 'whattodo',
        align: 'left',
        sortable: false
      },
      {
        name: 'link',
        label: $i18n.t('activeness.tasksTable.link'),
        field: 'link',
        align: 'left',
        sortable: false
      },
      {
        name: 'description',
        label: $i18n.t('activeness.tasksTable.description'),
        field: 'message',
        align: 'left',
        sortable: false
      },
      {
        name: 'actions',
        label: $i18n.t('activeness.tasksTable.actions'),
        field: 'actions',
        align: 'left',
        sortable: false
      }
    ] as Array<QTableColumn>
)

const tasks = ref<Array<Task>>([])
const openedTaskIds = ref<number[]>([])
const priorityTasksCount = computed(() => tasks.value.filter(task => task.priority).length)

function shortenLink (link: string) {
  return link.length > 52 ? `${link.slice(0, 49)}...` : link
}

function isSessionError (status: string) {
  return status === 'sidexpired' || status === 'sidcheckfail'
}

function canMarkTaskDone (task: Task) {
  return openedTaskIds.value.includes(task.id)
}

function getTaskActionErrorMessage (status: string, errorMessage: string, action: 'done' | 'ignore') {
  if (status === 'clicktoofast') {
    return $i18n.t('activeness.errors.clickTooFast')
  }
  if (status === 'id_check_fails') {
    return $i18n.t('activeness.errors.invalidTaskId')
  }
  if (status === 'sidexpired') {
    return $i18n.t('activeness.errors.sidExpired')
  }
  if (status === 'sidcheckfail') {
    return $i18n.t('activeness.errors.sidCheckFail')
  }
  if (status.startsWith('err#')) {
    return action === 'done'
      ? $i18n.t('activeness.errors.doneRejected', { error: status })
      : $i18n.t('activeness.errors.ignoreRejected', { error: status })
  }
  if (errorMessage) {
    return errorMessage
  }
  return $i18n.t('activeness.errors.unknown')
}

async function loadTasks () {
  const response = await window.activenessAPI.getTasksList()
  if (response.status !== 'ok') {
    $q.notify({
      message: isSessionError(response.status)
        ? $i18n.t('activeness.errors.sessionExpired')
        : $i18n.t('activeness.notifyTaskLoadFailed', {
          error: response.errorMessage || response.status
        }),
      type: 'negative',
      timeout: 5000
    })
    if (isSessionError(response.status)) {
      tasks.value = []
      await updateLoginStatus()
    }
    return
  }
  // Sort bypriority flag
  response.list.sort((a, b) => {
    if (a.priority && !b.priority) {
      return -1
    }
    if (!a.priority && b.priority) {
      return 1
    }
    return 0
  })

  tasks.value = response.list
  openedTaskIds.value = openedTaskIds.value.filter(id => response.list.some(task => task.id === id))
}

const taskActionLoading = ref(false)

async function makeTaskDone (task: Task) {
  if (!canMarkTaskDone(task)) {
    $q.notify({
      message: $i18n.t('activeness.errors.openTaskFirst'),
      type: 'warning',
      timeout: 4000
    })
    return
  }

  taskActionLoading.value = true
  try {
    const response = await window.activenessAPI.makeTaskDone(task.id)
    if (response.status !== 'ok') {
      $q.notify({
        message: $i18n.t('activeness.notifyFailedToMakeTaskDone', {
          error: getTaskActionErrorMessage(response.status, response.errorMessage, 'done')
        }),
        type: 'negative',
        timeout: 5000
      })
      if (isSessionError(response.status)) {
        tasks.value = []
        await updateLoginStatus()
      }
      return
    }

    await loadTasks()
  } finally {
    taskActionLoading.value = false
  }
}

async function ignoreTask (task: Task) {
  taskActionLoading.value = true
  try {
    const response = await window.activenessAPI.ignoreTask(task.id)
    if (response.status !== 'ok') {
      $q.notify({
        message: $i18n.t('activeness.notifyFailedTOIgnoreTask', {
          error: getTaskActionErrorMessage(response.status, response.errorMessage, 'ignore')
        }),
        type: 'negative',
        timeout: 5000
      })
      if (isSessionError(response.status)) {
        tasks.value = []
        await updateLoginStatus()
      }
      return
    }

    await loadTasks()
  } finally {
    taskActionLoading.value = false
  }
}

async function openTaskLink (task: Task) {
  const opened = await window.helpersAPI.openURLInBrowser(task.link)
  if (opened && !openedTaskIds.value.includes(task.id)) {
    openedTaskIds.value = [...openedTaskIds.value, task.id]
  }
}

async function openSuggestPage () {
  await window.helpersAPI.openURLInBrowser('https://activeness.social/suggest')
}

onMounted(async () => {
  await updateLoginStatus()
  if (!loginRequired.value) {
    await loadTasks()
  }
})
</script>

<style scoped>
.activeness-page {
  max-width: 1320px;
  margin: 0 auto;
}

.activeness-login-card,
.activeness-shell :deep(.q-table__card),
.activeness-hero,
.activeness-task-card,
.activeness-empty {
  background: var(--app-soft-surface);
  border: 1px solid var(--app-soft-border);
  border-radius: 16px;
}

.activeness-hero__top {
  display: flex;
  gap: 16px;
  justify-content: space-between;
  align-items: flex-start;
}

.activeness-hero__actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.activeness-summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.activeness-summary-card {
  padding: 14px 16px;
  border-radius: 14px;
  background: color-mix(in srgb, var(--app-soft-surface) 85%, white);
  border: 1px solid var(--app-soft-border);
}

.activeness-summary-card__label,
.activeness-task-card__label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--app-muted-text);
}

.activeness-summary-card__value {
  margin-top: 6px;
  font-size: 28px;
  font-weight: 700;
  color: var(--app-shell-text);
}

.activeness-summary-card__hint {
  margin-top: 8px;
  font-size: 14px;
  line-height: 1.45;
  color: var(--app-shell-text);
}

.activeness-title {
  color: var(--app-shell-text);
}

.activeness-subtitle {
  color: var(--app-muted-text);
}

.activeness-shell :deep(.q-field__control) {
  background: var(--app-soft-surface);
}

.activeness-shell :deep(.q-table th),
.activeness-shell :deep(.q-table td) {
  color: var(--app-shell-text);
}

.activeness-shell :deep(.q-table__title) {
  color: var(--app-shell-text);
}

.activeness-tip {
  background: color-mix(in srgb, var(--app-accent-warm) 10%, var(--app-soft-surface));
  color: var(--app-shell-text);
  border: 1px solid color-mix(in srgb, var(--app-accent-warm) 35%, var(--app-soft-border));
}

.activeness-table :deep(th),
.activeness-table :deep(td) {
  padding-top: 14px;
  padding-bottom: 14px;
}

.activeness-link {
  color: var(--app-accent-link, #2f6fed);
  text-decoration: none;
  word-break: break-word;
}

.activeness-link:hover {
  text-decoration: underline;
}

.activeness-task-id {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--app-muted-text);
}

.activeness-description {
  color: var(--app-shell-text);
  line-height: 1.45;
}

.activeness-link-cell {
  max-width: 320px;
}

.activeness-mobile-list {
  display: grid;
  gap: 12px;
}

.activeness-task-card {
  padding: 16px;
}

.activeness-task-card__header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.activeness-action-hint {
  font-size: 12px;
  font-weight: 600;
  color: var(--app-muted-text);
}

@media (max-width: 1023px) {
  .activeness-summary-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767px) {
  .activeness-page {
    padding: 12px;
  }

  .activeness-hero__top {
    flex-direction: column;
  }

  .activeness-hero__actions {
    width: 100%;
  }

  .activeness-hero__actions :deep(.q-btn) {
    width: 100%;
  }
}
</style>

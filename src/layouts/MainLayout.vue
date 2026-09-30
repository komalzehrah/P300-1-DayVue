<script setup lang="ts">
import { computed, reactive, ref, provide } from 'vue'
import { useRouter } from 'vue-router'
import DatePickerHeader from '../components/DatePickerHeader.vue'
import DashboardDateRangePicker from '../components/DashboardDateRangePicker.vue'
import Toolbar from '../components/Toolbar.vue'
import TabNavigation from '../components/TabNavigation.vue'
import SettingsDrawer from '../components/SettingsDrawer.vue'
import AddItemModal from '../components/AddItemModal.vue'
import { sampleHabits, sampleScheduleItems, sampleTasks, type DatedHabit, type DatedScheduleItem, type DatedTask } from '../data/fakeEntries'

const router = useRouter()
type NavigationPage = 'Schedule' | 'Tasks' | 'Habits' | 'Recap'

const showSettingsDrawer = ref(false)
const showAddModal = ref(false)
const selectedTab = computed<NavigationPage>(() => {
  const routeName = router.currentRoute.value.name
  return routeName === 'Schedule' || routeName === 'Tasks' || routeName === 'Habits' ? routeName : 'Recap'
})
const today = new Date()
const selectedDate = ref(
  `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
)
const dashboardDateRange = reactive({ startDate: '2026-03-01', endDate: '2026-07-31' })
const scheduleItems = ref<DatedScheduleItem[]>([...sampleScheduleItems])
const tasks = ref<DatedTask[]>([...sampleTasks])
const habits = ref<DatedHabit[]>([...sampleHabits])

provide('scheduleItems', scheduleItems)
provide('selectedDate', selectedDate)
provide('dashboardDateRange', dashboardDateRange)
provide('tasks', tasks)
provide('habits', habits)

const toggleSettings = () => {
  showSettingsDrawer.value = !showSettingsDrawer.value
}

const toggleAddModal = () => {
  showAddModal.value = !showAddModal.value
}

const selectTab = (tab: NavigationPage) => {
  const paths: Record<NavigationPage, string> = {
    Recap: '/',
    Schedule: '/schedule',
    Tasks: '/tasks',
    Habits: '/habits'
  }
  router.push(paths[tab])
}

const handleAddItem = (item: any) => {
  if (selectedTab.value === 'Tasks') {
    tasks.value.push({
      id: item.id,
      title: item.title,
      priority: item.priority ?? 'medium',
      progress: item.progress ?? 'not-started',
      repeat: item.repeat ?? false,
      repeatFrequency: item.repeatFrequency,
      repeatInterval: item.repeatInterval,
      date: selectedDate.value
    })
    return
  }

  if (selectedTab.value === 'Habits') {
    habits.value.push({
      id: item.id,
      date: selectedDate.value,
      title: item.title,
      frequency: item.frequency ?? 'Daily',
      completed: false
    })
    return
  }

  if (selectedTab.value === 'Schedule' || selectedTab.value === 'Recap') {
    scheduleItems.value.push({ ...item, date: selectedDate.value })
  }
}

const closeSettings = () => {
  showSettingsDrawer.value = false
}
</script>

<template>
  <div class="layout-container">
    <aside class="sidebar">
      <Toolbar
        @toggle-settings="toggleSettings"
        :settings-open="showSettingsDrawer"
      />

      <TabNavigation
        :selected-tab="selectedTab"
        :settings-open="showSettingsDrawer"
        @select-tab="selectTab"
        @toggle-add="toggleAddModal"
        @toggle-settings="toggleSettings"
      />
    </aside>

    <main class="main-content">
      <DashboardDateRangePicker
        v-if="selectedTab === 'Recap'"
        v-model:start-date="dashboardDateRange.startDate"
        v-model:end-date="dashboardDateRange.endDate"
      />
      <DatePickerHeader
        v-else
        v-model="selectedDate"
        :show-add-item="true"
        @add-item="toggleAddModal"
      />
      <div class="page-content">
        <RouterView />
      </div>
    </main>

    <!-- Drawers -->
    <SettingsDrawer
      v-if="showSettingsDrawer"
      @close="closeSettings"
    />

    <!-- Modal Backdrop -->
    <div
      v-if="showAddModal"
      class="modal-backdrop"
      @click="toggleAddModal"
    />

    <!-- Add Item Modal -->
    <AddItemModal
      v-if="showAddModal"
      :active-tab="selectedTab === 'Recap' ? 'Schedule' : selectedTab"
      @close="toggleAddModal"
      @add-item="handleAddItem"
    />
  </div>
</template>

<style scoped>
.layout-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 320px;
  height: 100vh;
  background: var(--bg-primary);
}

.sidebar {
  display: contents;
}

.main-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.page-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 99;
}

@media (max-width: 767px) {
  .sidebar :deep(.tab-navigation) {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 80;
    border-top: 1px solid var(--border-color);
    border-bottom: 0;
    padding-bottom: calc(0.75rem + env(safe-area-inset-bottom));
    box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.18);
  }

  .main-content {
    padding-bottom: calc(80px + env(safe-area-inset-bottom));
  }
}

@media (min-width: 768px) {
  .layout-container {
    display: grid;
    grid-template-columns: 224px minmax(0, 1fr);
    grid-template-rows: minmax(0, 1fr);
    height: 100dvh;
    max-width: none;
    margin: 0;
  }

  .sidebar {
    grid-column: 1;
    grid-row: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    background: var(--bg-secondary);
    border-right: 1px solid var(--border-color);
  }

  .sidebar :deep(.toolbar) {
    height: auto;
    min-height: 88px;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
    gap: 1rem;
    padding: 1.25rem 1rem;
    border-bottom: 0;
  }

  .sidebar :deep(.toolbar-right) {
    display: none;
  }

  .sidebar :deep(.tab-navigation) {
    flex: 1;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    gap: 1.25rem;
    padding: 1.25rem 0.75rem;
    border-bottom: 0;
  }

  .sidebar :deep(.tab-container) {
    width: 100%;
    flex-direction: column;
    gap: 0.35rem;
    padding: 0;
    background: transparent;
  }

  .sidebar :deep(.tab) {
    width: 100%;
    justify-content: flex-start;
    padding: 0.8rem 1rem;
    border-radius: 8px;
  }

  .sidebar :deep(.add-button) {
    width: 100%;
    height: 46px;
    gap: 0.6rem;
    border-radius: 8px;
  }

  .sidebar :deep(.add-label) {
    display: inline;
  }

  .main-content {
    grid-column: 2;
    grid-row: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
  }

  .page-content {
    min-width: 0;
  }
}

@media (min-width: 1024px) {
  .layout-container {
    grid-template-columns: 256px minmax(0, 1fr);
  }
}
</style>

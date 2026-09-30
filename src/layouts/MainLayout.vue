<script setup lang="ts">
import { computed, ref, provide } from 'vue'
import { useRouter } from 'vue-router'
import DatePickerHeader from './DatePickerHeader.vue'
import Toolbar from './Toolbar.vue'
import TabNavigation from './TabNavigation.vue'
import SettingsDrawer from './SettingsDrawer.vue'
import AddItemModal from './AddItemModal.vue'

const router = useRouter()
type NavigationPage = 'Dash' | 'Schedule' | 'Tasks' | 'Habits'
const showSettingsDrawer = ref(false)
const showNotificationsDrawer = ref(false)
const showAddModal = ref(false)
const selectedTab = computed<NavigationPage>(() => {
  const routeName = router.currentRoute.value.name
  return routeName === 'Schedule' || routeName === 'Tasks' || routeName === 'Habits' ? routeName : 'Dash'
})
const today = new Date()
const selectedDate = ref(
  `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
)
const scheduleItems = ref<any[]>([])

provide('scheduleItems', scheduleItems)
provide('selectedDate', selectedDate)

const toggleSettings = () => {
  showSettingsDrawer.value = !showSettingsDrawer.value
}

const toggleNotifications = () => {
  showNotificationsDrawer.value = !showNotificationsDrawer.value
}

const toggleAddModal = () => {
  showAddModal.value = !showAddModal.value
}

const selectTab = (tab: NavigationPage) => {
  const paths: Record<NavigationPage, string> = {
    Dash: '/',
    Schedule: '/schedule',
    Tasks: '/tasks',
    Habits: '/habits'
  }
  router.push(paths[tab])
}

const handleAddItem = (item: any) => {
  if (selectedTab.value === 'Schedule' || selectedTab.value === 'Dash') {
    scheduleItems.value.push(item)
  }
}

const closeDrawers = () => {
  showSettingsDrawer.value = false
  showNotificationsDrawer.value = false
}
</script>

<template>
  <div class="layout-container">
    <aside class="sidebar">
      <Toolbar
        @toggle-settings="toggleSettings"
        @toggle-notifications="toggleNotifications"
        :notifications-open="showNotificationsDrawer"
        :settings-open="showSettingsDrawer"
      />

      <TabNavigation
        :selected-tab="selectedTab"
        @select-tab="selectTab"
        @toggle-add="toggleAddModal"
      />
    </aside>

    <main class="main-content">
      <DatePickerHeader v-model="selectedDate" />
      <div class="page-content">
        <RouterView />
      </div>
    </main>

    <!-- Drawers -->
    <SettingsDrawer
      v-if="showSettingsDrawer"
      @close="closeDrawers"
    />

    <div
      v-if="showNotificationsDrawer"
      class="notifications-drawer"
    >
      <div class="drawer-header">
        <h2>Notifications</h2>
        <button @click="toggleNotifications" class="close-btn">✕</button>
      </div>
      <div class="drawer-content">
        <p style="color: var(--text-secondary);">No new notifications</p>
      </div>
    </div>

    <!-- Modal Backdrop -->
    <div
      v-if="showAddModal"
      class="modal-backdrop"
      @click="toggleAddModal"
    />

    <!-- Add Item Modal -->
    <AddItemModal
      v-if="showAddModal"
      :active-tab="selectedTab === 'Dash' ? 'Schedule' : selectedTab"
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

.notifications-drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  max-width: 300px;
  height: 100%;
  background: var(--bg-secondary);
  border-left: 1px solid var(--border-color);
  z-index: 101;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.drawer-header h2 {
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 1.2rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-primary);
  transition: color 0.2s ease;
}

.close-btn:hover {
  color: var(--accent-color);
}

.drawer-content {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
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
    min-height: 128px;
    flex-direction: column;
    align-items: stretch;
    justify-content: space-between;
    gap: 1.5rem;
    padding: 1.25rem 1rem;
    border-bottom: 1px solid var(--border-color);
  }

  .sidebar :deep(.toolbar-right) {
    justify-content: flex-start;
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

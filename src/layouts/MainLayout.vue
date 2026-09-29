<script setup lang="ts">
import { ref, provide } from 'vue'
import { useRouter } from 'vue-router'
import Toolbar from './Toolbar.vue'
import TabNavigation from './TabNavigation.vue'
import SettingsDrawer from './SettingsDrawer.vue'
import AddItemModal from './AddItemModal.vue'

const router = useRouter()
const showSettingsDrawer = ref(false)
const showNotificationsDrawer = ref(false)
const showAddModal = ref(false)
const selectedTab = ref<'Schedule' | 'Tasks' | 'Habits'>('Schedule')

// Callback ref that will be set by SchedulePage
const onAddScheduleItem = ref<((data: any) => void) | null>(null)

const toggleSettings = () => {
  showSettingsDrawer.value = !showSettingsDrawer.value
}

const toggleNotifications = () => {
  showNotificationsDrawer.value = !showNotificationsDrawer.value
}

const toggleAddModal = () => {
  showAddModal.value = !showAddModal.value
}

const selectTab = (tab: 'Schedule' | 'Tasks' | 'Habits') => {
  selectedTab.value = tab
  if (tab === 'Schedule') router.push('/')
  else if (tab === 'Tasks') router.push('/tasks')
  else if (tab === 'Habits') router.push('/habits')
}

const closeDrawers = () => {
  showSettingsDrawer.value = false
  showNotificationsDrawer.value = false
}

const handleAddScheduleItem = (data: any) => {
  if (onAddScheduleItem.value) {
    onAddScheduleItem.value(data)
  }
}

// Provide the ref so SchedulePage can set the callback
provide('onAddScheduleItem', onAddScheduleItem)
</script>

<template>
  <div class="layout-container">
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

    <main class="main-content">
      <RouterView />
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
      :active-tab="selectedTab"
      @close="toggleAddModal"
      @add-schedule-item="handleAddScheduleItem"
    />
  </div>
</template>

<style scoped>
.layout-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  max-width: 480px;
  margin: 0 auto;
  background: var(--bg-primary);
}

.main-content {
  flex: 1;
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
  font-family: 'Livvic', sans-serif;
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
</style>

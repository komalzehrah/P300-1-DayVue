<script setup lang="ts">
import { SunIcon, BellIcon, CogIcon } from '@heroicons/vue/24/outline'

const emit = defineEmits<{
  'toggle-settings': []
  'toggle-notifications': []
}>()

defineProps<{
  notificationsOpen: boolean
  settingsOpen: boolean
}>()
</script>

<template>
  <header class="toolbar">
    <div class="toolbar-left">
      <div class="logo">
        <SunIcon class="sun-icon" />
        <span class="logo-text">DayVue</span>
      </div>
    </div>

    <div class="toolbar-right">
      <button
        class="icon-btn notifications-btn"
        @click="$emit('toggle-notifications')"
        :class="{ active: notificationsOpen }"
        aria-label="Notifications"
      >
        <BellIcon />
      </button>
      <button
        class="icon-btn settings-btn"
        @click="$emit('toggle-settings')"
        :class="{ active: settingsOpen }"
        aria-label="Settings"
      >
        <CogIcon />
      </button>
    </div>
  </header>
</template>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  height: 60px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.sun-icon {
  width: 24px;
  height: 24px;

}

.icon-btn:hover {
  transform: scale(1.1);  color: var(--accent-color);
}

.icon-btn :deep(svg) {
  width: 20px;
  height: 20px;
  stroke-width: 2;
}

.logo-text {
  font-family: 'Livvic', sans-serif;
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-primary);
}

.toolbar-right {
  display: flex;
  gap: 0.5rem;
}

.icon-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  transition: transform 0.2s ease, color 0.2s ease;
  border-radius: 6px;
  color: var(--accent-color);
  color: var(--accent-hover);
}

.icon-btn.active {
  background: var(--bg-tertiary);
  color: var(--accent-hover);
}

.cta-container {
  padding: 0.5rem 1rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.add-btn {
  width: 100%;
  padding: 0.75rem;
  background: var(--accent-color);
  color: #000;
  border: none;
  border-radius: 20px;
  font-family: 'Livvic', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-btn:hover {
  background: var(--accent-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(255, 193, 7, 0.2);
}

.add-btn:active {
  transform: translateY(0);
}
</style>

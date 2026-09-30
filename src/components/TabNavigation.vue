<script setup lang="ts">
import {
  Squares2X2Icon,
  CalendarDaysIcon,
  ClipboardDocumentCheckIcon,
  ArrowPathIcon,
  ClockIcon,
  Cog6ToothIcon,
  PlusIcon
} from '@heroicons/vue/24/outline'

defineProps<{
  selectedTab: 'Schedule' | 'Tasks' | 'Habits' | 'Recap'
  settingsOpen: boolean
}>()

const emit = defineEmits<{
  'select-tab': [tab: 'Schedule' | 'Tasks' | 'Habits' | 'Recap']
  'toggle-add': []
  'toggle-settings': []
}>()

const tabs = [
  { name: 'Schedule', icon: CalendarDaysIcon },
  { name: 'Tasks', icon: ClipboardDocumentCheckIcon },
  { name: 'Habits', icon: ArrowPathIcon },
  { name: 'Recap', icon: ClockIcon }
] as const

type TabName = typeof tabs[number]['name']
</script>

<template>
  <nav class="tab-navigation">
    <div class="tab-container">
      <button
        v-for="tab in tabs"
        :key="tab.name"
        class="tab"
        :class="{ active: selectedTab === tab.name }"
        :aria-label="tab.name"
        :title="tab.name"
        @click="emit('select-tab', tab.name as TabName)"
      >
        <component :is="tab.icon" class="tab-icon" />
        <span class="tab-label">{{ tab.name }}</span>
      </button>
    </div>
    
    <button v-if="selectedTab !== 'Recap'" class="add-button mobile-add" @click="$emit('toggle-add')" aria-label="Add Item">
      <PlusIcon />
      <span class="add-label">Add item</span>
    </button>

    <div class="settings-footer">
      <button
        class="settings-button"
        :class="{ active: settingsOpen }"
        aria-label="Settings"
        @click="$emit('toggle-settings')"
      >
        <Cog6ToothIcon />
        <span>Settings</span>
      </button>
    </div>
  </nav>
</template>

<style scoped>
.tab-navigation {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.tab-container {
  display: flex;
  gap: 0.25rem;
  background: var(--bg-tertiary);
  border-radius: 24px;
  padding: 0.3rem;
  position: relative;
}

.tab-label {
  display: none;
}

.tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-family: var(--font-ui);
  font-size: calc(0.9rem + 2pt);
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  border-radius: 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1;
}

.tab-icon {
  width: 18px;
  height: 18px;
  stroke-width: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab:hover {
  color: var(--text-primary);
}

.tab.active {
  background: var(--selected-surface);
  color: #000;
  box-shadow: 0 2px 8px rgba(233, 217, 133, 0.2);
}

.tab.active .tab-label {
  display: inline;
}

.tab.active .tab-icon {
  font-weight: 700;
}

.add-button {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #ff8c69;
  border: none;
  color: #051515;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  font-family: var(--font-ui);
  font-size: calc(0.95rem + 2pt);
  font-weight: 500;
}

.add-label {
  display: none;
}

.settings-footer {
  display: none;
}

@media (min-width: 768px) {
  .mobile-add {
    display: none;
  }
}

@media (max-width: 767px) {
  .sidebar-add {
    display: none;
  }
}

.add-button :deep(svg) {
  width: 24px;
  height: 24px;
  stroke-width: 2;
}

.add-button:hover {
  background: #ff7a52;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(255, 140, 105, 0.3);
}

.add-button:active {
  transform: scale(0.95);
}

body.light-mode .tab.active {
  background: var(--selected-surface);
  box-shadow: 0 2px 8px rgba(233, 217, 133, 0.2);
}

@media (min-width: 451px) and (max-width: 767px) {
  .tab-navigation {
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.75rem;
  }

  .tab-container {
    gap: 0.125rem;
    padding: 0.2rem;
  }

  .tab {
    gap: 0.25rem;
    padding: 0.55rem 0.4rem;
    font-size: calc(0.77rem + 2pt);
  }

  .tab-icon {
    width: 16px;
    height: 16px;
  }

  .add-button {
    width: 40px;
    height: 40px;
  }
}

@media (min-width: 1024px) {
  .tab-navigation {
    padding: 0.875rem 2rem;
  }
}

@media (min-width: 768px) {
  .tab-navigation {
    justify-content: flex-start;
    padding: 1.25rem 0.75rem;
  }

  .tab-container {
    gap: 0.35rem;
  }

  .tab {
    font-size: calc(0.95rem + 2pt);
  }

  .tab-label {
    display: inline;
  }

  .settings-footer {
    display: block;
    margin-top: auto;
    padding: 1rem 0.25rem 0;
    border-top: 1px solid var(--border-color);
  }

  .settings-button {
    display: flex;
    width: 100%;
    min-height: 44px;
    align-items: center;
    gap: 0.75rem;
    padding: 0.65rem 1rem;
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: var(--text-secondary);
    cursor: pointer;
    font-family: var(--font-ui);
    font-size: calc(0.95rem + 2pt);
    font-weight: 500;
    text-align: left;
    transition:
      background 0.2s ease,
      color 0.2s ease;
  }

  .settings-button:hover,
  .settings-button.active {
    background: var(--bg-tertiary);
    color: var(--accent-color);
  }

  .settings-button :deep(svg) {
    width: 20px;
    height: 20px;
    flex: 0 0 auto;
  }
}

@media (max-width: 767px) {
  .tab-container {
    flex: 1;
    width: auto;
    min-width: 0;
    justify-content: space-between;
  }

  .tab {
    flex: 1;
    min-width: 0;
    justify-content: center;
    padding-right: 0.25rem;
    padding-left: 0.25rem;
  }

  .tab.active {
    flex: 1.5;
  }
}

@media (max-width: 450px) {
  .tab-navigation {
    gap: 0.5rem;
    padding-inline: 0.5rem;
  }

  .tab {
    gap: 0.25rem;
    padding: 0.5rem 0.4rem;
    font-size: calc(0.77rem + 2pt);
  }

  .tab-container {
    gap: 0.125rem;
    padding: 0.2rem;
  }

  .tab-icon {
    width: 16px;
    height: 16px;
  }

  .add-button {
    width: 40px;
    height: 40px;
  }
}

@media (max-width: 360px) {
  .tab-navigation {
    gap: 0.375rem;
    padding-inline: 0.25rem;
  }

  .tab-container {
    gap: 0.125rem;
    padding: 0.2rem;
  }

  .tab {
    gap: 0.125rem;
    padding: 0.45rem 0.15rem;
    font-size: calc(0.7rem + 2pt);
  }

  .tab-icon {
    width: 14px;
    height: 14px;
  }

  .add-button {
    width: 36px;
    height: 36px;
  }
}
</style>

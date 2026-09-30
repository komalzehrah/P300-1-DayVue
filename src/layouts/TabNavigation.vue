<script setup lang="ts">
import {
  Squares2X2Icon,
  CalendarDaysIcon,
  ClipboardDocumentCheckIcon,
  ArrowPathIcon,
  ClockIcon,
  PlusIcon
} from '@heroicons/vue/24/outline'

defineProps<{
  selectedTab: 'Schedule' | 'Tasks' | 'Habits' | 'Recap'
}>()

const emit = defineEmits<{
  'select-tab': [tab: 'Schedule' | 'Tasks' | 'Habits' | 'Recap']
  'toggle-add': []
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
  font-size: 0.9rem;
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
  background: var(--accent-color);
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
  background: #FF8C69;
  border: none;
  color: #051515;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  font-family: var(--font-ui);
  font-size: 0.95rem;
  font-weight: 500;
}

.add-label {
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
  background: #FF7A52;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(255, 140, 105, 0.3);
}

.add-button:active {
  transform: scale(0.95);
}

body.light-mode .tab.active {
  background: #e9d985;
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
    font-size: 0.77rem;
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
    font-size: 0.95rem;
  }

  .tab-label {
    display: inline;
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
    font-size: 0.77rem;
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
    font-size: 0.7rem;
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

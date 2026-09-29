<script setup lang="ts">
import { CalendarIcon, CheckIcon, SparklesIcon, PlusIcon } from '@heroicons/vue/24/outline'

defineProps<{
  selectedTab: 'Schedule' | 'Tasks' | 'Habits'
}>()

const emit = defineEmits<{
  'select-tab': [tab: 'Schedule' | 'Tasks' | 'Habits']
  'toggle-add': []
}>()

const tabs = [
  { name: 'Schedule', icon: CalendarIcon },
  { name: 'Tasks', icon: CheckIcon },
  { name: 'Habits', icon: SparklesIcon }
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
        @click="emit('select-tab', tab.name as TabName)"
      >
        <component :is="tab.icon" class="tab-icon" />
        <span class="tab-label">{{ tab.name }}</span>
      </button>
    </div>
    
    <button class="add-button" @click="$emit('toggle-add')" aria-label="Add Item">
      <PlusIcon />
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

.tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-family: 'Livvic', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
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

</style>

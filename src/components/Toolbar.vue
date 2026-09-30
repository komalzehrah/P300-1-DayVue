<script setup lang="ts">
import { SunIcon, Cog6ToothIcon } from '@heroicons/vue/24/outline'

const emit = defineEmits<{
  'toggle-settings': []
}>()

defineProps<{
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
        class="icon-btn settings-btn"
        @click="$emit('toggle-settings')"
        :class="{ active: settingsOpen }"
        aria-label="Settings"
      >
        <Cog6ToothIcon />
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
  line-height: 1;
  cursor: pointer;
}

.sun-icon {
  display: block;
  width: 24px;
  height: 24px;
  color: var(--accent-color);
}

body.light-mode .sun-icon {
  color: #ff8c69;
}

.icon-btn:hover {
  transform: scale(1.1);
  color: var(--accent-color);
}

.icon-btn :deep(svg) {
  width: 20px;
  height: 20px;
  stroke-width: 2;
}

.logo-text {
  font-family: var(--font-ui);
  font-size: calc(1.3rem + 2pt);
  font-weight: 500;
  color: var(--text-primary);
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.icon-btn {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  background: none;
  border: none;
  font-size: calc(1.2rem + 2pt);
  cursor: pointer;
  padding: 0;
  transition:
    transform 0.2s ease,
    color 0.2s ease;
  border-radius: 6px;
  color: var(--accent-color);
  color: var(--accent-hover);
}

.icon-btn.active {
  background: var(--bg-tertiary);
  color: var(--accent-hover);
}

.icon-btn.settings-btn {
  color: var(--text-secondary);
}

.icon-btn.settings-btn.active,
.icon-btn.settings-btn:hover {
  background: var(--bg-tertiary);
  color: var(--accent-color);
}

.cta-container {
  padding: 0.5rem 1rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.add-btn {
  width: 100%;
  padding: 0.75rem;
  background: var(--accent-surface);
  color: #000;
  border: none;
  border-radius: 20px;
  font-family: var(--font-ui);
  font-size: calc(1rem + 2pt);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-btn:hover {
  background: var(--accent-surface-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(255, 193, 7, 0.2);
}

.add-btn:active {
  transform: translateY(0);
}

@media (min-width: 481px) {
  .toolbar {
    height: 68px;
    padding: 0 1.5rem;
  }

  .sun-icon {
    width: 28px;
    height: 28px;
  }

  .logo-text {
    font-size: calc(1.5rem + 2pt);
  }

  .toolbar-right {
    gap: 0.75rem;
  }
}

@media (min-width: 1024px) {
  .toolbar {
    padding: 0 2rem;
  }
}
</style>

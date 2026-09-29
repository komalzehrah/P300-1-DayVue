<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { MoonIcon, XMarkIcon } from '@heroicons/vue/24/outline'

const emit = defineEmits<{
  close: []
}>()

const isDarkMode = ref(true)

onMounted(() => {
  const isDark = !document.body.classList.contains('light-mode')
  isDarkMode.value = isDark
})

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  if (isDarkMode.value) {
    document.body.classList.remove('light-mode')
  } else {
    document.body.classList.add('light-mode')
  }
}
</script>

<template>
  <div class="settings-drawer">
    <div class="drawer-header">
      <h2>Settings</h2>
      <button @click="$emit('close')" class="close-btn" aria-label="Close">
        <XMarkIcon />
      </button>
    </div>

    <div class="drawer-content">
      <div class="setting-item">
        <div class="setting-label">
          <span class="setting-title">Dark Mode</span>
          <MoonIcon class="setting-icon" />
        </div>
        <label class="toggle-switch">
          <input
            type="checkbox"
            :checked="isDarkMode"
            @change="toggleDarkMode"
          />
          <span class="slider"></span>
        </label>
      </div>
    </div>
  </div>

  <!-- Backdrop -->
  <div class="drawer-backdrop" @click="$emit('close')" />
</template>

<style scoped>
.settings-drawer {
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
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.drawer-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 100;
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
  cursor: pointer;
  color: var(--text-primary);
  transition: color 0.2s ease;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: var(--accent-color);
}

.close-btn :deep(svg) {
  width: 24px;
  height: 24px;
  stroke-width: 2;
}

.drawer-content {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--bg-tertiary);
  border-radius: 8px;
  margin-bottom: 1rem;
}

.setting-label {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.setting-title {
  font-family: 'Livvic', sans-serif;
  font-weight: 600;
  color: var(--text-primary);
}

.setting-icon {
  width: 20px;
  height: 20px;
}

.setting-icon :deep(svg) {
  width: 20px;
  height: 20px;
  stroke-width: 2;
}

.toggle-switch {
  position: relative;
  display: inline-flex;
  cursor: pointer;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 28px;
  background-color: #ccc;
  border-radius: 14px;
  transition: background-color 0.3s ease;
}

.slider::before {
  content: '';
  position: absolute;
  height: 24px;
  width: 24px;
  left: 2px;
  bottom: 2px;
  background-color: #F6F2E4;
  border-radius: 50%;
  transition: transform 0.3s ease;
}

input:checked + .slider {
  background-color: var(--accent-color);
}

input:checked + .slider::before {
  transform: translateX(22px);
}
</style>

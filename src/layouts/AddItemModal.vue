<script setup lang="ts">
import { ref } from 'vue'
import {
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  StarIcon,
  HeartIcon,
  BoltIcon,
  SparklesIcon,
  AcademicCapIcon,
  TrophyIcon,
  LightBulbIcon,
  UserGroupIcon,
  CodeBracketIcon
} from '@heroicons/vue/24/outline'

defineProps<{
  activeTab: 'Schedule' | 'Tasks' | 'Habits'
}>()

const emit = defineEmits<{
  close: []
}>()

const itemTitle = ref('')
const itemTime = ref('09:00')
const itemDuration = ref('30')
const itemFrequency = ref('Daily')
const selectedIcon = ref('ClockIcon')
const selectedColor = ref('#e9d985')

const scheduleIcons = [
  { name: 'ClockIcon', component: ClockIcon },
  { name: 'CalendarIcon', component: CalendarIcon },
  { name: 'CheckCircleIcon', component: CheckCircleIcon },
  { name: 'StarIcon', component: StarIcon },
  { name: 'HeartIcon', component: HeartIcon },
  { name: 'BoltIcon', component: BoltIcon },
  { name: 'SparklesIcon', component: SparklesIcon },
  { name: 'AcademicCapIcon', component: AcademicCapIcon },
  { name: 'TrophyIcon', component: TrophyIcon },
  { name: 'LightBulbIcon', component: LightBulbIcon },
  { name: 'UserGroupIcon', component: UserGroupIcon },
  { name: 'CodeBracketIcon', component: CodeBracketIcon }
]

const scheduleColors = [
  '#e9d985', // Yellow
  '#FF8C69', // Peach
  '#1CB5BA', // Teal
  '#FF6B9D', // Pink
  '#7B68EE', // Purple
  '#87CEEB', // Sky Blue
  '#90EE90', // Light Green
  '#FFB347'  // Orange
]

const handleSubmit = () => {
  if (itemTitle.value.trim()) {
    const itemData = {
      id: Date.now().toString(),
      title: itemTitle.value,
      time: itemTime.value,
      duration: parseInt(itemDuration.value),
      frequency: itemFrequency.value,
      icon: selectedIcon.value,
      color: selectedColor.value
    }
    emit('add-item', itemData)
    emit('close')
  }
}
</script>

<template>
  <div class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Add {{ activeTab }} Item</h2>
        <button @click="$emit('close')" class="close-btn">✕</button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-form">
        <div class="form-group">
          <label for="title">Title</label>
          <input
            id="title"
            v-model="itemTitle"
            type="text"
            placeholder="Enter item title"
            required
          />
        </div>

        <div v-if="activeTab === 'Schedule'" class="form-group">
          <label for="time">Time</label>
          <input
            id="time"
            v-model="itemTime"
            type="time"
          />
        </div>

        <div v-if="activeTab === 'Schedule'" class="form-group">
          <label for="duration">Duration (minutes)</label>
          <input
            id="duration"
            v-model="itemDuration"
            type="number"
            min="15"
            step="15"
          />
        </div>

        <div v-if="activeTab === 'Schedule'" class="form-group">
          <label>Icon</label>
          <div class="icon-picker">
            <button
              v-for="icon in scheduleIcons"
              :key="icon.name"
              type="button"
              :class="{ active: selectedIcon === icon.name }"
              class="icon-option"
              @click="selectedIcon = icon.name"
              :title="icon.name"
            >
              <component :is="icon.component" class="icon-preview" />
            </button>
          </div>
        </div>

        <div v-if="activeTab === 'Schedule'" class="form-group">
          <label for="color">Item Color</label>
          <div class="color-picker">
            <button
              v-for="color in scheduleColors"
              :key="color"
              type="button"
              :class="{ active: selectedColor === color }"
              class="color-option"
              :style="{ backgroundColor: color }"
              @click="selectedColor = color"
              :title="`Color: ${color}`"
            />
          </div>
        </div>

        <div v-if="activeTab === 'Habits'" class="form-group">
          <label for="frequency">Frequency</label>
          <select id="frequency" v-model="itemFrequency">
            <option>Daily</option>
            <option>Weekly</option>
            <option>Monthly</option>
          </select>
        </div>

        <div class="form-actions">
          <button type="button" @click="$emit('close')" class="cancel-btn">
            Cancel
          </button>
          <button type="submit" class="submit-btn">
            Add {{ activeTab }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 102;
  width: calc(100% - 2rem);
  max-width: 440px;
  animation: modalOpen 0.3s ease;
}

@keyframes modalOpen {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

.modal-content {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 1.3rem;
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

.modal-form {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-family: var(--font-body);
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.95rem;
}

.form-group input,
.form-group select {
  padding: 0.75rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: 1rem;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.form-group select {
  accent-color: var(--accent-color);
}

.form-group input[type="time"]::placeholder,
.form-group input[type="number"]::placeholder {
  color: var(--text-secondary);
}

.form-group input[type="time"]::-webkit-calendar-picker-indicator,
.form-group input[type="time"]::-webkit-clear-button {
  display: none;
}

.form-group input[type="time"] {
  padding-right: 0.75rem;
}


.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--accent-color);
  background: var(--bg-primary);
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.cancel-btn,
.submit-btn {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 6px;
  font-family: var(--font-ui);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.cancel-btn:hover {
  background: var(--border-color);
  transform: translateY(-1px);
}

.submit-btn {
  background: #FF8C69;
  color: #000;
}

.submit-btn:hover {
  background: #FF7A52;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 140, 105, 0.3);
}

.icon-picker {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

.icon-option {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  background: var(--bg-tertiary);
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-primary);
}

.icon-option:hover {
  background: var(--bg-primary);
  border-color: var(--accent-color);
}

.icon-option.active {
  background: var(--accent-color);
  border-color: var(--accent-color);
  color: #000;
}

.icon-preview {
  width: 24px;
  height: 24px;
  stroke-width: 2;
}

.color-picker {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}

.color-option {
  aspect-ratio: 1;
  border: 3px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.color-option:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.color-option.active {
  border-color: var(--text-primary);
  box-shadow: 0 0 0 2px var(--bg-secondary), 0 0 0 4px var(--text-primary);
}
</style>

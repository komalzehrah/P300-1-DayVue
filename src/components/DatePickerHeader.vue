<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{
  modelValue: string
  showAddItem?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'add-item': []
}>()

const showDatePicker = ref(false)
const parseDate = (value: string) => {
  const [year = 1970, month = 1, day = 1] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

const formatDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

const pickerDate = ref(parseDate(props.modelValue))

const currentDateDisplay = computed(() => {
  const date = parseDate(props.modelValue)
  return {
    dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
    month: date.toLocaleDateString('en-US', { month: 'long' }),
    day: date.getDate(),
    year: date.getFullYear()
  }
})

const pickerMonthYear = computed(() =>
  pickerDate.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
)

const calendarDays = computed(() => {
  const year = pickerDate.value.getFullYear()
  const month = pickerDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days: Array<Date | null> = Array(firstDay.getDay()).fill(null)

  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day))
  }

  return days
})

const openDatePicker = () => {
  pickerDate.value = parseDate(props.modelValue)
  showDatePicker.value = true
}

const previousMonth = () => {
  pickerDate.value = new Date(pickerDate.value.getFullYear(), pickerDate.value.getMonth() - 1)
}

const nextMonth = () => {
  pickerDate.value = new Date(pickerDate.value.getFullYear(), pickerDate.value.getMonth() + 1)
}

const selectDate = (date: Date) => {
  emit('update:modelValue', formatDate(date))
  showDatePicker.value = false
}

const selectToday = () => selectDate(new Date())

const isSelected = (date: Date | null) => {
  return date ? formatDate(date) === props.modelValue : false
}
</script>

<template>
  <header class="date-header">
    <div class="date-display">
      <div class="date-group">
        <span class="date-text">
          {{ currentDateDisplay.dayName }}
          <span class="date-highlight">{{ currentDateDisplay.month }} {{ currentDateDisplay.day }},</span>
          {{ currentDateDisplay.year }}
        </span>
        <div class="date-picker-anchor">
          <button class="date-picker-btn" @click="openDatePicker" aria-label="Open date picker" title="Open date picker">
            <ChevronDownIcon />
          </button>
          <div v-if="showDatePicker" class="date-picker-modal">
          <div class="date-picker-header">
            <button class="nav-btn" @click="previousMonth" aria-label="Previous month">
              <ChevronLeftIcon />
            </button>
            <h2 class="month-year">{{ pickerMonthYear }}</h2>
            <button class="nav-btn" @click="nextMonth" aria-label="Next month">
              <ChevronRightIcon />
            </button>
          </div>

          <div class="calendar-grid">
            <div v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="day" class="weekday-header">
              {{ day }}
            </div>
            <button
              v-for="(day, index) in calendarDays"
              :key="index"
              class="calendar-day"
              :class="{ empty: !day, selected: day && isSelected(day) }"
              :disabled="!day"
              @click="day && selectDate(day)"
            >
              {{ day?.getDate() ?? '' }}
            </button>
          </div>

          <div class="date-picker-footer">
            <button class="today-btn" @click="selectToday">Today</button>
            <button class="cancel-btn" @click="showDatePicker = false">Cancel</button>
          </div>
          </div>
        </div>
      </div>
      <button
        v-if="showAddItem"
        class="date-add-button"
        @click="emit('add-item')"
      >
        <PlusIcon />
        <span>Add Item</span>
      </button>
    </div>
  </header>

  <div v-if="showDatePicker" class="date-picker-backdrop" @click="showDatePicker = false" />
</template>

<style scoped>
.date-header {
  position: relative;
  flex: 0 0 auto;
  z-index: 100;
  padding: 1rem;
  background: var(--bg-primary);
}

.date-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.date-group {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.date-text {
  color: var(--text-primary);
  font-family: var(--font-ui);
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 0.02em;
}

.date-highlight {
  color: var(--accent-color);
  font-weight: 600;
}

.date-picker-btn,
.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  border: 0;
  background: transparent;
  color: var(--accent-color);
  cursor: pointer;
  transition: color 0.2s ease, transform 0.2s ease;
}

.date-picker-btn:hover,
.nav-btn:hover {
  color: var(--accent-hover);
  transform: scale(1.1);
}

.date-picker-btn :deep(svg) {
  width: 18px;
  height: 18px;
}

.date-add-button {
  display: none;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  min-height: 40px;
  padding: 0.55rem 1rem;
  border: 0;
  border-radius: 999px;
  background: #ff8c69;
  color: #051515;
  cursor: pointer;
  font-family: var(--font-ui);
  font-size: 0.9rem;
  font-weight: 500;
  transition: background 0.2s ease, transform 0.2s ease;
}

.date-add-button:hover {
  transform: translateY(-1px);
  background: #ff7a52;
}

.date-add-button :deep(svg) {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}

.date-picker-anchor {
  position: static;
  display: flex;
  flex: 0 0 auto;
}

.date-picker-backdrop {
  position: fixed;
  inset: 0;
  z-index: 99;
  background: rgba(0, 0, 0, 0.3);
}

.date-picker-modal {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: auto;
  left: 50%;
  z-index: 1;
  width: min(320px, calc(100vw - 2rem));
  padding: 1.5rem;
  transform: translateX(-50%);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--bg-secondary);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.date-picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.month-year {
  flex: 1;
  margin: 0;
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: 1.1rem;
  font-weight: 600;
  text-align: center;
}

.nav-btn :deep(svg) {
  width: 20px;
  height: 20px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.weekday-header {
  padding: 0.5rem 0;
  color: var(--text-secondary);
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
}

.calendar-day {
  aspect-ratio: 1;
  border: 0;
  border-radius: 6px;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  cursor: pointer;
  font-family: var(--font-ui);
  font-size: 0.9rem;
  font-weight: 500;
}

.calendar-day:hover:not(:disabled) {
  color: var(--accent-color);
}

.calendar-day.selected {
  background: var(--accent-surface);
  color: #000;
}

.calendar-day.empty,
.calendar-day:disabled {
  background: transparent;
  cursor: default;
  opacity: 0.3;
}

.date-picker-footer {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
}

.today-btn,
.cancel-btn {
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  font-family: var(--font-ui);
  font-weight: 500;
}

.today-btn {
  border: 0;
  background: transparent;
  color: var(--accent-color);
}

.cancel-btn {
  border: 1px solid var(--border-color);
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

@media (min-width: 768px) {
  .date-header {
    padding: 1.25rem 2rem;
    border-bottom: 1px solid var(--border-color);
  }

  .date-display {
    width: 100%;
    justify-content: space-between;
  }

  .date-add-button {
    display: inline-flex;
  }
}
</style>
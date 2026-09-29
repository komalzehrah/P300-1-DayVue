<script setup lang="ts">
import { ref, computed, inject, onMounted } from 'vue'
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'

interface ScheduleItem {
  id: string
  time: string
  title: string
  duration: number
  color: string
  icon: string
}

const items = ref<ScheduleItem[]>([])
const selectedDate = ref<string>(new Date().toISOString().split('T')[0])
const showDatePicker = ref(false)
const pickerDate = ref<Date>(new Date(selectedDate.value))

// Inject the callback ref from MainLayout and register our handler
const onAddScheduleItem = inject<any>('onAddScheduleItem', null)

onMounted(() => {
  if (onAddScheduleItem) {
    onAddScheduleItem.value = addScheduleItem
  }
})

const hourLabels = computed(() => {
  const labels = []
  for (let hour = 0; hour < 24; hour++) {
    if (hour === 0) {
      labels.push('') // Empty for 12AM
    } else if (hour < 12) {
      labels.push(`${hour} AM`)
    } else if (hour === 12) {
      labels.push('12 PM')
    } else {
      labels.push(`${hour - 12} PM`)
    }
  }
  return labels
})

const timeSlots = computed(() => {
  const slots = []
  for (let hour = 0; hour < 24; hour++) {
    const timeStr = `${String(hour).padStart(2, '0')}:00`
    slots.push({
      time: timeStr,
      label: '',
      isHourStart: true
    })
  }
  return slots
})

const currentDateDisplay = computed(() => {
  const date = new Date(selectedDate.value)
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
  const month = date.toLocaleDateString('en-US', { month: 'long' })
  const day = date.getDate()
  const year = date.getFullYear()
  return { dayName, month, day, year }
})

const pickerMonthYear = computed(() => {
  return pickerDate.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

const calendarDays = computed(() => {
  const year = pickerDate.value.getFullYear()
  const month = pickerDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()
  
  const days = []
  
  // Empty days for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null)
  }
  
  // Days in the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day))
  }
  
  return days
})

const openDatePicker = () => {
  pickerDate.value = new Date(selectedDate.value)
  showDatePicker.value = true
}

const closeDatePicker = () => {
  showDatePicker.value = false
}

const previousMonth = () => {
  pickerDate.value = new Date(pickerDate.value.getFullYear(), pickerDate.value.getMonth() - 1)
}

const nextMonth = () => {
  pickerDate.value = new Date(pickerDate.value.getFullYear(), pickerDate.value.getMonth() + 1)
}

const selectDate = (date: Date) => {
  selectedDate.value = date.toISOString().split('T')[0]
  showDatePicker.value = false
}

const isSelected = (date: Date | null) => {
  if (!date) return false
  const dateStr = date.toISOString().split('T')[0]
  return dateStr === selectedDate.value
}

const getItemStyle = (item: ScheduleItem) => {
  const [hours, minutes] = item.time.split(':').map(Number)
  const topPixels = (hours * 60 + minutes) // Each minute is 1px, each hour is 60px
  const heightPixels = Math.max(item.duration, 30) // Minimum height for readability
  
  return {
    top: `${topPixels}px`,
    height: `${heightPixels}px`,
    backgroundColor: item.color,
    left: '0.5rem',
    right: '0.5rem'
  }
}

const addScheduleItem = (itemData: { title: string; time: string; duration: number; color: string; icon: string }) => {
  const newItem: ScheduleItem = {
    id: `${Date.now()}-${Math.random()}`,
    ...itemData
  }
  items.value.push(newItem)
}

</script>

<template>
  <div class="schedule-container">
    <div class="date-header">
      <div class="date-display">
        <span class="date-text">
          {{ currentDateDisplay.dayName }}
          <span class="date-highlight">{{ currentDateDisplay.month }} {{ currentDateDisplay.day }}</span>
          {{ currentDateDisplay.year }}
        </span>
        <button class="date-picker-btn" @click="openDatePicker" aria-label="Select date">
          <CalendarIcon />
        </button>
      </div>
    </div>

    <div class="calendar-wrapper">
      <div class="time-labels">
        <div class="label-spacer"></div>
        <div v-for="(label, i) in hourLabels" :key="i" class="hour-label">
          {{ label }}
        </div>
      </div>

      <div class="grid-container">
        <div class="grid-slots">
          <div
            v-for="(slot, i) in timeSlots"
            :key="i"
            class="time-slot"
            :class="{ 'hour-start': slot.isHourStart }"
          />
        </div>

        <div class="items-container">
          <div
            v-for="item in items"
            :key="item.id"
            class="schedule-item"
            :style="getItemStyle(item)"
          >
            <strong>{{ item.title }}</strong>
            <small>{{ item.duration }}min</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Date Picker Modal -->
    <div v-if="showDatePicker" class="date-picker-backdrop" @click="closeDatePicker" />
    <div v-if="showDatePicker" class="date-picker-modal">
      <div class="date-picker-header">
        <button class="nav-btn" @click="previousMonth">
          <ChevronLeftIcon />
        </button>
        <h3 class="month-year">{{ pickerMonthYear }}</h3>
        <button class="nav-btn" @click="nextMonth">
          <ChevronRightIcon />
        </button>
      </div>
      
      <div class="calendar-grid">
        <div class="weekday-header">Sun</div>
        <div class="weekday-header">Mon</div>
        <div class="weekday-header">Tue</div>
        <div class="weekday-header">Wed</div>
        <div class="weekday-header">Thu</div>
        <div class="weekday-header">Fri</div>
        <div class="weekday-header">Sat</div>
        
        <button
          v-for="(day, i) in calendarDays"
          :key="i"
          :class="{
            'calendar-day': true,
            'empty': !day,
            'selected': isSelected(day),
            'other-month': false
          }"
          @click="day && selectDate(day)"
          :disabled="!day"
        >
          {{ day ? day.getDate() : '' }}
        </button>
      </div>

      <div class="date-picker-footer">
        <button class="cancel-btn" @click="closeDatePicker">Cancel</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.schedule-container {
  padding: 1rem;
  overflow-y: auto;
  height: calc(100vh - 180px);
  background: var(--bg-primary);
}

.date-header {
  padding: 0 0 1.5rem 0;
}

.date-display {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.date-text {
  font-family: 'Livvic', sans-serif;
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0;
}

.date-highlight {
  color: var(--accent-color);
  font-weight: 600;
}

.day-name {
  font-family: 'Livvic', sans-serif;
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0;
}

.date-value {
  font-family: 'Livvic', sans-serif;
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin: 0;
}

.date-picker-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-color);
  transition: color 0.2s ease, transform 0.2s ease;
}

.date-picker-btn:hover {
  color: var(--accent-hover);
  transform: scale(1.1);
}

.date-picker-btn :deep(svg) {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}

.date-picker-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 99;
}

.date-picker-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  z-index: 100;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  max-width: 320px;
  width: calc(100vw - 2rem);
}

.date-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.month-year {
  font-family: 'Livvic', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  flex: 1;
  text-align: center;
}

.nav-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-color);
  transition: color 0.2s ease, transform 0.2s ease;
}

.nav-btn:hover {
  color: var(--accent-hover);
  transform: scale(1.1);
}

.nav-btn :deep(svg) {
  width: 20px;
  height: 20px;
  stroke-width: 2;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.weekday-header {
  text-align: center;
  font-family: 'Livvic', sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  padding: 0.5rem 0;
}

.calendar-day {
  aspect-ratio: 1;
  border: none;
  border-radius: 6px;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-family: 'Livvic', sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.calendar-day:hover:not(:disabled) {
  background: var(--bg-tertiary);
  color: var(--accent-color);
}

.calendar-day.selected {
  background: var(--accent-color);
  color: #000;
  font-weight: 600;
}

.calendar-day.empty {
  background: transparent;
  cursor: default;
}

.calendar-day:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.date-picker-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.cancel-btn {
  padding: 0.6rem 1.2rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  border-radius: 6px;
  font-family: 'Livvic', sans-serif;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: var(--bg-tertiary);
  color: var(--accent-color);
}

.calendar-wrapper {
  display: flex;
  gap: 0.5rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.time-labels {
  display: flex;
  flex-direction: column;
  width: 50px;
  flex-shrink: 0;
  background: var(--bg-tertiary);
  border-right: 1px solid var(--border-color);
}

.label-spacer {
  height: 0;
  flex-shrink: 0;
}

.hour-label {
  height: 60px;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding-top: 0;
  padding-right: 0.25rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.grid-container {
  flex: 1;
  position: relative;
  overflow-x: hidden;
}

.grid-slots {
  display: flex;
  flex-direction: column;
}

.time-slot {
  height: 60px;
  border-bottom: 1px solid var(--border-color);
  position: relative;
}

.time-slot.hour-start {
  border-bottom: 1px solid var(--border-color);
}

.items-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.schedule-item {
  position: absolute;
  color: #000;
  padding: 0.5rem;
  border-radius: 6px;
  font-size: 0.8rem;
  overflow: hidden;
  word-break: break-word;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s ease;
}

.schedule-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.schedule-item strong {
  display: block;
  font-family: 'Livvic', sans-serif;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.schedule-item small {
  display: block;
  opacity: 0.8;
  font-size: 0.7rem;
}
</style>


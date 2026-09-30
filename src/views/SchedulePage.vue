<script setup lang="ts">
import { ref, computed, inject, type Component, type Ref } from 'vue'
import AddItemModal from '../components/AddItemModal.vue'
import {
  ClockIcon,
  CalendarIcon,
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

interface ScheduleItem {
  id: string
  date?: string
  time: string
  title: string
  duration: number
  category?: string
  frequency?: string
  icon?: string
  color?: string
}

const scheduleIcons: Record<string, Component> = {
  ClockIcon,
  CalendarIcon,
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
}

const getScheduleIcon = (name?: string) => scheduleIcons[name ?? 'ClockIcon'] ?? ClockIcon

type CalendarView = 'daily' | 'weekly' | 'monthly'

const scheduleItems = inject<Ref<ScheduleItem[]>>('scheduleItems', ref<ScheduleItem[]>([]))
const today = new Date()
const selectedDate = inject<Ref<string>>(
  'selectedDate',
  ref(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`)
)
const calendarView = ref<CalendarView>('daily')
const showEditModal = ref(false)
const selectedItem = ref<ScheduleItem | null>(null)
const calendarViews: Array<{ id: CalendarView; label: string }> = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' }
]

const parseDate = (value: string) => {
  const [year = 1970, month = 1, day = 1] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

const formatDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

const weekDays = computed(() => {
  const firstDay = parseDate(selectedDate.value)
  firstDay.setDate(firstDay.getDate() - firstDay.getDay())
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(firstDay)
    date.setDate(firstDay.getDate() + index)
    return date
  })
})

const monthDays = computed(() => {
  const selected = parseDate(selectedDate.value)
  const firstDay = new Date(selected.getFullYear(), selected.getMonth(), 1)
  const daysInMonth = new Date(selected.getFullYear(), selected.getMonth() + 1, 0).getDate()
  const days: Array<Date | null> = Array(firstDay.getDay()).fill(null)

  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(selected.getFullYear(), selected.getMonth(), day))
  }

  return days
})

const calendarPeriod = computed(() => {
  if (calendarView.value === 'weekly') {
    const firstDay = weekDays.value[0]
    const lastDay = weekDays.value[6]
    if (!firstDay || !lastDay) return ''
    return `${firstDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${lastDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  }

  const selected = parseDate(selectedDate.value)
  return selected.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

const isSelectedDate = (date: Date) => formatDate(date) === selectedDate.value

const selectCalendarDate = (date: Date) => {
  selectedDate.value = formatDate(date)
}

const itemsForDate = (date: Date) => scheduleItems.value.filter((item: ScheduleItem) => {
  if (item.date) return item.date === formatDate(date)
  const frequency = (item.frequency || 'daily').toLowerCase()
  if (frequency === 'weekly') {
    return date.getDay() === parseDate(selectedDate.value).getDay()
  }
  if (frequency === 'monthly') {
    return date.getDate() === parseDate(selectedDate.value).getDate()
  }
  return true
})

const items = computed(() => itemsForDate(parseDate(selectedDate.value)))

const formatTime = (time: string) => {
  const [hours = 0, minutes = 0] = time.split(':').map(Number)
  const period = hours < 12 ? 'AM' : 'PM'
  return `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${period}`
}

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

const getItemStyle = (item: ScheduleItem) => {
  const [hours = 0, minutes = 0] = item.time.split(':').map(Number)
  const topOffset = (hours * 60 + minutes)
  const height = item.duration
  
  return {
    top: `${topOffset}px`,
    height: `${height}px`,
    backgroundColor: item.color || 'var(--accent-surface)',
    left: '0.5rem',
    right: '0.5rem'
  }
}

const openEditModal = (item: ScheduleItem) => {
  selectedItem.value = JSON.parse(JSON.stringify(item))
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  selectedItem.value = null
}

const updateItem = (updatedItem: Pick<ScheduleItem, 'id' | 'title'> & Partial<ScheduleItem>) => {
  const index = scheduleItems.value.findIndex(item => item.id === updatedItem.id)
  const existingItem = scheduleItems.value[index]
  if (existingItem) scheduleItems.value[index] = { ...existingItem, ...updatedItem }
  closeEditModal()
}

const deleteItem = (itemId: string) => {
  const index = scheduleItems.value.findIndex(item => item.id === itemId)
  if (index !== -1) {
    scheduleItems.value.splice(index, 1)
  }
  closeEditModal()
}
</script>

<template>
  <div class="schedule-container">
    <header class="schedule-heading">
      <h1>Schedule</h1>
      <div class="calendar-view-switch" role="group" aria-label="Calendar view">
        <button
          v-for="view in calendarViews"
          :key="view.id"
          class="view-option"
          :class="{ active: calendarView === view.id }"
          :aria-pressed="calendarView === view.id"
          @click="calendarView = view.id"
        >
          {{ view.label }}
        </button>
      </div>
    </header>

    <div v-if="calendarView !== 'daily'" class="calendar-toolbar">
      <span class="calendar-period">{{ calendarPeriod }}</span>
    </div>

    <div v-if="calendarView === 'daily'" class="calendar-wrapper">
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
            :class="{ 'compact-event': item.duration < 45 }"
            :style="getItemStyle(item)"
            @click="openEditModal(item)"
            role="button"
            tabindex="0"
          >
            <span class="event-icon">
              <component :is="getScheduleIcon(item.icon)" />
            </span>
            <span class="event-copy">
              <strong>{{ item.title }}</strong>
              <small>{{ item.duration }}min</small>
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="calendarView === 'weekly'" class="week-grid">
      <section v-for="day in weekDays" :key="formatDate(day)" class="week-day">
        <button
          class="week-day-heading"
          :class="{ selected: isSelectedDate(day) }"
          @click="selectCalendarDate(day)"
        >
          <span>{{ day.toLocaleDateString('en-US', { weekday: 'short' }) }}</span>
          <strong>{{ day.getDate() }}</strong>
        </button>
        <div class="week-day-events">
          <button
            v-for="item in itemsForDate(day)"
            :key="item.id"
            class="week-event"
            :style="{ '--event-color': item.color || 'var(--accent-surface)' }"
            @click="openEditModal(item)"
          >
            <span class="week-event-icon">
              <component :is="getScheduleIcon(item.icon)" />
            </span>
            <time>{{ formatTime(item.time) }}</time>
            <span class="week-event-title">{{ item.title }}</span>
          </button>
          <span v-if="itemsForDate(day).length === 0" class="no-events">No items</span>
        </div>
      </section>
    </div>

    <div v-else class="month-grid">
      <div v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="day" class="month-weekday">
        {{ day }}
      </div>
      <div
        v-for="(day, index) in monthDays"
        :key="index"
        class="month-cell"
        :class="{ empty: !day, selected: day && isSelectedDate(day) }"
      >
        <button
          v-if="day"
          class="month-date"
          :class="{ selected: isSelectedDate(day) }"
          @click="selectCalendarDate(day)"
        >
          {{ day.getDate() }}
        </button>
        <div v-if="day" class="month-events">
          <button
            v-for="item in itemsForDate(day).slice(0, 3)"
            :key="item.id"
            class="month-event"
            :style="{ '--event-color': item.color || 'var(--accent-surface)' }"
            :title="`${formatTime(item.time)} ${item.title}`"
            @click="openEditModal(item)"
          >
            <span class="month-event-time">{{ formatTime(item.time) }}</span>
            <span class="month-event-title">{{ item.title }}</span>
            <span class="month-event-dot" aria-hidden="true" />
          </button>
          <span v-if="itemsForDate(day).length > 3" class="more-events">
            +{{ itemsForDate(day).length - 3 }} more
          </span>
        </div>
      </div>
    </div>

    <!-- Edit Event Modal -->
    <AddItemModal
      v-if="showEditModal && selectedItem"
      active-tab="Schedule"
      mode="edit"
      :item="selectedItem"
      @close="closeEditModal"
      @save-item="updateItem"
      @delete-item="deleteItem"
    />
  </div>
</template>

<style scoped>
.schedule-container {
  padding: 1rem;
  overflow-y: auto;
  height: calc(100vh - 180px);
  background: var(--bg-primary);
}

.schedule-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
  max-width: 960px;
  margin: 0 auto 1rem;
}

.schedule-heading h1 {
  margin: 0;
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: calc(1.2rem + 2pt);
  font-weight: 400;
}

.calendar-toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.calendar-toolbar,
.calendar-wrapper,
.week-grid,
.month-grid {
  width: 100%;
  max-width: 960px;
  margin-inline: auto;
}

.calendar-view-switch {
  display: inline-flex;
  gap: 0.2rem;
  padding: 0.125rem;
  border: 1px solid var(--border-color);
  border-radius: 9px;
  background: var(--bg-secondary);
}

.view-option {
  min-height: 30px;
  padding: 0.25rem 0.7rem;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-family: var(--font-ui);
  font-size: calc(0.85rem + 2pt);
  font-weight: 500;
  transition:
    background 0.2s ease,
    color 0.2s ease;
}

.view-option:hover {
  color: var(--text-primary);
}

.view-option.active {
  background: var(--selected-surface);
  color: #000;
}

.calendar-period {
  grid-column: 3;
  grid-row: 1;
  justify-self: end;
  color: var(--text-secondary);
  font-family: var(--font-body);
  font-size: calc(0.875rem + 2pt);
  text-align: right;
}

.week-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.6rem;
}

.week-day {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  overflow: hidden;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
}

.week-day-heading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  border: 0;
  border-right: 1px solid var(--border-color);
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  cursor: pointer;
  font-family: var(--font-body);
}

.week-day-heading strong {
  color: var(--text-primary);
  font-family: var(--font-ui);
  font-size: calc(1.1rem + 2pt);
  font-weight: 500;
}

.week-day-heading.selected,
.week-day-heading.selected strong {
  background: var(--selected-surface);
  color: #000;
}

.week-day-events {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 0;
  padding: 0.5rem;
}

.week-event {
  display: grid;
  grid-template-columns: 20px 66px minmax(0, 1fr);
  gap: 0.5rem;
  align-items: center;
  min-height: 36px;
  padding: 0.4rem 0.5rem;
  border: 0;
  border-left: 3px solid var(--event-color);
  border-radius: 4px;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  cursor: pointer;
  font-family: var(--font-body);
  font-size: calc(0.8rem + 2pt);
  text-align: left;
}

.week-event time {
  color: var(--text-secondary);
  font-family: var(--font-ui);
  font-size: calc(0.72rem + 2pt);
  white-space: nowrap;
}

.week-event-icon,
.month-event-icon {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 50%;
  background: var(--event-color);
  color: #051515;
}

.week-event-icon {
  width: 18px;
  height: 18px;
}

.week-event-icon :deep(svg) {
  width: 12px;
  height: 12px;
  stroke-width: 2;
}

.week-event span {
  overflow-wrap: anywhere;
}

.no-events {
  padding: 0.4rem 0.5rem;
  color: var(--text-secondary);
  font-family: var(--font-body);
  font-size: calc(0.75rem + 2pt);
  text-align: center;
}

.month-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 1px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--border-color);
}

.month-weekday {
  padding: 0.55rem 0.2rem;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  font-family: var(--font-ui);
  font-size: calc(0.72rem + 2pt);
  font-weight: 500;
  text-align: center;
}

.month-cell {
  min-width: 0;
  min-height: 84px;
  padding: 0.35rem;
  background: var(--bg-secondary);
}

.month-cell.empty {
  background: var(--bg-primary);
}

.month-date {
  display: grid;
  width: 26px;
  height: 26px;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--text-primary);
  cursor: pointer;
  font-family: var(--font-ui);
  font-size: calc(0.8rem + 2pt);
  font-weight: 500;
}

.month-date.selected {
  background: var(--selected-surface);
  color: #000;
}

.month-events {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  margin-top: 0.25rem;
}

.month-event {
  display: grid;
  grid-template-columns: 16px 48px minmax(0, 1fr);
  gap: 0.2rem;
  min-width: 0;
  padding: 0.2rem 0.25rem;
  overflow: hidden;
  border: 0;
  border-left: 2px solid var(--event-color);
  border-radius: 3px;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  cursor: pointer;
  font-size: calc(0.65rem + 2pt);
  text-align: left;
}

.month-event-icon {
  width: 14px;
  height: 14px;
}

.month-event-icon :deep(svg) {
  width: 10px;
  height: 10px;
  stroke-width: 2;
}

.month-event-time,
.month-event-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.month-event-time {
  color: var(--text-secondary);
  font-family: var(--font-ui);
}

.more-events {
  color: var(--text-secondary);
  font-size: calc(0.62rem + 2pt);
}

.date-header {
  position: sticky;
  top: 0;
  z-index: 2;
  padding: 0 0 1.5rem 0;
  background: var(--bg-primary);
}

.date-display {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.date-text {
  font-family: var(--font-body);
  font-size: calc(1rem + 2pt);
  font-weight: 500;
  color: var(--text-primary);
  margin: 0;
}

.date-highlight {
  color: var(--accent-color);
  font-weight: 600;
}

.day-name {
  font-family: var(--font-body);
  font-size: calc(1rem + 2pt);
  font-weight: 500;
  color: var(--text-primary);
  margin: 0;
}

.date-value {
  font-family: var(--font-body);
  font-size: calc(1rem + 2pt);
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
  transition:
    color 0.2s ease,
    transform 0.2s ease;
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
  font-family: var(--font-body);
  font-size: calc(1.1rem + 2pt);
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
  transition:
    color 0.2s ease,
    transform 0.2s ease;
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
  font-family: var(--font-body);
  font-size: calc(0.75rem + 2pt);
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
  font-family: var(--font-ui);
  font-size: calc(0.9rem + 2pt);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.calendar-day:hover:not(:disabled) {
  background: var(--bg-tertiary);
  color: var(--accent-color);
}

.calendar-day.selected {
  background: var(--selected-surface);
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
  font-size: calc(0.75rem + 2pt);
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
  font-size: calc(0.8rem + 2pt);
  overflow: hidden;
  word-break: break-word;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  min-height: 2rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  justify-content: flex-start;
  transition: all 0.2s ease;
  cursor: pointer;
  user-select: none;
}

.schedule-item.compact-event {
  align-items: center;
  padding-top: 0.125rem;
  padding-bottom: 0.125rem;
}

.schedule-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transform: translateY(-2px) scale(1.02);
  filter: brightness(1.1);
}

.schedule-item:focus {
  outline: 2px solid rgba(255, 255, 255, 0.5);
  outline-offset: 2px;
}

.schedule-item strong {
  display: block;
  min-width: 0;
  flex: 1 1 auto;
  font-family: var(--font-body);
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-icon {
  display: grid;
  flex: 0 0 24px;
  width: 24px;
  height: 24px;
  place-items: center;
  border-radius: 50%;
  background: #fff;
  color: #051515;
}

.compact-event .event-icon {
  flex-basis: 20px;
  width: 20px;
  height: 20px;
}

.compact-event .event-icon :deep(svg) {
  width: 14px;
  height: 14px;
}

.event-icon :deep(svg) {
  width: 16px;
  height: 16px;
  stroke-width: 2;
}

.event-copy {
  display: flex;
  align-items: center;
  min-width: 0;
  flex: 1;
  flex-direction: row;
  gap: 0.35rem;
  overflow: hidden;
}

.schedule-item small {
  display: block;
  flex: 0 0 auto;
  white-space: nowrap;
  opacity: 0.8;
  font-size: calc(0.7rem + 2pt);
}

@media (min-width: 481px) {
  .schedule-container {
    height: 100%;
    padding: 1.5rem;
  }

  .time-labels {
    width: 58px;
  }
}

@media (min-width: 768px) {
  .schedule-container {
    padding: 2rem;
  }

  .time-labels {
    width: 66px;
  }

  .hour-label {
    padding-right: 0.5rem;
    font-size: calc(0.8rem + 2pt);
  }

  .schedule-item {
    padding: 0.75rem;
    font-size: calc(0.9rem + 2pt);
  }

  .schedule-item strong {
    font-size: calc(0.95rem + 2pt);
  }

  .week-grid {
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 0.45rem;
  }

  .week-day {
    display: flex;
    flex-direction: column;
    min-height: 260px;
  }

  .week-day-heading {
    min-height: 64px;
    border-right: 0;
    border-bottom: 1px solid var(--border-color);
  }

  .week-day-events {
    padding: 0.4rem;
  }

  .week-event {
    grid-template-columns: 18px minmax(0, 1fr);
    gap: 0.2rem;
    padding: 0.4rem;
    font-size: calc(0.72rem + 2pt);
  }

  .week-event-icon {
    grid-column: 1;
    grid-row: 1 / span 2;
  }

  .week-event time,
  .week-event-title {
    grid-column: 2;
  }

  .month-cell {
    min-height: 112px;
    padding: 0.45rem;
  }
}

@media (max-width: 480px) {
  .calendar-toolbar {
    justify-content: flex-end;
  }

  .calendar-period {
    text-align: right;
  }

  .month-cell {
    min-height: 60px;
    padding: 0.2rem;
  }

  .month-date {
    width: 22px;
    height: 22px;
  }

  .month-event {
    display: block;
    width: 7px;
    height: 7px;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: var(--event-color);
    font-size: 0;
  }

  .month-event-time,
  .month-event-title,
  .month-event-icon,
  .more-events {
    display: none;
  }

  .month-events {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.2rem;
  }
}
</style>


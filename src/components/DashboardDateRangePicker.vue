<script setup lang="ts">
import { computed, ref } from 'vue'
import { CalendarDaysIcon, ChevronDownIcon } from '@heroicons/vue/24/outline'
import { VDatePicker } from 'vuetify/components'

const props = defineProps<{
  startDate: string
  endDate: string
}>()

const emit = defineEmits<{
  'update:startDate': [value: string]
  'update:endDate': [value: string]
}>()

const showPicker = ref(false)
const draftDates = ref<Date[]>([])

const parseDate = (value: string) => {
  const [year = 1970, month = 1, day = 1] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

const toDateEnd = (value: string) => {
  const date = parseDate(value)
  date.setHours(23, 59, 59, 999)
  return date
}

const toDateString = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

const formatDate = (value: string, options: Intl.DateTimeFormatOptions) =>
  new Date(`${value}T12:00:00`).toLocaleDateString('en-US', options)

const rangeLabel = computed(() => {
  const start = formatDate(props.startDate, { month: 'short', day: 'numeric' })
  const end = formatDate(props.endDate, { month: 'short', day: 'numeric', year: 'numeric' })
  return `${start} - ${end}`
})

const openPicker = () => {
  draftDates.value = [parseDate(props.startDate), toDateEnd(props.endDate)]
  showPicker.value = true
}

const applyRange = () => {
  const [startDate, endDate] = draftDates.value
  if (!startDate || !endDate) return
  emit('update:startDate', toDateString(startDate))
  emit('update:endDate', toDateString(endDate))
  showPicker.value = false
}
</script>

<template>
  <header class="date-header">
    <div class="date-display">
      <div class="range-anchor">
        <button
          class="range-trigger"
          aria-label="Choose dashboard date range"
          :aria-expanded="showPicker"
          @click="openPicker"
        >
          <CalendarDaysIcon class="range-calendar-icon" />
          <span>{{ rangeLabel }}</span>
          <ChevronDownIcon class="range-chevron-icon" />
        </button>

        <div v-if="showPicker" class="range-popover">
          <VDatePicker
            v-model="draftDates"
            class="range-calendar"
            multiple="range"
            min="2026-03-01"
            max="2026-07-31"
            color="#e9d985"
            theme="dark"
            hide-header
            show-adjacent-months
          />
          <div class="range-actions">
            <button class="cancel-range" @click="showPicker = false">Cancel</button>
            <button class="apply-range" :disabled="draftDates.length !== 2" @click="applyRange">Apply</button>
          </div>
        </div>
      </div>
    </div>
  </header>

  <div v-if="showPicker" class="range-backdrop" @click="showPicker = false" />
</template>

<style scoped>
.date-header {
  position: relative;
  z-index: 100;
  flex: 0 0 auto;
  padding: 1rem;
  background: var(--bg-primary);
}

.date-display {
  display: flex;
  align-items: center;
  justify-content: center;
}

.range-anchor {
  position: static;
}

.range-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 36px;
  padding: 0.25rem 0.5rem;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--text-primary);
  cursor: pointer;
  font-family: var(--font-ui);
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: 0.02em;
}

.range-trigger:hover {
  background: var(--bg-secondary);
}

.range-calendar-icon {
  width: 18px;
  height: 18px;
  color: var(--accent-color);
}

.range-chevron-icon {
  width: 16px;
  height: 16px;
  color: var(--accent-color);
}

.range-backdrop {
  position: fixed;
  inset: 0;
  z-index: 99;
  background: rgba(0, 0, 0, 0.3);
}

.range-popover {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: auto;
  left: 50%;
  z-index: 1;
  display: grid;
  width: min(380px, calc(100vw - 1rem));
  gap: 0.25rem;
  padding: 0.5rem;
  transform: translateX(-50%);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.3);
}

.range-calendar {
  width: 100%;
}

.range-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding-top: 0.25rem;
}

.cancel-range,
.apply-range {
  min-height: 34px;
  padding: 0.4rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  font-family: var(--font-ui);
  font-size: 0.85rem;
  font-weight: 500;
}

.cancel-range {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.apply-range {
  border-color: var(--accent-color);
  background: var(--accent-surface);
  color: #000;
}

.apply-range:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

@media (min-width: 768px) {
  .date-header {
    padding: 1.25rem 2rem;
    border-bottom: 1px solid var(--border-color);
  }
}
</style>
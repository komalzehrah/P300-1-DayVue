<script setup lang="ts">
import { computed, inject, ref, type Ref } from 'vue'
import { CheckIcon, PencilSquareIcon } from '@heroicons/vue/24/outline'
import AddItemModal from '../components/AddItemModal.vue'
import type { DatedHabit } from '../data/fakeEntries'

interface HabitDay {
  date: string
  day: number
}

interface HabitUpdate {
  id: string
  title: string
  startDate?: string
  endDate?: string
  frequency?: string
  frequencyCount?: number
  frequencyUnit?: 'day' | 'week' | 'month'
  loggedDates?: string[]
}

const habits = inject<Ref<DatedHabit[]>>('habits', ref<DatedHabit[]>([]))
const today = new Date()
const selectedDate = inject<Ref<string>>(
  'selectedDate',
  ref(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`)
)
const editedHabit = ref<DatedHabit | null>(null)
const showPreviousHabits = ref(false)

const parseDate = (value: string) => {
  const [year = 1970, month = 1, day = 1] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

const formatDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

const monthData = computed(() => {
  const selected = parseDate(selectedDate.value)
  const year = selected.getFullYear()
  const month = selected.getMonth()
  const firstDay = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days: Array<HabitDay | null> = Array(firstDay.getDay()).fill(null)

  for (let day = 1; day <= daysInMonth; day++) {
    days.push({ date: formatDate(new Date(year, month, day)), day })
  }

  return {
    startDate: formatDate(firstDay),
    label: selected.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    endDate: formatDate(new Date(year, month, daysInMonth)),
    days
  }
})

const visibleHabits = computed(() => habits.value
  .filter(habit => habit.startDate <= selectedDate.value
    && (!habit.endDate || selectedDate.value <= habit.endDate))
  .slice()
  .sort((first, second) => first.title.localeCompare(second.title)))

const previousHabits = computed(() => habits.value
  .filter(habit => Boolean(habit.endDate && habit.endDate < selectedDate.value))
  .slice()
  .sort((first, second) => (second.endDate ?? '').localeCompare(first.endDate ?? '')))

const formatHistoryDate = (value: string) =>
  parseDate(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

const habitHistoryByMonth = (habit: DatedHabit) => {
  const counts = new Map<string, number>()
  for (const date of habit.loggedDates) {
    if (date < habit.startDate || (habit.endDate && date > habit.endDate)) continue
    const month = date.slice(0, 7)
    counts.set(month, (counts.get(month) ?? 0) + 1)
  }

  return [...counts.entries()]
    .sort(([first], [second]) => first.localeCompare(second))
    .map(([month, count]) => ({
      label: new Date(`${month}-01T12:00:00`).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      count
    }))
}

const isLogged = (habit: DatedHabit, date: string) => habit.loggedDates.includes(date)
const canLog = (habit: DatedHabit, date: string) =>
  date >= habit.startDate && (!habit.endDate || date <= habit.endDate)

const habitConsistency = (habit: DatedHabit, selectedThrough = selectedDate.value) => {
  const endDate = habit.endDate && habit.endDate < selectedThrough ? habit.endDate : selectedThrough
  if (endDate < habit.startDate) return 0

  const start = parseDate(habit.startDate)
  const end = parseDate(endDate)
  const activeDays = Math.floor((Date.UTC(end.getFullYear(), end.getMonth(), end.getDate())
    - Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())) / 86_400_000) + 1
  const frequencyCount = Math.max(1, habit.frequencyCount || 1)
  let target = activeDays * frequencyCount

  if (habit.frequencyUnit === 'week') {
    target = Math.ceil(activeDays / 7) * frequencyCount
  } else if (habit.frequencyUnit === 'month') {
    const activeMonths = (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth() + 1
    target = activeMonths * frequencyCount
  }

  const completed = habit.loggedDates.filter(date => date >= habit.startDate && date <= endDate).length
  return Math.min(100, Math.round((completed / target) * 100))
}

const toggleSelectedDay = (habit: DatedHabit) => {
  const date = selectedDate.value
  if (!canLog(habit, date)) return
  if (isLogged(habit, date)) {
    habit.loggedDates = habit.loggedDates.filter(loggedDate => loggedDate !== date)
  } else {
    habit.loggedDates = [...habit.loggedDates, date].sort()
  }
}

const openEditor = (habit: DatedHabit) => {
  editedHabit.value = { ...habit, loggedDates: [...habit.loggedDates] }
}

const closeEditor = () => {
  editedHabit.value = null
}

const saveHabit = (updatedHabit: HabitUpdate) => {
  const index = habits.value.findIndex(habit => habit.id === updatedHabit.id)
  const existingHabit = habits.value[index]
  if (existingHabit) {
    habits.value[index] = {
      ...existingHabit,
      title: updatedHabit.title,
      startDate: updatedHabit.startDate ?? existingHabit.startDate,
      endDate: updatedHabit.endDate,
      frequency: updatedHabit.frequency ?? existingHabit.frequency,
      frequencyCount: updatedHabit.frequencyCount ?? existingHabit.frequencyCount,
      frequencyUnit: updatedHabit.frequencyUnit ?? existingHabit.frequencyUnit,
      loggedDates: existingHabit.loggedDates
    }
  }
  closeEditor()
}

const deleteHabit = (habitId: string) => {
  const index = habits.value.findIndex(habit => habit.id === habitId)
  if (index !== -1) habits.value.splice(index, 1)
  closeEditor()
}
</script>

<template>
  <div class="habits-container">
    <header class="habits-heading">
      <h1>Habit Tracker</h1>
      <span>{{ monthData.label }}</span>
    </header>

    <div v-if="visibleHabits.length === 0" class="empty-state">
      <p>No habits yet. Add one to get started!</p>
    </div>
    <div v-else class="habits-list">
      <article v-for="habit in visibleHabits" :key="habit.id" class="habit-card">
        <button
          class="habit-stamp"
          :class="{ logged: isLogged(habit, selectedDate) }"
          :disabled="!canLog(habit, selectedDate)"
          :aria-label="isLogged(habit, selectedDate) ? `Unlog ${habit.title} for selected day` : `Log ${habit.title} for selected day`"
          @click="toggleSelectedDay(habit)"
        >
          <CheckIcon v-if="isLogged(habit, selectedDate)" />
        </button>
        <div class="habit-card-content">
          <header class="habit-card-heading">
            <div class="habit-title-group">
              <h2>{{ habit.title }}</h2>
              <span class="consistency-chip">{{ habitConsistency(habit) }}% consistent</span>
            </div>
            <button class="edit-habit" :aria-label="`Edit ${habit.title}`" title="Edit habit" @click="openEditor(habit)">
              <PencilSquareIcon />
            </button>
          </header>
          <div class="habit-days" :aria-label="`${monthData.label} log for ${habit.title}`">
            <template v-for="(day, index) in monthData.days" :key="day?.date ?? `empty-${index}`">
              <span v-if="!day" class="habit-day-placeholder" />
              <span
                v-else
                class="habit-day"
                :class="{ logged: isLogged(habit, day.date), unavailable: !canLog(habit, day.date) }"
                role="img"
                :aria-label="`${habit.title}, ${day.date}${isLogged(habit, day.date) ? ', logged' : ', not logged'}`"
                :title="day.date"
              >
                <span>{{ day.day }}</span>
                <span class="habit-day-circle">
                  <CheckIcon v-if="isLogged(habit, day.date)" />
                </span>
              </span>
            </template>
          </div>
        </div>
      </article>
    </div>

    <section class="previous-habits-section" aria-label="Previous Habits">
      <button
        class="previous-habits-toggle"
        :aria-expanded="showPreviousHabits"
        @click="showPreviousHabits = !showPreviousHabits"
      >
        {{ showPreviousHabits ? 'Hide Previous Habits' : 'View Previous Habits' }}
      </button>

      <div v-if="showPreviousHabits" class="previous-habits-content">
        <h2>Previous Habits</h2>
        <p v-if="previousHabits.length === 0" class="no-previous-habits">
          No previous habits for this date.
        </p>
        <div v-else class="previous-habits-list">
          <article v-for="habit in previousHabits" :key="habit.id" class="previous-habit-card">
            <div class="previous-habit-heading">
              <h3>{{ habit.title }}</h3>
              <div class="previous-habit-meta">
                <span>{{ habit.frequency }}</span>
                <span class="consistency-chip">{{ habitConsistency(habit, habit.endDate ?? selectedDate) }}% consistent</span>
              </div>
            </div>
            <p class="previous-habit-dates">
              {{ formatHistoryDate(habit.startDate) }} - {{ formatHistoryDate(habit.endDate ?? habit.startDate) }}
            </p>
            <div v-if="habitHistoryByMonth(habit).length" class="previous-habit-months">
              <span v-for="month in habitHistoryByMonth(habit)" :key="month.label">
                {{ month.label }} <strong>{{ month.count }} logged</strong>
              </span>
            </div>
            <p v-else class="no-previous-habits">No days were logged.</p>
          </article>
        </div>
      </div>
    </section>

    <AddItemModal
      v-if="editedHabit"
      active-tab="Habits"
      mode="edit"
      :item="editedHabit"
      :default-date="selectedDate"
      @close="closeEditor"
      @save-item="saveHabit"
      @delete-item="deleteHabit"
    />
  </div>
</template>

<style scoped>
.habits-container {
  display: flex;
  height: 100%;
  min-height: 0;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
  padding: 1rem;
}

.habits-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
}

.habits-heading h1 {
  margin: 0;
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: 1.2rem;
  font-weight: 400;
}

.habits-heading > span {
  color: var(--text-secondary);
  font-family: var(--font-ui);
  font-size: 0.8rem;
}

.habits-list {
  display: flex;
  width: 100%;
  max-width: 960px;
  flex-direction: column;
  gap: 0.75rem;
  margin: 0 auto;
}

.empty-state {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--text-secondary);
  padding: 2rem 1rem;
}

.habit-card {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  min-width: 0;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--bg-secondary);
  transition: background 0.2s ease, border-color 0.2s ease;
}

.habit-card:hover {
  background: var(--bg-tertiary);
}

.habit-stamp {
  display: grid;
  flex: 0 0 24px;
  width: 24px;
  height: 24px;
  place-items: center;
  margin-top: 0.15rem;
  border: 2px solid var(--text-secondary);
  border-radius: 50%;
  background: transparent;
  color: #051515;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.habit-stamp.logged {
  border-color: var(--accent-color);
  background: var(--accent-surface);
}

.habit-stamp:disabled {
  cursor: not-allowed;
  opacity: 0.35;
}

.habit-stamp :deep(svg) {
  width: 16px;
  height: 16px;
  stroke-width: 2.5;
}

.habit-card-content {
  min-width: 0;
  flex: 1;
}

.habit-card-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.habit-card-heading h2 {
  margin: 0;
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 400;
  overflow-wrap: anywhere;
}

.habit-title-group {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.consistency-chip {
  display: inline-flex;
  align-items: center;
  min-height: 23px;
  padding: 0.2rem 0.55rem;
  border: 1px solid var(--border-color);
  border-radius: 999px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  font-family: var(--font-ui);
  font-size: 0.66rem;
  font-weight: 500;
  white-space: nowrap;
}

.edit-habit {
  display: grid;
  flex: 0 0 34px;
  width: 34px;
  height: 34px;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
}

.edit-habit:hover {
  background: var(--bg-primary);
  color: var(--accent-color);
}

.edit-habit :deep(svg) {
  width: 19px;
  height: 19px;
}

.habit-days {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 32px));
  justify-content: start;
  gap: 0.35rem;
  margin-top: 0.5rem;
}

.habit-day-placeholder,
.habit-day {
  width: 32px;
  min-height: 38px;
}

.habit-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  font-family: var(--font-ui);
  font-size: 0.58rem;
}

.habit-day.unavailable {
  opacity: 0.35;
}

.habit-day-circle {
  display: grid;
  width: 16px;
  height: 16px;
  place-items: center;
  border: 1px solid var(--border-color);
  border-radius: 50%;
  background: transparent;
}

.habit-day.logged .habit-day-circle {
  border-color: var(--accent-color);
  background: var(--accent-surface);
  color: #051515;
}

.habit-day-circle :deep(svg) {
  width: 10px;
  height: 10px;
  stroke-width: 2.5;
}

.previous-habits-toggle {
  display: block;
  margin: 0 auto;
  padding: 0.35rem 0.5rem;
  border: 0;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-family: var(--font-ui);
  font-size: 0.8rem;
  font-weight: 500;
}

.previous-habits-toggle:hover {
  color: var(--accent-color);
  text-decoration: underline;
}

.previous-habits-section {
  width: 100%;
  max-width: 960px;
  margin: 0 auto 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-color);
}

.previous-habits-content > h2 {
  margin: 0 0 0.75rem;
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 400;
}

.previous-habits-list {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.previous-habit-card {
  padding: 0.85rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--bg-secondary);
}

.previous-habit-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
}

.previous-habit-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 0.45rem;
}

.previous-habit-heading h3 {
  margin: 0;
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 400;
}

.previous-habit-meta > span:first-child,
.previous-habit-dates,
.previous-habit-months,
.no-previous-habits {
  color: var(--text-secondary);
  font-family: var(--font-body);
  font-size: 0.75rem;
}

.previous-habit-dates {
  margin: 0.35rem 0;
}

.previous-habit-months {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 0.85rem;
}

.previous-habit-months span {
  display: flex;
  gap: 0.3rem;
}

.previous-habit-months strong {
  color: var(--text-primary);
  font-weight: 500;
}

.no-previous-habits {
  margin: 0;
}

@media (min-width: 481px) {
  .habits-container {
    padding: 1.5rem;
  }
}

@media (min-width: 768px) {
  .habits-container {
    padding: 2rem;
  }
}

@media (max-width: 360px) {
  .habit-card {
    gap: 0.5rem;
    padding: 0.75rem;
  }

  .habit-days {
    grid-template-columns: repeat(7, minmax(0, 28px));
    gap: 0.25rem;
  }

  .habit-day-placeholder,
  .habit-day {
    width: 28px;
  }
}
</style>

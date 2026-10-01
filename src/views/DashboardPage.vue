<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref, type Reactive, type Ref } from 'vue'
import { Bar, Line } from 'vue-chartjs'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  type ChartData,
  type ChartOptions
} from 'chart.js'
import metrics from '@/data/metrics.json'
import type { DatedHabit, DatedScheduleItem, DatedTask } from '@/data/fakeEntries'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler, Tooltip, Legend)
ChartJS.defaults.font.family = 'Outfit, sans-serif'
ChartJS.defaults.font.size = 14.67

const isLightMode = ref(false)
let themeObserver: MutationObserver | undefined

onMounted(() => {
  const updateTheme = () => {
    isLightMode.value = document.body.classList.contains('light-mode')
  }
  updateTheme()
  themeObserver = new MutationObserver(updateTheme)
  themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] })
})

onBeforeUnmount(() => themeObserver?.disconnect())

type HabitKey = 'gym' | 'meditation' | 'bedtimeBefore11pm' | 'sketchFor5Minutes'

interface TaskMetric {
  repeat: 'daily' | 'once'
  completionRate?: number
  status?: string
  dueDate?: string
}

interface ScheduleEvent {
  date?: string
  startTime: string
  durationMinutes: number
  title: string
  category: string
  daysOfWeek?: string[]
}

interface MonthMetric {
  month: string
  daysInMonth: number
  tasks: TaskMetric[]
  schedule: { recurringEvents: ScheduleEvent[]; events: ScheduleEvent[] }
  habits: Record<HabitKey, { completedDays: number[] }>
}

type ChartView = 'weekly' | 'monthly'

interface ChartBucket {
  key: string
  label: string
  dates: string[]
}

const months = metrics.months as MonthMetric[]
const chartViews: Array<{ value: ChartView; label: string }> = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' }
]
const habitView = ref<ChartView>('monthly')
const taskView = ref<ChartView>('monthly')
const scheduleView = ref<ChartView>('monthly')
const monthByKey = new Map(months.map(month => [month.month, month]))
interface DashboardDateRange {
  startDate: string
  endDate: string
}

const dateRange = inject<Reactive<DashboardDateRange>>('dashboardDateRange', {
  startDate: '2026-03-01',
  endDate: '2026-07-31'
})
const scheduleItems = inject<Ref<DatedScheduleItem[]>>('scheduleItems', ref([]))
const tasks = inject<Ref<DatedTask[]>>('tasks', ref([]))
const habits = inject<Ref<DatedHabit[]>>('habits', ref([]))
const habitSeries: Array<{ key: HabitKey; label: string }> = [
  { key: 'gym', label: 'Gym' },
  { key: 'meditation', label: 'Meditation' },
  { key: 'bedtimeBefore11pm', label: 'Bed Before 11' },
  { key: 'sketchFor5Minutes', label: 'Sketch' }
]
const chartColors = computed(() => isLightMode.value
  ? { gym: '#20a9ae', meditation: '#d14b00', bedtimeBefore11pm: '#64c900', sketchFor5Minutes: '#ba36d2', tasks: '#4c14bc' }
  : { gym: '#64e2c0', meditation: '#ff8f4b', bedtimeBefore11pm: '#cdff8f', sketchFor5Minutes: '#c866db', tasks: '#3176ee' }
)
const categoryColors = computed(() => isLightMode.value
  ? { work: '#4c14bc', health: '#64c900', family: '#d14b00', social: '#20a9ae', personal: '#ba36d2', home: '#20a9ae', other: '#4c14bc' }
  : { work: '#3176ee', health: '#cdff8f', family: '#ff8f4b', social: '#64e2c0', personal: '#c866db', home: '#64e2c0', other: '#3176ee' }
)
const chartTextColor = computed(() => isLightMode.value ? '#35413f' : '#9db3b1')
const chartGridColor = computed(() => isLightMode.value ? 'rgba(38, 83, 76, 0.16)' : 'rgba(157, 179, 177, 0.12)')
const titleCase = (value: string) => value.replace(/\b\w/g, character => character.toUpperCase())
const parseDate = (value: string) => {
  const [year = 1970, month = 1, day = 1] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

const dateString = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

const createBuckets = (view: ChartView): ChartBucket[] => {
  const start = parseDate(dateRange.startDate)
  const end = parseDate(dateRange.endDate)
  const grouped = new Map<string, string[]>()

  for (const date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const currentDate = dateString(date)
    const keyDate = new Date(date)
    if (view === 'weekly') keyDate.setDate(keyDate.getDate() - ((keyDate.getDay() + 6) % 7))
    const key = view === 'monthly' ? currentDate.slice(0, 7) : dateString(keyDate)
    const dates = grouped.get(key) ?? []
    dates.push(currentDate)
    grouped.set(key, dates)
  }

  return [...grouped].map(([key, dates]) => {
    const first = parseDate(dates[0] ?? key)
    const last = parseDate(dates[dates.length - 1] ?? key)
    let label = first.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    if (view === 'weekly' && dates.length > 1) {
      const sameMonth = first.getMonth() === last.getMonth()
      const endLabel = last.toLocaleDateString('en-US', sameMonth ? { day: 'numeric' } : { month: 'short', day: 'numeric' })
      label = `${label}-${endLabel}`
    } else if (view === 'monthly') {
      label = first.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    }
    return { key, label, dates }
  })
}

const habitBuckets = computed(() => createBuckets(habitView.value))
const taskBuckets = computed(() => createBuckets(taskView.value))
const scheduleBuckets = computed(() => createBuckets(scheduleView.value))

const monthWindow = (month: MonthMetric) => {
  const [year = 1970, monthNumber = 1] = month.month.split('-').map(Number)
  const monthStart = new Date(year, monthNumber - 1, 1)
  const monthEnd = new Date(year, monthNumber, 0)
  const rangeStart = parseDate(dateRange.startDate)
  const rangeEnd = parseDate(dateRange.endDate)
  const start = rangeStart > monthStart ? rangeStart : monthStart
  const end = rangeEnd < monthEnd ? rangeEnd : monthEnd

  if (start > end) return null

  return {
    startDay: start.getDate(),
    endDay: end.getDate(),
    dayCount: Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1
  }
}

const selectedMonths = computed(() => months.filter(month => monthWindow(month)))

const habitRate = (month: MonthMetric, habit: HabitKey) => {
  const window = monthWindow(month)
  if (!window) return 0
  const completed = month.habits[habit].completedDays.filter(day => day >= window.startDay && day <= window.endDay).length
  const target = habit === 'gym' ? Math.ceil(window.dayCount / 7) * 3 : window.dayCount
  return Math.min(100, Math.round((completed / target) * 100))
}

const taskRate = (month: MonthMetric) => {
  const window = monthWindow(month)
  if (!window) return 0
  const totals = month.tasks.reduce((result, task) => {
    if (task.repeat === 'daily') {
      result.total += window.dayCount
      result.completed += window.dayCount * (task.completionRate ?? 0)
    } else {
      if (!task.dueDate || task.dueDate < dateRange.startDate || task.dueDate > dateRange.endDate) return result
      result.total += 1
      if (task.status === 'completed') result.completed += 1
    }
    return result
  }, { total: 0, completed: 0 })

  return Math.round((totals.completed / totals.total) * 100)
}

const taskFollowThrough = computed(() => {
  const rates = selectedMonths.value.map(taskRate)
  return rates.length ? Math.round(rates.reduce((sum, rate) => sum + rate, 0) / rates.length) : 0
})
const habitConsistency = computed(() => {
  const rates = selectedMonths.value.flatMap(month => habitSeries.map(habit => habitRate(month, habit.key)))
  return rates.length ? Math.round(rates.reduce((sum, rate) => sum + rate, 0) / rates.length) : 0
})
const eventsInRange = computed(() => months.flatMap(month => month.schedule.events)
  .filter(event => event.date && event.date >= dateRange.startDate && event.date <= dateRange.endDate))
const eventCount = computed(() => eventsInRange.value.length)
const dateRangeLabel = computed(() => {
  const start = parseDate(dateRange.startDate)
  const end = parseDate(dateRange.endDate)
  const startLabel = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const endLabel = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return `${startLabel} - ${endLabel}`
})

const patternInsights = computed(() => {
  const activityByDate = new Map<string, { events: number; tasks: number }>()
  const getActivity = (date: string) => {
    const activity = activityByDate.get(date) ?? { events: 0, tasks: 0 }
    activityByDate.set(date, activity)
    return activity
  }

  for (const item of scheduleItems.value) {
    if (item.date < dateRange.startDate || item.date > dateRange.endDate) continue
    getActivity(item.date).events += 1
  }

  for (const task of tasks.value) {
    if (task.date < dateRange.startDate || task.date > dateRange.endDate) continue
    getActivity(task.date).tasks += 1
  }

  const busiestDate = [...activityByDate.entries()]
    .sort(([firstDate, first], [secondDate, second]) =>
      second.events + second.tasks - first.events - first.tasks || firstDate.localeCompare(secondDate)
    )[0]

  let longestStreak = { days: 0, habit: '' }
  let mostConsistent = { rate: -1, habit: '' }

  for (const habit of habits.value) {
    const activeStart = habit.startDate > dateRange.startDate ? habit.startDate : dateRange.startDate
    const activeEnd = habit.endDate && habit.endDate < dateRange.endDate ? habit.endDate : dateRange.endDate
    if (activeStart > activeEnd) continue

    const loggedDates = [...new Set(habit.loggedDates.filter(date => date >= activeStart && date <= activeEnd))].sort()
    let currentStreak = 0
    let previousDate = ''

    for (const date of loggedDates) {
      const previousDay = previousDate ? parseDate(previousDate) : null
      if (previousDay) previousDay.setDate(previousDay.getDate() + 1)
      currentStreak = previousDay && dateString(previousDay) === date ? currentStreak + 1 : 1
      if (currentStreak > longestStreak.days) longestStreak = { days: currentStreak, habit: habit.title }
      previousDate = date
    }

    const activeStartDate = parseDate(activeStart)
    const activeEndDate = parseDate(activeEnd)
    const activeDays = Math.floor((Date.UTC(activeEndDate.getFullYear(), activeEndDate.getMonth(), activeEndDate.getDate())
      - Date.UTC(activeStartDate.getFullYear(), activeStartDate.getMonth(), activeStartDate.getDate())) / 86_400_000) + 1
    const frequencyCount = Math.max(1, habit.frequencyCount || 1)
    let target = activeDays * frequencyCount

    if (habit.frequencyUnit === 'week') {
      const activeWeeks = new Set<string>()
      for (const date = parseDate(activeStart); date <= parseDate(activeEnd); date.setDate(date.getDate() + 1)) {
        const weekStart = new Date(date)
        weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7))
        activeWeeks.add(dateString(weekStart))
      }
      target = activeWeeks.size * frequencyCount
    } else if (habit.frequencyUnit === 'month') {
      const activeMonths = new Set<string>()
      for (const date = parseDate(activeStart); date <= parseDate(activeEnd); date.setDate(date.getDate() + 1)) {
        activeMonths.add(dateString(date).slice(0, 7))
      }
      target = activeMonths.size * frequencyCount
    }

    const rate = target ? Math.min(100, Math.round((loggedDates.length / target) * 100)) : 0
    if (rate > mostConsistent.rate) mostConsistent = { rate, habit: habit.title }
  }

  const busiestDateLabel = busiestDate
    ? new Date(`${busiestDate[0]}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    : 'No activity'

  return {
    items: [
      {
        label: 'Busiest day',
        value: busiestDateLabel,
        detail: busiestDate
          ? `${busiestDate[1].events} calendar events · ${busiestDate[1].tasks} tasks`
          : 'No events or tasks in this range'
      },
      {
        label: 'Longest habit streak',
        value: longestStreak.days ? `${longestStreak.days} ${longestStreak.days === 1 ? 'day' : 'days'}` : 'No streak yet',
        detail: longestStreak.habit || 'No habit logs in this range'
      },
      {
        label: 'Most consistent habit',
        value: mostConsistent.habit ? `${mostConsistent.rate}%` : 'No active habits',
        detail: mostConsistent.habit || 'No habits overlap this range'
      }
    ],
    tips: [
      'Pair a few minutes of sketching after a gym session to connect a less consistent habit to a routine you already keep.',
      'On busy days, pick one high-priority task and spend 10 minutes on its first step to build momentum.'
    ]
  }
})

const habitRateForBucket = (bucket: ChartBucket, habit: HabitKey) => {
  const completed = bucket.dates.reduce((count, date) => {
    const month = monthByKey.get(date.slice(0, 7))
    const day = Number(date.slice(-2))
    return count + (month?.habits[habit].completedDays.includes(day) ? 1 : 0)
  }, 0)
  const target = habit === 'gym' ? bucket.dates.length * 3 / 7 : bucket.dates.length
  return target ? Math.min(100, Math.round((completed / target) * 100)) : 0
}

const taskRateForBucket = (bucket: ChartBucket) => {
  const totals = bucket.dates.reduce((result, date) => {
    const month = monthByKey.get(date.slice(0, 7))
    if (!month) return result
    for (const task of month.tasks) {
      if (task.repeat === 'daily') {
        result.total += 1
        result.completed += task.completionRate ?? 0
      } else if (task.dueDate === date) {
        result.total += 1
        if (task.status === 'completed') result.completed += 1
      }
    }
    return result
  }, { total: 0, completed: 0 })

  return totals.total ? Math.round((totals.completed / totals.total) * 100) : 0
}

const scheduleCategories = computed(() => [...new Set(months.flatMap(month => [
  ...month.schedule.recurringEvents,
  ...month.schedule.events
].map(event => event.category)))].sort())
const scheduleLegendItems = computed(() => scheduleCategories.value.map(category => ({
  category,
  label: titleCase(category),
  color: categoryColors.value[category as keyof typeof categoryColors.value] ?? categoryColors.value.other
})))

const scheduleMinutesForBucket = (bucket: ChartBucket) => {
  const minutes: Record<string, number> = {}
  for (const date of bucket.dates) {
    const month = monthByKey.get(date.slice(0, 7))
    if (!month) continue
    const weekday = parseDate(date).toLocaleDateString('en-US', { weekday: 'long' })
    const events = [
      ...month.schedule.recurringEvents.filter(event => event.daysOfWeek?.includes(weekday)),
      ...month.schedule.events.filter(event => event.date === date)
    ]
    for (const event of events) minutes[event.category] = (minutes[event.category] ?? 0) + event.durationMinutes
  }
  return minutes
}

const habitChartData = computed<ChartData<'line'>>(() => ({
  labels: habitBuckets.value.map(bucket => bucket.label),
  datasets: habitSeries.map(habit => ({
    label: habit.label,
    data: habitBuckets.value.map(bucket => habitRateForBucket(bucket, habit.key)),
    borderColor: chartColors.value[habit.key],
    backgroundColor: chartColors.value[habit.key],
    tension: 0.35,
    pointRadius: 3,
    pointHoverRadius: 5
  }))
}))

const taskChartData = computed<ChartData<'bar'>>(() => ({
  labels: taskBuckets.value.map(bucket => bucket.label),
  datasets: [{
    label: 'Tasks completed',
    data: taskBuckets.value.map(taskRateForBucket),
    backgroundColor: chartColors.value.tasks,
    hoverBackgroundColor: isLightMode.value ? '#05685f' : '#68d0c2',
    borderRadius: 4,
    maxBarThickness: 28
  }]
}))

const scheduleChartData = computed<ChartData<'bar'>>(() => ({
  labels: scheduleBuckets.value.map(bucket => bucket.label),
  datasets: scheduleLegendItems.value.map(({ category, label, color }) => ({
    label,
    data: scheduleBuckets.value.map(bucket => {
      const minutes = scheduleMinutesForBucket(bucket)
      const total = Object.values(minutes).reduce((sum, value) => sum + value, 0)
      return total ? Math.round(((minutes[category] ?? 0) / total) * 100) : 0
    }),
    backgroundColor: color,
    borderRadius: 3,
    maxBarThickness: 32
  }))
}))

const habitChartOptions = computed<ChartOptions<'line'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { intersect: false, mode: 'index' },
  plugins: {
    legend: { display: false },
    tooltip: { callbacks: { label: context => `${context.dataset.label}: ${context.parsed.y}%` } }
  },
  scales: {
    x: { grid: { display: false }, ticks: { color: chartTextColor.value, maxTicksLimit: 16 }, border: { display: false } },
    y: {
      min: 0,
      max: 100,
      ticks: { color: chartTextColor.value, stepSize: 25, callback: value => `${value}%` },
      grid: { color: chartGridColor.value },
      border: { display: false }
    }
  }
}))

const taskChartOptions = computed<ChartOptions<'bar'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { callbacks: { label: context => ` ${context.parsed.y}% completed` } }
  },
  scales: {
    x: { grid: { display: false }, ticks: { color: chartTextColor.value, maxTicksLimit: 16 }, border: { display: false } },
    y: {
      min: 0,
      max: 100,
      ticks: { color: chartTextColor.value, stepSize: 25, callback: value => `${value}%` },
      grid: { color: chartGridColor.value },
      border: { display: false }
    }
  }
}))

const scheduleChartOptions = computed<ChartOptions<'bar'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { intersect: false, mode: 'index' },
  plugins: {
    legend: { display: false },
    tooltip: { callbacks: { label: context => ` ${context.dataset.label}: ${context.parsed.y}%` } }
  },
  scales: {
    x: {
      stacked: true,
      grid: { display: false },
      ticks: { color: chartTextColor.value, maxTicksLimit: 16 },
      border: { display: false }
    },
    y: {
      stacked: true,
      min: 0,
      max: 100,
      ticks: { color: chartTextColor.value, stepSize: 25, callback: value => `${value}%` },
      grid: { color: chartGridColor.value },
      border: { display: false }
    }
  }
}))
</script>

<template>
  <div class="dashboard-page">
    <section class="summary-grid" :aria-label="`Summary for ${dateRangeLabel}`">
      <article class="summary-item">
        <span class="summary-label">Calendar commitments</span>
        <strong>{{ eventCount }}</strong>
        <span class="summary-note">Dated events and milestones</span>
      </article>
      <article class="summary-item">
        <span class="summary-label">Task follow-through</span>
        <strong>{{ taskFollowThrough }}<small>%</small></strong>
        <span class="summary-note">Average across selected months</span>
      </article>
      <article class="summary-item">
        <span class="summary-label">Habit consistency</span>
        <strong>{{ habitConsistency }}<small>%</small></strong>
        <span class="summary-note">Across four daily habits</span>
      </article>
    </section>

    <section class="dashboard-grid" aria-label="Progress trends">
      <article class="chart-panel schedule-panel">
        <div class="panel-heading">
          <div class="panel-copy">
            <h2>Schedule by Category</h2>
            <span>Share of scheduled time</span>
          </div>
          <div class="view-switch" role="group" aria-label="Schedule chart view">
            <button v-for="view in chartViews" :key="view.value" type="button" :aria-pressed="scheduleView === view.value" @click="scheduleView = view.value">
              {{ view.label }}
            </button>
          </div>
        </div>
        <div class="chart-area schedule-chart">
          <Bar :data="scheduleChartData" :options="scheduleChartOptions" />
        </div>
        <div class="chart-legend" aria-label="Schedule category chart legend">
          <span v-for="item in scheduleLegendItems" :key="item.category" class="chart-legend-item">
            <span class="chart-legend-swatch" :style="{ backgroundColor: item.color }" aria-hidden="true" />
            {{ item.label }}
          </span>
        </div>
      </article>

      <article class="chart-panel task-panel">
        <div class="panel-heading">
          <div class="panel-copy">
            <h2>Task Follow-Through</h2>
            <span>Completion rate by period</span>
          </div>
          <div class="view-switch" role="group" aria-label="Task chart view">
            <button v-for="view in chartViews" :key="view.value" type="button" :aria-pressed="taskView === view.value" @click="taskView = view.value">
              {{ view.label }}
            </button>
          </div>
        </div>
        <div class="chart-area task-chart">
          <Bar :data="taskChartData" :options="taskChartOptions" />
        </div>
      </article>

      <article class="chart-panel habit-panel">
        <div class="panel-heading">
          <div class="panel-copy">
            <h2>Habit Consistency</h2>
            <span>Goal completion by period</span>
          </div>
          <div class="view-switch" role="group" aria-label="Habit chart view">
            <button v-for="view in chartViews" :key="view.value" type="button" :aria-pressed="habitView === view.value" @click="habitView = view.value">
              {{ view.label }}
            </button>
          </div>
        </div>
        <div class="chart-area habit-chart">
          <Line :data="habitChartData" :options="habitChartOptions" />
        </div>
        <div class="chart-legend" aria-label="Habit chart legend">
          <span v-for="habit in habitSeries" :key="habit.key" class="chart-legend-item">
            <span class="chart-legend-swatch" :style="{ backgroundColor: chartColors[habit.key] }" aria-hidden="true" />
            {{ habit.label }}
          </span>
        </div>
      </article>

      <article class="chart-panel insight-panel" aria-labelledby="pattern-insights-title">
        <div class="panel-heading">
          <div class="panel-copy">
            <h2 id="pattern-insights-title">Highlights</h2>
          </div>
        </div>
        <div class="pattern-grid">
          <div v-for="insight in patternInsights.items" :key="insight.label" class="pattern-item">
            <span class="pattern-label">{{ insight.label }}</span>
            <strong class="pattern-value">{{ insight.value }}</strong>
            <span class="pattern-detail">{{ insight.detail }}</span>
          </div>
        </div>
        <div class="pattern-tips">
          <h3>Try This</h3>
          <ul class="pattern-tip-list">
            <li v-for="tip in patternInsights.tips" :key="tip">{{ tip }}</li>
          </ul>
        </div>
      </article>
    </section>
  </div>
</template>

<style scoped>
.dashboard-page {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 1.25rem;
  color: var(--text-primary);
}

.summary-grid,
.dashboard-grid {
  width: min(100%, 1280px);
  margin-inline: auto;
}

.summary-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.summary-item {
  display: flex;
  min-height: 116px;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.9rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
}

.summary-label {
  color: var(--text-secondary);
  font-family: var(--font-body);
  font-size: calc(0.78rem + 2pt);
}

.summary-item strong {
  color: var(--accent-color);
  font-family: var(--font-ui);
  font-size: calc(1.8rem + 2pt);
  font-weight: 500;
  line-height: 1;
}

.summary-item strong small {
  margin-left: 0.1rem;
  color: var(--accent-color);
  font-size: calc(1rem + 2pt);
}

.summary-note {
  color: var(--text-secondary);
  font-family: var(--font-body);
  font-size: calc(0.68rem + 2pt);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.chart-panel {
  min-width: 0;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
}

.insight-panel {
  grid-column: 1 / -1;
}

.pattern-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
}

.pattern-item {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.75rem 0;
}

.pattern-item + .pattern-item {
  border-top: 1px solid var(--border-color);
}

.pattern-label,
.pattern-detail {
  color: var(--text-secondary);
  font-family: var(--font-body);
  font-size: calc(0.75rem + 2pt);
}

.pattern-value {
  color: var(--accent-color);
  font-family: var(--font-ui);
  font-size: calc(1.1rem + 2pt);
  font-weight: 500;
  overflow-wrap: anywhere;
}

.pattern-tips {
  display: grid;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-color);
}

.pattern-tips h3 {
  margin: 0;
  color: var(--text-primary);
  font-family: var(--font-ui);
  font-size: calc(0.8rem + 2pt);
  font-weight: 500;
}

.pattern-tip-list {
  display: grid;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.pattern-tip-list li {
  position: relative;
  padding-left: 1rem;
  color: var(--text-secondary);
  font-family: var(--font-body);
  font-size: calc(0.75rem + 2pt);
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.pattern-tip-list li::before {
  position: absolute;
  top: 0.65em;
  left: 0;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent-color);
  content: '';
}

.panel-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.panel-copy {
  display: grid;
  gap: 0.25rem;
  min-width: 0;
}

.panel-heading h2 {
  margin: 0;
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: calc(0.98rem + 2pt);
  font-weight: 400;
}

.panel-copy > span {
  color: var(--text-secondary);
  font-family: var(--font-body);
  font-size: calc(0.68rem + 2pt);
}

.view-switch {
  display: inline-flex;
  flex: 0 0 auto;
  gap: 2px;
  padding: 2px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
}

.view-switch button {
  min-height: 26px;
  padding: 0.25rem 0.4rem;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-family: var(--font-ui);
  font-size: calc(0.65rem + 2pt);
  font-weight: 500;
}

.view-switch button[aria-pressed="true"] {
  background: var(--selected-surface);
  color: #051515;
}

.chart-area {
  position: relative;
  width: 100%;
}

.habit-chart {
  height: 240px;
}

.task-chart {
  height: 200px;
}

.schedule-chart {
  height: 240px;
}

.chart-legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem 1rem;
  margin-top: 0.75rem;
}

.chart-legend-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--text-secondary);
  font-family: var(--font-body);
  font-size: calc(0.68rem + 2pt);
}

.chart-legend-swatch {
  width: 6px;
  height: 6px;
  flex: 0 0 6px;
  border-radius: 50%;
}

@media (min-width: 640px) {
  .dashboard-page {
    padding: 1.5rem;
  }

  .summary-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
    margin-bottom: 1.25rem;
  }

  .summary-item {
    min-height: 136px;
    padding: 1.1rem;
  }

  .dashboard-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
    margin-bottom: 1.25rem;
  }

  .chart-panel {
    padding: 1.25rem;
  }

  .pattern-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .pattern-item {
    padding: 0.25rem 1rem;
  }

  .pattern-item:first-child {
    padding-left: 0;
  }

  .pattern-item + .pattern-item {
    border-top: 0;
    border-left: 1px solid var(--border-color);
  }

  .pattern-tips {
    grid-template-columns: 110px minmax(0, 1fr);
    align-items: start;
    gap: 1rem;
  }

  .pattern-tip-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }

  .habit-chart {
    height: 280px;
  }

  .task-chart {
    height: 240px;
  }
}

@media (min-width: 1080px) {
  .dashboard-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 380px) {
  .dashboard-page {
    padding: 1rem 0.75rem;
  }

  .summary-grid {
    gap: 0.5rem;
  }

  .summary-item {
    min-height: 108px;
    padding: 0.75rem;
  }

  .summary-item strong {
    font-size: calc(1.55rem + 2pt);
  }
}
</style>

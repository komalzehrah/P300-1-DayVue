<script setup lang="ts">
import { computed, inject, type Reactive } from 'vue'
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler, Tooltip, Legend)

type HabitKey = 'gym' | 'meditation' | 'bedtimeBefore11pm' | 'sketchFor5Minutes'

interface TaskMetric {
  repeat: 'daily' | 'once'
  completionRate?: number
  status?: string
  dueDate?: string
}

interface ScheduleEvent {
  date: string
  startTime: string
  title: string
  category: string
}

interface MonthMetric {
  month: string
  daysInMonth: number
  tasks: TaskMetric[]
  schedule: { events: ScheduleEvent[] }
  habits: Record<HabitKey, { completedDays: number[] }>
}

const months = metrics.months as MonthMetric[]
interface DashboardDateRange {
  startDate: string
  endDate: string
}

const dateRange = inject<Reactive<DashboardDateRange>>('dashboardDateRange', {
  startDate: '2026-03-01',
  endDate: '2026-07-31'
})
const habitSeries: Array<{ key: HabitKey; label: string; color: string }> = [
  { key: 'gym', label: 'Gym', color: '#e9d985' },
  { key: 'meditation', label: 'Meditation', color: '#4fbcae' },
  { key: 'bedtimeBefore11pm', label: 'Bed before 11', color: '#ff8c69' },
  { key: 'sketchFor5Minutes', label: 'Sketch', color: '#94aee0' }
]
const parseDate = (value: string) => {
  const [year = 1970, month = 1, day = 1] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

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
const monthLabels = computed(() => selectedMonths.value.map(({ month }) =>
  new Date(`${month}-01T12:00:00`).toLocaleDateString('en-US', { month: 'short' })
))

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

const taskRates = computed(() => selectedMonths.value.map(taskRate))
const taskFollowThrough = computed(() => {
  const rates = taskRates.value
  return rates.length ? Math.round(rates.reduce((sum, rate) => sum + rate, 0) / rates.length) : 0
})
const habitConsistency = computed(() => {
  const rates = selectedMonths.value.flatMap(month => habitSeries.map(habit => habitRate(month, habit.key)))
  return rates.length ? Math.round(rates.reduce((sum, rate) => sum + rate, 0) / rates.length) : 0
})
const eventsInRange = computed(() => months.flatMap(month => month.schedule.events)
  .filter(event => event.date >= dateRange.startDate && event.date <= dateRange.endDate))
const eventCount = computed(() => eventsInRange.value.length)
const gymSessions = computed(() => selectedMonths.value.reduce((sum, month) => {
  const window = monthWindow(month)
  if (!window) return sum
  return sum + month.habits.gym.completedDays.filter(day => day >= window.startDay && day <= window.endDay).length
}, 0))
const highlights = computed(() => eventsInRange.value
  .filter(event => event.category === 'family' || event.category === 'social')
  .slice(-4))
const highlightMonth = computed(() => {
  const lastMonth = selectedMonths.value[selectedMonths.value.length - 1]
  return lastMonth
    ? new Date(`${lastMonth.month}-01T12:00:00`).toLocaleDateString('en-US', { month: 'long' })
    : 'Selected period'
})
const dateRangeLabel = computed(() => {
  const start = parseDate(dateRange.startDate)
  const end = parseDate(dateRange.endDate)
  const startLabel = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const endLabel = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return `${startLabel} - ${endLabel}`
})

const habitChartData = computed<ChartData<'line'>>(() => ({
  labels: monthLabels.value,
  datasets: habitSeries.map(habit => ({
    label: habit.label,
    data: selectedMonths.value.map(month => habitRate(month, habit.key)),
    borderColor: habit.color,
    backgroundColor: habit.color,
    tension: 0.35,
    pointRadius: 3,
    pointHoverRadius: 5
  }))
}))

const taskChartData = computed<ChartData<'bar'>>(() => ({
  labels: monthLabels.value,
  datasets: [{
    label: 'Tasks completed',
    data: taskRates.value,
    backgroundColor: '#4fbcae',
    hoverBackgroundColor: '#68d0c2',
    borderRadius: 4,
    maxBarThickness: 28
  }]
}))

const habitChartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { intersect: false, mode: 'index' },
  plugins: {
    legend: {
      position: 'bottom',
      labels: { color: '#9db3b1', usePointStyle: true, boxWidth: 8, padding: 18, font: { family: 'Syne' } }
    },
    tooltip: { callbacks: { label: context => `${context.dataset.label}: ${context.parsed.y}%` } }
  },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#9db3b1' }, border: { display: false } },
    y: {
      min: 0,
      max: 100,
      ticks: { color: '#9db3b1', stepSize: 25, callback: value => `${value}%` },
      grid: { color: 'rgba(157, 179, 177, 0.12)' },
      border: { display: false }
    }
  }
}

const taskChartOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { callbacks: { label: context => ` ${context.parsed.y}% completed` } }
  },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#9db3b1' }, border: { display: false } },
    y: {
      min: 0,
      max: 100,
      ticks: { color: '#9db3b1', stepSize: 25, callback: value => `${value}%` },
      grid: { color: 'rgba(157, 179, 177, 0.12)' },
      border: { display: false }
    }
  }
}

const formatHighlightDate = (value: string) =>
  new Date(`${value}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
</script>

<template>
  <div class="dashboard-page">
    <header class="dashboard-heading">
      <div>
        <p class="dashboard-kicker">Overview</p>
        <h1>Recap</h1>
      </div>
    </header>

    <section class="summary-grid" :aria-label="`Summary for ${dateRangeLabel}`">
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
      <article class="summary-item">
        <span class="summary-label">Calendar commitments</span>
        <strong>{{ eventCount }}</strong>
        <span class="summary-note">Dated events and milestones</span>
      </article>
      <article class="summary-item">
        <span class="summary-label">Gym sessions</span>
        <strong>{{ gymSessions }}</strong>
        <span class="summary-note">Recorded in selected range</span>
      </article>
    </section>

    <section class="dashboard-grid" aria-label="Progress trends">
      <article class="chart-panel habit-panel">
        <div class="panel-heading">
          <h2>Habit Consistency</h2>
          <span>Monthly goal completion</span>
        </div>
        <div class="chart-area habit-chart">
          <Line :data="habitChartData" :options="habitChartOptions" />
        </div>
      </article>

      <article class="chart-panel task-panel">
        <div class="panel-heading">
          <h2>Task Follow-Through</h2>
          <span>Daily and one-off tasks</span>
        </div>
        <div class="chart-area task-chart">
          <Bar :data="taskChartData" :options="taskChartOptions" />
        </div>
      </article>
    </section>

    <section class="highlights-section">
      <div class="panel-heading">
          <h2>{{ highlightMonth }}, Outside Work</h2>
        <span>Family and social commitments</span>
      </div>
      <ul class="highlights-list">
        <li v-for="event in highlights" :key="event.date + event.title">
          <time>{{ formatHighlightDate(event.date) }}</time>
          <span class="highlight-marker" :class="event.category" />
          <span>{{ event.title }}</span>
          <span class="highlight-category">{{ event.category }}</span>
        </li>
      </ul>
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

.dashboard-heading,
.summary-grid,
.dashboard-grid,
.highlights-section {
  width: min(100%, 1280px);
  margin-inline: auto;
}

.dashboard-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.dashboard-kicker {
  margin: 0 0 0.25rem;
  color: var(--accent-color);
  font-family: var(--font-ui);
  font-size: 0.68rem;
  font-weight: 500;
}

.dashboard-heading h1 {
  margin: 0;
  font-family: var(--font-body);
  font-size: 1.65rem;
  font-weight: 400;
}

.date-range {
  padding-bottom: 0.2rem;
  color: var(--text-secondary);
  font-family: var(--font-ui);
  font-size: 0.8rem;
  white-space: nowrap;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
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
  font-size: 0.78rem;
}

.summary-item strong {
  color: var(--text-primary);
  font-family: var(--font-ui);
  font-size: 1.8rem;
  font-weight: 500;
  line-height: 1;
}

.summary-item strong small {
  margin-left: 0.1rem;
  color: var(--accent-color);
  font-size: 1rem;
}

.summary-note {
  color: var(--text-secondary);
  font-family: var(--font-body);
  font-size: 0.68rem;
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

.panel-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.panel-heading h2 {
  margin: 0;
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: 0.98rem;
  font-weight: 400;
}

.panel-heading > span {
  color: var(--text-secondary);
  font-family: var(--font-body);
  font-size: 0.68rem;
  text-align: right;
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

.highlights-section {
  padding-bottom: 1rem;
}

.highlights-section > .panel-heading {
  padding: 0.25rem 0;
}

.highlights-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.highlights-list li {
  display: grid;
  grid-template-columns: 48px 8px minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.65rem;
  min-height: 48px;
  border-top: 1px solid var(--border-color);
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: 0.78rem;
}

.highlights-list time,
.highlight-category {
  color: var(--text-secondary);
  font-family: var(--font-ui);
  font-size: 0.68rem;
}

.highlight-marker {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent-color);
}

.highlight-marker.social {
  background: #4fbcae;
}

.highlight-marker.family {
  background: #ff8c69;
}

.highlight-category {
  text-transform: capitalize;
}

@media (min-width: 640px) {
  .dashboard-page {
    padding: 1.5rem;
  }

  .summary-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
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

  .habit-chart {
    height: 280px;
  }

  .task-chart {
    height: 240px;
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
    font-size: 1.55rem;
  }
}
</style>

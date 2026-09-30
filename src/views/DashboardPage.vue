<script setup lang="ts">
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
const habitSeries: Array<{ key: HabitKey; label: string; color: string }> = [
  { key: 'gym', label: 'Gym', color: '#e9d985' },
  { key: 'meditation', label: 'Meditation', color: '#4fbcae' },
  { key: 'bedtimeBefore11pm', label: 'Bed before 11', color: '#ff8c69' },
  { key: 'sketchFor5Minutes', label: 'Sketch', color: '#94aee0' }
]
const monthLabels = months.map(({ month }) =>
  new Date(`${month}-01T12:00:00`).toLocaleDateString('en-US', { month: 'short' })
)

const habitRate = (month: MonthMetric, habit: HabitKey) => {
  const target = habit === 'gym' ? Math.ceil(month.daysInMonth / 7) * 3 : month.daysInMonth
  return Math.min(100, Math.round((month.habits[habit].completedDays.length / target) * 100))
}

const taskRate = (month: MonthMetric) => {
  const totals = month.tasks.reduce((result, task) => {
    if (task.repeat === 'daily') {
      result.total += month.daysInMonth
      result.completed += month.daysInMonth * (task.completionRate ?? 0)
    } else {
      result.total += 1
      if (task.status === 'completed') result.completed += 1
    }
    return result
  }, { total: 0, completed: 0 })

  return Math.round((totals.completed / totals.total) * 100)
}

const taskRates = months.map(taskRate)
const taskFollowThrough = Math.round(taskRates.reduce((sum, rate) => sum + rate, 0) / taskRates.length)
const habitConsistency = Math.round(
  months.reduce((sum, month) => sum + habitSeries.reduce((monthSum, habit) => monthSum + habitRate(month, habit.key), 0), 0)
  / (months.length * habitSeries.length)
)
const eventCount = months.reduce((sum, month) => sum + month.schedule.events.length, 0)
const gymSessions = months.reduce((sum, month) => sum + month.habits.gym.completedDays.length, 0)
const latestMonth = months[months.length - 1]!
const highlights = latestMonth.schedule.events
  .filter(event => event.category === 'family' || event.category === 'social')
  .slice(0, 4)

const habitChartData: ChartData<'line'> = {
  labels: monthLabels,
  datasets: habitSeries.map(habit => ({
    label: habit.label,
    data: months.map(month => habitRate(month, habit.key)),
    borderColor: habit.color,
    backgroundColor: habit.color,
    tension: 0.35,
    pointRadius: 3,
    pointHoverRadius: 5
  }))
}

const taskChartData: ChartData<'bar'> = {
  labels: monthLabels,
  datasets: [{
    label: 'Tasks completed',
    data: taskRates,
    backgroundColor: '#4fbcae',
    hoverBackgroundColor: '#68d0c2',
    borderRadius: 4,
    maxBarThickness: 28
  }]
}

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
        <p class="dashboard-kicker">OVERVIEW</p>
        <h1>Dash</h1>
      </div>
      <span class="date-range">March - July 2026</span>
    </header>

    <section class="summary-grid" aria-label="Five-month summary">
      <article class="summary-item">
        <span class="summary-label">Task follow-through</span>
        <strong>{{ taskFollowThrough }}<small>%</small></strong>
        <span class="summary-note">Average across five months</span>
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
        <span class="summary-note">Recorded over five months</span>
      </article>
    </section>

    <section class="dashboard-grid" aria-label="Progress trends">
      <article class="chart-panel habit-panel">
        <div class="panel-heading">
          <h2>Habit consistency</h2>
          <span>Monthly goal completion</span>
        </div>
        <div class="chart-area habit-chart">
          <Line :data="habitChartData" :options="habitChartOptions" />
        </div>
      </article>

      <article class="chart-panel task-panel">
        <div class="panel-heading">
          <h2>Task follow-through</h2>
          <span>Daily and one-off tasks</span>
        </div>
        <div class="chart-area task-chart">
          <Bar :data="taskChartData" :options="taskChartOptions" />
        </div>
      </article>
    </section>

    <section class="highlights-section">
      <div class="panel-heading">
        <h2>July, outside work</h2>
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

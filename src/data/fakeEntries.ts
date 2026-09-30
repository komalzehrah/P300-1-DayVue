import metrics from './metrics.json'

export type TaskPriority = 'low' | 'medium' | 'high'
export type TaskProgress = 'not-started' | 'in-progress' | 'done'

export interface DatedScheduleItem {
  id: string
  date: string
  time: string
  title: string
  duration: number
  icon?: string
  color?: string
}

export interface DatedTask {
  id: string
  date: string
  title: string
  priority: TaskPriority
  progress: TaskProgress
  repeat: boolean
  repeatFrequency?: 'daily' | 'weekly' | 'custom'
  repeatInterval?: number
}

export interface DatedHabit {
  id: string
  date: string
  title: string
  frequency: string
  completed: boolean
}

interface MetricsTask {
  title: string
  category: string
  repeat: 'daily' | 'once'
  completionRate?: number
  dueDate?: string
  status?: string
}

interface MetricsEvent {
  date?: string
  startTime: string
  durationMinutes: number
  title: string
  category: string
  daysOfWeek?: string[]
}

interface MetricsMonth {
  month: string
  daysInMonth: number
  tasks: MetricsTask[]
  schedule: {
    recurringEvents: MetricsEvent[]
    events: MetricsEvent[]
  }
  habits: Record<string, { target: string; completedDays: number[] }>
}

const months = metrics.months as MetricsMonth[]
const habitDefinitions = [
  { key: 'gym', title: 'Gym' },
  { key: 'meditation', title: 'Meditation' },
  { key: 'bedtimeBefore11pm', title: 'Bedtime before 11pm' },
  { key: 'sketchFor5Minutes', title: 'Sketch for 5 mins' }
]
const categoryColors: Record<string, string> = {
  work: '#1CB5BA',
  health: '#90EE90',
  family: '#FFB347',
  social: '#FF6B9D',
  personal: '#87CEEB',
  home: '#FF8C69'
}
const categoryIcons: Record<string, string> = {
  work: 'CalendarIcon',
  health: 'HeartIcon',
  family: 'UserGroupIcon',
  social: 'UserGroupIcon',
  personal: 'SparklesIcon',
  home: 'HomeIcon'
}

const dateString = (year: number, month: number, day: number) =>
  `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

const taskPriority = (category: string): TaskPriority => {
  if (category === 'work') return 'high'
  if (category === 'home') return 'low'
  return 'medium'
}

const createTasks = () => {
  const entries: DatedTask[] = []

  for (const month of months) {
    const [year = 1970, monthNumber = 1] = month.month.split('-').map(Number)
    for (const [taskIndex, task] of month.tasks.entries()) {
      const dates = task.repeat === 'daily'
        ? Array.from({ length: month.daysInMonth }, (_, index) => dateString(year, monthNumber, index + 1))
        : task.dueDate ? [task.dueDate] : []

      for (const date of dates) {
        const day = Number(date.slice(-2))
        const completionSample = (day * 37 + taskIndex * 53) % 100
        const progress: TaskProgress = task.repeat === 'daily'
          ? completionSample < (task.completionRate ?? 0.75) * 100 ? 'done' : 'not-started'
          : task.status === 'completed' ? 'done' : task.status === 'carried_over' ? 'in-progress' : 'not-started'

        entries.push({
          id: `sample-task:${date}:${taskIndex}`,
          date,
          title: task.title,
          priority: taskPriority(task.category),
          progress,
          repeat: task.repeat === 'daily',
          ...(task.repeat === 'daily' && { repeatFrequency: 'daily' as const, repeatInterval: 1 })
        })
      }
    }
  }

  return entries
}

const createScheduleItems = () => {
  const entries: DatedScheduleItem[] = []

  for (const month of months) {
    const [year = 1970, monthNumber = 1] = month.month.split('-').map(Number)
    for (let day = 1; day <= month.daysInMonth; day++) {
      const date = dateString(year, monthNumber, day)
      const weekday = new Date(year, monthNumber - 1, day).toLocaleDateString('en-US', { weekday: 'long' })
      const recurring = month.schedule.recurringEvents.filter(event => event.daysOfWeek?.includes(weekday))

      for (const [index, event] of recurring.entries()) {
        entries.push({
          id: `sample-event:${date}:recurring:${index}`,
          date,
          time: event.startTime,
          title: event.title,
          duration: event.durationMinutes,
          icon: categoryIcons[event.category] ?? 'ClockIcon',
          color: categoryColors[event.category] ?? '#e9d985'
        })
      }

      for (const [index, event] of month.schedule.events.filter(event => event.date === date).entries()) {
        entries.push({
          id: `sample-event:${date}:once:${index}`,
          date,
          time: event.startTime,
          title: event.title,
          duration: event.durationMinutes,
          icon: categoryIcons[event.category] ?? 'ClockIcon',
          color: categoryColors[event.category] ?? '#e9d985'
        })
      }
    }
  }

  return entries
}

const createHabits = () => {
  const entries: DatedHabit[] = []

  for (const month of months) {
    const [year = 1970, monthNumber = 1] = month.month.split('-').map(Number)
    for (let day = 1; day <= month.daysInMonth; day++) {
      const date = dateString(year, monthNumber, day)
      for (const habit of habitDefinitions) {
        const record = month.habits[habit.key]
        if (!record) continue
        entries.push({
          id: `sample-habit:${date}:${habit.key}`,
          date,
          title: habit.title,
          frequency: record.target,
          completed: record.completedDays.includes(day)
        })
      }
    }
  }

  return entries
}

export const sampleScheduleItems = createScheduleItems()
export const sampleTasks = createTasks()
export const sampleHabits = createHabits()

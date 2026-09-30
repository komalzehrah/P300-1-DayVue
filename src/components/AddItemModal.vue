<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  AcademicCapIcon,
  BoltIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  CodeBracketIcon,
  HeartIcon,
  LightBulbIcon,
  SparklesIcon,
  StarIcon,
  TrophyIcon,
  UserGroupIcon
} from '@heroicons/vue/24/outline'

type ItemKind = 'Schedule' | 'Tasks' | 'Habits'
type TaskPriority = 'low' | 'medium' | 'high'
type TaskProgress = 'not-started' | 'in-progress' | 'done'
type RepeatFrequency = 'daily' | 'weekly' | 'custom'
type HabitFrequencyUnit = 'day' | 'week' | 'month'

interface AddItemData {
  id: string
  title: string
  time?: string
  duration?: number
  frequency?: string
  icon?: string
  color?: string
  priority?: TaskPriority
  progress?: TaskProgress
  repeat?: boolean
  repeatFrequency?: RepeatFrequency
  repeatInterval?: number
  startDate?: string
  endDate?: string
  frequencyCount?: number
  frequencyUnit?: HabitFrequencyUnit
  loggedDates?: string[]
}

const props = defineProps<{
  activeTab: ItemKind
  mode?: 'add' | 'edit'
  item?: AddItemData
  defaultDate?: string
}>()

const emit = defineEmits<{
  close: []
  'add-item': [item: AddItemData]
  'save-item': [item: AddItemData]
  'delete-item': [id: string]
}>()

const durationPresets = [
  { label: '1m', value: 1 },
  { label: '5m', value: 5 },
  { label: '10m', value: 10 },
  { label: '15m', value: 15 },
  { label: '20m', value: 20 },
  { label: '30m', value: 30 },
  { label: '45m', value: 45 },
  { label: '1h', value: 60 },
  { label: '1.5h', value: 90 },
  { label: '2h', value: 120 }
]

const initialDuration = props.item?.duration ?? 30
const itemTitle = ref(props.item?.title ?? '')
const itemTime = ref(props.item?.time ?? '09:00')
const timeMinutes = Number(itemTime.value.split(':')[1]) || 0
const customTime = ref(timeMinutes % 30 !== 0)
const itemDuration = ref(String(initialDuration))
const durationMode = ref<'preset' | 'custom'>(
  durationPresets.some(preset => preset.value === initialDuration) ? 'preset' : 'custom'
)
const showDurationPicker = ref(props.mode === 'edit' && durationMode.value === 'custom')
const customHours = ref(Math.floor(initialDuration / 60))
const customMinutes = ref(initialDuration % 60)
const today = new Date()
const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
const itemStartDate = ref(props.item?.startDate ?? props.defaultDate ?? localToday)
const itemEndDate = ref(props.item?.endDate ?? '')
const frequencyCount = ref(String(props.item?.frequencyCount ?? 1))
const frequencyUnit = ref<HabitFrequencyUnit>(props.item?.frequencyUnit ?? 'day')
const itemPriority = ref<TaskPriority>(props.item?.priority ?? 'medium')
const itemProgress = ref<TaskProgress>(props.item?.progress ?? 'not-started')
const repeatTask = ref(props.item?.repeat ?? false)
const repeatFrequency = ref<RepeatFrequency>(props.item?.repeatFrequency ?? 'daily')
const repeatInterval = ref(String(props.item?.repeatInterval ?? 2))
const selectedIcon = ref(props.item?.icon ?? 'ClockIcon')
const selectedColor = ref(props.item?.color ?? '#FF8C69')

const timeOptions = Array.from({ length: 48 }, (_, index) => {
  const totalMinutes = index * 30
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  const value = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  const label = `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${hours < 12 ? 'AM' : 'PM'}`
  return { value, label }
})

const timeSelection = computed({
  get: () => customTime.value ? 'custom' : itemTime.value,
  set: (value: string) => {
    if (value === 'custom') customTime.value = true
    else {
      itemTime.value = value
      customTime.value = false
    }
  }
})

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
  '#FF8C69',
  '#1CB5BA',
  '#FF6B9D',
  '#7B68EE',
  '#87CEEB',
  '#90EE90',
  '#FFB347'
]

const closeModal = () => emit('close')

const formatHabitFrequency = () => {
  const count = Math.max(1, Number(frequencyCount.value) || 1)
  return count === 1 && frequencyUnit.value === 'day'
    ? 'Daily'
    : `${count} ${count === 1 ? 'time' : 'times'} per ${frequencyUnit.value}`
}

const updateHabitStartDate = () => {
  if (itemEndDate.value && itemEndDate.value < itemStartDate.value) {
    itemEndDate.value = itemStartDate.value
  }
}

const selectDurationPreset = (duration: number) => {
  itemDuration.value = String(duration)
  durationMode.value = 'preset'
  showDurationPicker.value = false
}

const toggleCustomDuration = () => {
  durationMode.value = 'custom'
  if (!showDurationPicker.value) {
    const duration = Math.max(1, Number(itemDuration.value) || 1)
    customHours.value = Math.floor(duration / 60)
    customMinutes.value = duration % 60
  }
  showDurationPicker.value = !showDurationPicker.value
}

const updateCustomDuration = () => {
  itemDuration.value = String(Math.max(1, customHours.value * 60 + customMinutes.value))
}

const handleSubmit = () => {
  if (!itemTitle.value.trim()) return

  const item: AddItemData = {
    id: props.item?.id ?? Date.now().toString(),
    title: itemTitle.value.trim(),
    ...(props.activeTab === 'Schedule' && {
      time: itemTime.value,
      duration: parseInt(itemDuration.value, 10),
      icon: selectedIcon.value,
      color: selectedColor.value
    }),
    ...(props.activeTab === 'Tasks' && {
      priority: itemPriority.value,
      progress: itemProgress.value,
      repeat: repeatTask.value,
      ...(repeatTask.value && {
        repeatFrequency: repeatFrequency.value,
        ...(repeatFrequency.value === 'custom' && { repeatInterval: Number(repeatInterval.value) || 1 })
      })
    }),
    ...(props.activeTab === 'Habits' && {
      startDate: itemStartDate.value,
      endDate: itemEndDate.value || undefined,
      frequency: formatHabitFrequency(),
      frequencyCount: Math.max(1, Number(frequencyCount.value) || 1),
      frequencyUnit: frequencyUnit.value,
      loggedDates: props.item?.loggedDates ?? []
    })
  }

  if (props.mode === 'edit') emit('save-item', item)
  else emit('add-item', item)
  closeModal()
}

const deleteItem = () => {
  if (props.item) emit('delete-item', props.item.id)
  closeModal()
}
</script>

<template>
  <div v-if="mode === 'edit'" class="modal-backdrop" @click="closeModal" />
  <div class="modal">
    <div class="modal-content">
      <header class="modal-header">
        <h2>
          {{ mode === 'edit'
            ? activeTab === 'Schedule' ? 'Edit Event' : activeTab === 'Tasks' ? 'Edit Task' : 'Edit Habit'
            : activeTab === 'Schedule' ? 'Add New Event' : activeTab === 'Tasks' ? 'Add New Task' : 'Add New Habit' }}
        </h2>
        <button class="close-btn" aria-label="Close" @click="closeModal">&times;</button>
      </header>

      <form class="modal-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="item-title">
            {{ activeTab === 'Schedule' ? 'Event title' : activeTab === 'Tasks' ? 'Task name' : 'Habit name' }}
          </label>
          <input id="item-title" v-model="itemTitle" type="text" placeholder="Enter item title" required />
        </div>

        <div v-if="activeTab === 'Schedule'" class="form-group">
          <label for="event-time">Time</label>
          <select id="event-time" v-model="timeSelection">
            <option v-for="option in timeOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
            <option value="custom">Custom time...</option>
          </select>
          <label v-if="customTime" for="manual-time" class="duration-label">Enter time</label>
          <input v-if="customTime" id="manual-time" v-model="itemTime" type="time" step="60" />
        </div>

        <div v-if="activeTab === 'Schedule'" class="form-group">
          <label>Duration</label>
          <div class="duration-presets">
            <button
              v-for="preset in durationPresets"
              :key="preset.value"
              type="button"
              class="duration-option"
              :class="{ active: durationMode === 'preset' && itemDuration === String(preset.value) }"
              @click="selectDurationPreset(preset.value)"
            >
              {{ preset.label }}
            </button>
            <button
              type="button"
              class="duration-option"
              :class="{ active: durationMode === 'custom' }"
              :aria-expanded="showDurationPicker"
              @click="toggleCustomDuration"
            >
              Custom
            </button>
          </div>
          <div v-if="showDurationPicker" class="custom-duration-picker">
            <label for="custom-duration-hours">
              Hours
              <select id="custom-duration-hours" v-model.number="customHours" @change="updateCustomDuration">
                <option v-for="hour in 24" :key="hour - 1" :value="hour - 1">{{ hour - 1 }}</option>
              </select>
            </label>
            <label for="custom-duration-minutes">
              Minutes
              <select id="custom-duration-minutes" v-model.number="customMinutes" @change="updateCustomDuration">
                <option v-for="minute in 60" :key="minute - 1" :value="minute - 1">{{ String(minute - 1).padStart(2, '0') }}</option>
              </select>
            </label>
          </div>
        </div>

        <div v-if="activeTab === 'Schedule'" class="form-group">
          <label>Icon</label>
          <div class="icon-picker">
            <button
              v-for="icon in scheduleIcons"
              :key="icon.name"
              type="button"
              class="icon-option"
              :class="{ active: selectedIcon === icon.name }"
              :title="icon.name"
              @click="selectedIcon = icon.name"
            >
              <component :is="icon.component" class="icon-preview" />
            </button>
          </div>
        </div>

        <div v-if="activeTab === 'Schedule'" class="form-group">
          <label>Color</label>
          <div class="color-picker">
            <button
              v-for="color in scheduleColors"
              :key="color"
              type="button"
              class="color-option"
              :class="{ active: selectedColor === color }"
              :style="{ backgroundColor: color }"
              :title="`Color: ${color}`"
              @click="selectedColor = color"
            />
          </div>
        </div>

        <div v-if="activeTab === 'Tasks'" class="form-group">
          <label for="task-priority">Priority</label>
          <select id="task-priority" v-model="itemPriority">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <label for="task-progress">Progress</label>
          <select id="task-progress" v-model="itemProgress">
            <option value="not-started">Not started</option>
            <option value="in-progress">In progress</option>
            <option value="done">Done</option>
          </select>
          <label class="repeat-toggle" for="repeat-task">
            <input id="repeat-task" v-model="repeatTask" type="checkbox" />
            <span>Repeat task</span>
          </label>
          <template v-if="repeatTask">
            <label for="repeat-frequency">Repeat</label>
            <select id="repeat-frequency" v-model="repeatFrequency">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="custom">Custom</option>
            </select>
            <label v-if="repeatFrequency === 'custom'" for="repeat-interval">Repeat every</label>
            <div v-if="repeatFrequency === 'custom'" class="repeat-interval-control">
              <input id="repeat-interval" v-model="repeatInterval" type="number" min="1" step="1" />
              <span>days</span>
            </div>
          </template>
        </div>

        <div v-if="activeTab === 'Habits'" class="form-group">
          <label for="habit-start-date">Start date</label>
          <input
            id="habit-start-date"
            v-model="itemStartDate"
            type="date"
            :max="itemEndDate || undefined"
            @change="updateHabitStartDate"
          />
          <label for="habit-end-date">End date <span>(optional)</span></label>
          <input id="habit-end-date" v-model="itemEndDate" type="date" :min="itemStartDate" />
          <label>Frequency</label>
          <div class="habit-frequency-control">
            <input id="habit-frequency-count" v-model="frequencyCount" type="number" min="1" step="1" aria-label="Times per frequency period" />
            <span>times per</span>
            <select id="habit-frequency-unit" v-model="frequencyUnit" aria-label="Frequency period">
              <option value="day">day</option>
              <option value="week">week</option>
              <option value="month">month</option>
            </select>
          </div>
        </div>

        <footer class="form-actions" :class="{ 'edit-actions': mode === 'edit' }">
          <button v-if="mode === 'edit'" class="delete-btn" type="button" @click="deleteItem">
            {{ activeTab === 'Schedule' ? 'Delete Event' : activeTab === 'Tasks' ? 'Delete Task' : 'Delete Habit' }}
          </button>
          <button class="cancel-btn" type="button" @click="closeModal">Cancel</button>
          <button class="submit-btn" type="submit">
            {{ mode === 'edit'
              ? activeTab === 'Schedule' ? 'Save Event' : activeTab === 'Tasks' ? 'Save Changes' : 'Save Habit'
              : activeTab === 'Schedule' ? 'Add to Schedule' : activeTab === 'Tasks' ? 'Add to List' : 'Add Habit' }}
          </button>
        </footer>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 99;
  background: rgba(0, 0, 0, 0.45);
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 102;
  width: calc(100% - 2rem);
  max-width: 440px;
  max-height: 90vh;
  max-height: 90dvh;
  animation: modalOpen 0.3s ease;
}

@keyframes modalOpen {
  from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}

.modal-content {
  max-height: 90vh;
  max-height: 90dvh;
  overflow-y: auto;
  overscroll-behavior: contain;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--bg-secondary);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  margin: 0;
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: 1.3rem;
  font-weight: 600;
}

.close-btn {
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--text-primary);
  cursor: pointer;
  font-size: 1.3rem;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group > label {
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 600;
}

.form-group input:not([type="checkbox"]),
.form-group select {
  min-height: 42px;
  padding: 0.65rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: 0.95rem;
}

.form-group input:focus,
.form-group select:focus {
  outline: 2px solid var(--accent-color);
  outline-offset: 1px;
}

.duration-label {
  margin-top: 0.25rem;
}

.duration-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.duration-option {
  min-width: 44px;
  min-height: 34px;
  padding: 0.35rem 0.55rem;
  border: 1px solid var(--border-color);
  border-radius: 999px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  cursor: pointer;
  font-family: var(--font-ui);
  font-size: 0.78rem;
  font-weight: 500;
}

.duration-option.active {
  border-color: var(--accent-color);
  background: var(--accent-surface);
  color: #000;
}

.custom-duration-picker {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-tertiary);
}

.custom-duration-picker label {
  display: grid;
  gap: 0.35rem;
  color: var(--text-secondary);
  font-family: var(--font-body);
  font-size: 0.8rem;
}

.custom-duration-picker select {
  width: 100%;
  min-width: 0;
  min-height: 38px;
  padding: 0.45rem 0.6rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-family: var(--font-ui);
  font-size: 0.9rem;
}

.repeat-toggle {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: 0.25rem;
  color: var(--text-primary);
  cursor: pointer;
  font-family: var(--font-body);
}

.repeat-toggle input {
  width: 18px;
  height: 18px;
  accent-color: var(--accent-color);
}

.repeat-interval-control {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--text-secondary);
  font-family: var(--font-body);
  font-size: 0.85rem;
}

.repeat-interval-control input {
  width: 88px;
}

.habit-frequency-control {
  display: grid;
  grid-template-columns: minmax(56px, 0.5fr) auto minmax(110px, 1fr);
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-family: var(--font-body);
  font-size: 0.8rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.form-actions.edit-actions {
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.form-actions button {
  min-height: 38px;
  padding: 0.5rem 0.85rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  font-family: var(--font-ui);
  font-size: 0.85rem;
  font-weight: 500;
}

.form-actions:not(.edit-actions) button {
  flex: 1;
}

.form-actions .cancel-btn {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.form-actions .delete-btn {
  border-color: #ad5348;
  background: var(--bg-tertiary);
  color: #ff9b7f;
}

.form-actions.edit-actions .delete-btn {
  margin-right: auto;
}

.form-actions .submit-btn {
  border-color: #ff8c69;
  background: #ff8c69;
  color: #051515;
}

.form-actions.edit-actions .submit-btn {
  border-color: var(--accent-color);
  background: var(--accent-surface);
  color: #000;
}

.icon-picker,
.color-picker {
  display: grid;
  grid-template-columns: repeat(auto-fill, 48px);
  gap: 0.5rem;
}

.icon-option,
.color-option {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border: 2px solid transparent;
  border-radius: 50%;
  cursor: pointer;
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.icon-option {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.icon-option:hover,
.color-option:hover {
  transform: scale(1.05);
}

.icon-option.active {
  border-color: var(--accent-color);
  background: var(--accent-surface);
  color: #000;
}

.icon-preview {
  width: 24px;
  height: 24px;
  stroke-width: 2;
}

.color-option {
  border-width: 3px;
}

.color-option.active {
  border-color: var(--text-primary);
  box-shadow: 0 0 0 2px var(--bg-secondary), 0 0 0 4px var(--text-primary);
}
</style>

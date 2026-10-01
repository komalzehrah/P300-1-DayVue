<script setup lang="ts">
import { computed, inject, ref, type Ref } from 'vue'
import { CheckIcon } from '@heroicons/vue/24/outline'
import { PhPencilSimple } from '@phosphor-icons/vue'
import AddItemModal from '../components/AddItemModal.vue'

type TaskPriority = 'low' | 'medium' | 'high'
type TaskProgress = 'not-started' | 'in-progress' | 'done'

interface Task {
  id: string
  date?: string
  title: string
  priority: TaskPriority
  progress: TaskProgress
  repeat: boolean
  repeatFrequency?: 'daily' | 'weekly' | 'custom'
  repeatInterval?: number
  repeatUnit?: 'days' | 'weeks'
}

interface TaskEditPayload {
  id: string
  title: string
  priority?: TaskPriority
  progress?: TaskProgress
  repeat?: boolean
  repeatFrequency?: 'daily' | 'weekly' | 'custom'
  repeatInterval?: number
  repeatUnit?: 'days' | 'weeks'
}

const tasks = inject<Ref<Task[]>>('tasks', ref<Task[]>([]))
const selectedDate = inject<Ref<string>>('selectedDate', ref(''))
const sortBy = inject<Ref<'priority' | 'progress'>>('taskSortBy', ref<'priority' | 'progress'>('priority'))
const editedTask = ref<Task | null>(null)

const priorityOrder: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 }
const progressOrder: Record<TaskProgress, number> = { 'not-started': 0, 'in-progress': 1, done: 2 }

const visibleTasks = computed(() => tasks.value.filter(task => !task.date || task.date === selectedDate.value))

const sortedTasks = computed(() => [...visibleTasks.value].sort((first, second) => {
  if (sortBy.value === 'priority') {
    return priorityOrder[first.priority] - priorityOrder[second.priority]
      || progressOrder[first.progress] - progressOrder[second.progress]
  }
  return progressOrder[first.progress] - progressOrder[second.progress]
    || priorityOrder[first.priority] - priorityOrder[second.priority]
}))

const toggleTask = (id: string) => {
  const task = tasks.value.find(task => task.id === id)
  if (task) task.progress = task.progress === 'done' ? 'not-started' : 'done'
}

const editTask = (task: Task) => {
  editedTask.value = { ...task }
}

const closeEditor = () => {
  editedTask.value = null
}

const saveTask = (updatedTask: TaskEditPayload) => {
  const index = tasks.value.findIndex(task => task.id === updatedTask.id)
  const existingTask = tasks.value[index]
  if (existingTask) {
    tasks.value[index] = {
      ...existingTask,
      title: updatedTask.title,
      priority: updatedTask.priority ?? existingTask.priority,
      progress: updatedTask.progress ?? existingTask.progress,
      repeat: updatedTask.repeat ?? existingTask.repeat,
      repeatFrequency: updatedTask.repeat ? updatedTask.repeatFrequency : undefined,
      repeatInterval: updatedTask.repeat && updatedTask.repeatFrequency === 'custom'
        ? updatedTask.repeatInterval
        : undefined,
      repeatUnit: updatedTask.repeat && updatedTask.repeatFrequency === 'custom'
        ? updatedTask.repeatUnit ?? 'days'
        : undefined
    }
  }
  closeEditor()
}

const deleteTask = (taskId: string) => {
  const index = tasks.value.findIndex(task => task.id === taskId)
  if (index !== -1) tasks.value.splice(index, 1)
  closeEditor()
}
</script>

<template>
  <div class="tasks-container">
    <div v-if="visibleTasks.length === 0" class="empty-state">
      <p>No tasks yet. Add one to get started!</p>
    </div>
    <div v-else class="tasks-list">
      <article
        v-for="task in sortedTasks"
        :key="task.id"
        class="task-pill"
        :class="{ completed: task.progress === 'done' }"
      >
        <button
          class="task-toggle"
          :class="{ checked: task.progress === 'done' }"
          :aria-label="task.progress === 'done' ? `Mark ${task.title} not done` : `Mark ${task.title} done`"
          @click="toggleTask(task.id)"
        >
          <Transition name="task-check">
            <span v-if="task.progress === 'done'" class="task-check-mark" aria-hidden="true">
              <CheckIcon />
            </span>
          </Transition>
        </button>
        <div class="task-copy">
          <span class="task-title">{{ task.title }}</span>
          <div class="task-chips">
            <button class="task-chip priority-chip" :class="`priority-${task.priority}`" @click="editTask(task)">
              {{ task.priority }} priority
            </button>
            <button class="task-chip progress-chip" :class="`progress-${task.progress}`" @click="editTask(task)">
              {{ task.progress.replace('-', ' ') }}
            </button>
          </div>
        </div>
        <button class="edit-task" :aria-label="`Edit ${task.title}`" title="Edit task" @click="editTask(task)">
          <PhPencilSimple />
        </button>
      </article>
    </div>

    <AddItemModal
      v-if="editedTask"
      active-tab="Tasks"
      mode="edit"
      :item="editedTask"
      @close="closeEditor"
      @save-item="saveTask"
      @delete-item="deleteTask"
    />
  </div>
</template>

<style scoped>
.tasks-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  overflow-y: auto;
  height: 100%;
  min-height: 0;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-height: 100%;
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

.task-pill {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 64px;
  padding: 0.6rem 0.9rem;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  border-radius: 8px;
  transition:
    background 0.2s ease,
    border-color 0.2s ease;
}

.task-pill:hover {
  background: var(--bg-tertiary);
}

.task-pill.completed {
  border-color: transparent;
  background: #10201e;
}

.task-toggle {
  display: grid;
  flex: 0 0 24px;
  width: 24px;
  height: 24px;
  place-items: center;
  border: 2px solid var(--text-secondary);
  border-radius: 50%;
  background: transparent;
  color: #051515;
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    transform 120ms cubic-bezier(0.25, 1, 0.5, 1);
}

.task-toggle:active {
  transform: scale(0.92);
}

.task-toggle:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 3px;
}

.task-toggle.checked {
  border-color: var(--accent-color);
  background: var(--selected-surface);
}

.task-toggle :deep(svg) {
  width: 16px;
  height: 16px;
  stroke-width: 2.5;
}

.task-check-mark {
  display: grid;
  width: 16px;
  height: 16px;
  place-items: center;
}

.task-check-enter-active {
  transition:
    opacity 0.18s ease-out,
    transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.task-check-enter-from {
  opacity: 0;
  transform: scale(0.65);
}

.task-check-enter-to {
  opacity: 1;
  transform: scale(1);
}

.task-copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem 1rem;
}

.task-title {
  flex: 1;
  word-break: break-word;
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: calc(0.9rem + 2pt);
}

.task-pill.completed .task-title {
  text-decoration: line-through;
  color: var(--text-secondary);
}

.task-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.task-chip {
  min-height: 24px;
  padding: 0.25rem 0.55rem;
  border: 1px solid color-mix(in srgb, currentColor 24%, transparent);
  border-radius: 999px;
  cursor: pointer;
  font-family: var(--font-ui);
  font-size: 0.68rem;
  font-weight: 500;
  text-transform: capitalize;
}

.priority-high {
  background: rgba(255, 140, 105, 0.18);
  color: #ff9b7f;
}
.priority-medium {
  background: rgba(233, 217, 133, 0.18);
  color: var(--accent-color);
}
.priority-low {
  background: rgba(79, 188, 174, 0.18);
  color: #71d0c4;
}
.progress-not-started {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}
.progress-in-progress {
  background: rgba(148, 174, 224, 0.18);
  color: #a9c0ef;
}
.progress-done {
  background: rgba(79, 188, 174, 0.14);
  color: #71d0c4;
}

body.light-mode .priority-high {
  background: #ffe1d8;
  color: #762b1d;
}

body.light-mode .priority-medium {
  background: #f5edc9;
  color: #564800;
}

body.light-mode .priority-low {
  background: #d4eee8;
  color: #15584f;
}

body.light-mode .progress-not-started {
  background: #e8eeed;
  color: #40504d;
}

body.light-mode .progress-in-progress {
  background: #e2eafa;
  color: #314d79;
}

body.light-mode .progress-done {
  background: #d8eee4;
  color: #205c41;
}

.edit-repeat-toggle {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: calc(0.85rem + 2pt);
}

.edit-repeat-toggle input {
  width: 18px;
  height: 18px;
  accent-color: var(--accent-color);
}

.edit-task {
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

.edit-task:hover {
  background: var(--bg-primary);
  color: var(--accent-color);
}

.edit-task :deep(svg) {
  width: 19px;
  height: 19px;
}

@media (min-width: 481px) {
  .tasks-container {
    height: 100%;
    padding: 1.5rem;
  }
}

@media (min-width: 768px) {
  .tasks-container {
    padding: 2rem;
  }

  .tasks-list {
    gap: 1.25rem;
    width: 100%;
    max-width: 960px;
    margin: 0 auto;
  }

  .task-pill {
    min-height: 72px;
  }
}

body.light-mode .task-pill.completed {
  background: #e5eeeb;
}

@media (prefers-reduced-motion: reduce) {
  .task-toggle,
  .task-check-enter-active {
    transition: none;
  }

  .task-toggle:active {
    transform: none;
  }
}

@media (max-width: 420px) {
  .tasks-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .task-pill {
    align-items: flex-start;
    border-radius: 8px;
  }

  .task-copy {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>

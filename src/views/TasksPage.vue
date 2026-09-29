<script setup lang="ts">
import { ref } from 'vue'

const tasks = ref<Array<{ id: string; title: string; completed: boolean }>>([])

const toggleTask = (id: string) => {
  const task = tasks.value.find(t => t.id === id)
  if (task) {
    task.completed = !task.completed
  }
}

const addTask = (title: string) => {
  tasks.value.push({
    id: Date.now().toString(),
    title,
    completed: false
  })
}
</script>

<template>
  <div class="tasks-container">
    <div class="tasks-list">
      <div v-if="tasks.length === 0" class="empty-state">
        <p>No tasks yet. Add one to get started!</p>
      </div>
      <div v-for="task in tasks" :key="task.id" class="task-item">
        <input
          type="checkbox"
          :checked="task.completed"
          @change="toggleTask(task.id)"
          class="task-checkbox"
        />
        <span :class="{ completed: task.completed }">{{ task.title }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tasks-container {
  padding: 1rem;
  overflow-y: auto;
  height: calc(100vh - 140px);
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.empty-state {
  text-align: center;
  color: var(--text-secondary);
  padding: 2rem 1rem;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  transition: background 0.2s ease;
}

.task-item:hover {
  background: var(--bg-tertiary);
}

.task-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: var(--accent-color);
}

.task-item span {
  flex: 1;
  word-break: break-word;
}

.task-item span.completed {
  text-decoration: line-through;
  color: var(--text-secondary);
}
</style>

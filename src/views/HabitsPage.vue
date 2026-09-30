<script setup lang="ts">
import { ref } from 'vue'

const habits = ref<Array<{ id: string; title: string; frequency: string; completed: boolean }>>([])

const toggleHabit = (id: string) => {
  const habit = habits.value.find(h => h.id === id)
  if (habit) {
    habit.completed = !habit.completed
  }
}

const addHabit = (title: string, frequency: string) => {
  habits.value.push({
    id: Date.now().toString(),
    title,
    frequency,
    completed: false
  })
}
</script>

<template>
  <div class="habits-container">
    <div class="habits-list">
      <div v-if="habits.length === 0" class="empty-state">
        <p>No habits yet. Add one to get started!</p>
      </div>
      <div v-for="habit in habits" :key="habit.id" class="habit-item">
        <input
          type="checkbox"
          :checked="habit.completed"
          @change="toggleHabit(habit.id)"
          class="habit-checkbox"
        />
        <div class="habit-info">
          <span :class="{ completed: habit.completed }">{{ habit.title }}</span>
          <small>{{ habit.frequency }}</small>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.habits-container {
  padding: 1rem;
  overflow-y: auto;
  height: 100%;
  min-height: 0;
}

.habits-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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

.habit-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  transition: background 0.2s ease;
}

.habit-item:hover {
  background: var(--bg-tertiary);
}

.habit-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: var(--accent-color);
  flex-shrink: 0;
}

.habit-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.habit-info span {
  word-break: break-word;
}

.habit-info span.completed {
  text-decoration: line-through;
  color: var(--text-secondary);
}

.habit-info small {
  color: var(--text-secondary);
  font-size: 0.8rem;
}

@media (min-width: 481px) {
  .habits-container {
    height: 100%;
    padding: 1.5rem;
  }
}

@media (min-width: 768px) {
  .habits-container {
    padding: 2rem;
  }

  .habits-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.25rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .empty-state {
    grid-column: 1 / -1;
  }

  .habit-item {
    min-height: 84px;
  }
}
</style>

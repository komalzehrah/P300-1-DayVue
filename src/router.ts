import { createRouter, createWebHistory } from 'vue-router'
import DashboardPage from './views/DashboardPage.vue'
import SchedulePage from './views/SchedulePage.vue'
import TasksPage from './views/TasksPage.vue'
import HabitsPage from './views/HabitsPage.vue'

const routes = [
  {
    path: '/',
    name: 'Recap',
    component: DashboardPage
  },
  {
    path: '/schedule',
    name: 'Schedule',
    component: SchedulePage
  },
  {
    path: '/dashboard',
    redirect: '/'
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: TasksPage
  },
  {
    path: '/habits',
    name: 'Habits',
    component: HabitsPage
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from './layouts/MainLayout.vue'

const router = useRouter()
const currentRoute = computed(() => router.currentRoute.value.name)
</script>

<template>
  <MainLayout />
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  width: 100%;
  height: 100%;
}

body {
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Livvic', sans-serif;
  transition: background-color 0.3s ease, color 0.3s ease;
}

:root {
  --bg-primary: #051515;
  --bg-secondary: #081a1a;
  --bg-tertiary: #0b2020;
  --text-primary: #ffffff;
  --text-secondary: #9db3b1;
  --border-color: #0f2d2d;
  --accent-color: #e9d985;
  --accent-hover: #dcc968;
  font-family: 'Livvic', sans-serif;
}

body.light-mode {
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --bg-tertiary: #efefef;
  --text-primary: #051515;
  --text-secondary: #3a5a59;
  --border-color: #d4e8e5;
  --accent-color: #0e8186;
  --accent-hover: #0a6a6d;
}
</style>

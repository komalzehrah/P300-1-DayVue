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

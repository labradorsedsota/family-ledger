<template>
  <header class="app-header">
    <h1 class="app-title">家庭记账本</h1>
    <div class="month-switcher">
      <el-button
        :icon="ArrowLeft"
        circle
        size="small"
        @click="$emit('prev-month')"
      />
      <span class="month-text">{{ monthDisplay }}</span>
      <el-button
        :icon="ArrowRight"
        circle
        size="small"
        :disabled="isCurrentMonth"
        @click="$emit('next-month')"
      />
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { formatMonthDisplay, getCurrentMonth } from '../utils/format.js'

const props = defineProps({
  currentMonth: {
    type: String,
    required: true
  }
})

defineEmits(['prev-month', 'next-month'])

const monthDisplay = computed(() => formatMonthDisplay(props.currentMonth))

const isCurrentMonth = computed(() => props.currentMonth === getCurrentMonth())
</script>

<style scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #FFE156;
  border-radius: 8px;
  border: 2px solid #000;
  box-shadow: 4px 4px 0 #000;
  margin-bottom: 16px;
  transition: all 0.15s ease;
}

.app-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 24px;
  font-weight: 800;
  color: #000;
  margin: 0;
}

.month-switcher {
  display: flex;
  align-items: center;
  gap: 12px;
}

.month-text {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #000;
  min-width: 100px;
  text-align: center;
}

:deep(.el-button) {
  border: 2px solid #000 !important;
  box-shadow: 3px 3px 0 #000;
  border-radius: 6px !important;
  background: #fff;
  color: #000;
  font-weight: 700;
  transition: all 0.15s ease;
}

:deep(.el-button:hover) {
  transform: translate(3px, 3px);
  box-shadow: none !important;
}
</style>

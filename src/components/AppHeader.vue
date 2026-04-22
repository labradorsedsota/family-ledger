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
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
}

.app-title {
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.month-switcher {
  display: flex;
  align-items: center;
  gap: 12px;
}

.month-text {
  font-size: 16px;
  font-weight: 500;
  color: #1e293b;
  min-width: 100px;
  text-align: center;
}
</style>

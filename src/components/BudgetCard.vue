<template>
  <div class="budget-card">
    <div class="budget-header">
      <span class="budget-label">预算进度</span>
      <el-button size="small" @click="$emit('setup')">设置</el-button>
    </div>

    <!-- 未设置预算 -->
    <div v-if="!progress.hasBudget" class="no-budget">
      <el-empty description="未设置预算，点击设置" :image-size="64" />
    </div>

    <!-- 已设置预算 -->
    <div v-else class="budget-body">
      <div class="percentage-display">
        <span class="percentage-num" :style="{ color: progressColor }">
          {{ displayPercentage }}%
        </span>
        <span class="percentage-sub">已使用</span>
      </div>

      <el-progress
        :percentage="Math.min(progress.actualPercentage, 100)"
        :color="progressColor"
        :stroke-width="12"
        :show-text="false"
        class="budget-progress"
      />

      <div class="budget-text">
        <span>已用 <strong>{{ formatAmount(progress.used) }}</strong></span>
        <span>预算 <strong>{{ formatAmount(progress.total) }}</strong></span>
      </div>

      <div v-if="progress.isOverBudget" class="over-budget-tag">
        超支 {{ formatAmount(progress.used - progress.total) }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useBudget } from '../composables/useBudget.js'
import { formatAmount } from '../utils/format.js'

const props = defineProps({
  totalExpense: { type: Number, default: 0 }
})

defineEmits(['setup'])

const { getBudgetProgress } = useBudget()

const progress = computed(() => getBudgetProgress(props.totalExpense).value)

const displayPercentage = computed(() =>
  progress.value.actualPercentage != null
    ? progress.value.actualPercentage.toFixed(1)
    : '0.0'
)

const progressColor = computed(() => {
  const p = progress.value.actualPercentage || 0
  if (p >= 100) return '#ef4444'
  if (p >= 80) return '#f59e0b'
  return '#2563eb'
})
</script>

<style scoped>
.budget-card {
  background: #E8DEFF;
  border-radius: 8px;
  border: 2px solid #000;
  box-shadow: 4px 4px 0 #000;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  transition: all 0.15s ease;
}

.budget-card:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 #000;
}

.budget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.budget-label {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 14px;
  color: #000;
  font-weight: 700;
}

.no-budget {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.budget-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  justify-content: center;
}

.percentage-display {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.percentage-num {
  font-family: 'Space Mono', monospace;
  font-size: 48px;
  font-weight: 700;
  line-height: 1;
  transition: color 0.3s;
}

.percentage-sub {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 14px;
  color: #000;
  font-weight: 500;
}

.budget-progress {
  border-radius: 4px;
}

:deep(.el-progress-bar__outer) {
  border-radius: 4px;
  background: #E5E5E5;
  border: 1px solid #000;
}
:deep(.el-progress-bar__inner) {
  border-radius: 4px;
  transition: width 0.6s ease, background-color 0.3s;
}

.budget-text {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #000;
  font-weight: 500;
}

.budget-text strong {
  font-family: 'Space Mono', monospace;
  color: #000;
  font-weight: 700;
}

.over-budget-tag {
  display: inline-flex;
  align-items: center;
  background: #FF6B9D;
  color: #fff;
  border: 2px solid #000;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 2px 2px 0 #000;
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

<template>
  <div class="trend-card">
    <h3 class="card-title">月度收支趋势</h3>

    <el-empty
      v-if="trendData.length === 0"
      description="暂无趋势数据"
      :image-size="64"
    />

    <el-timeline v-else>
      <el-timeline-item
        v-for="item in trendData"
        :key="item.month"
        :timestamp="formatMonthDisplay(item.month)"
        placement="top"
        :color="item.balance >= 0 ? '#10b981' : '#ef4444'"
      >
        <div class="trend-content">
          <div class="trend-row">
            <span class="trend-label">收入</span>
            <span class="trend-amount income">{{ formatAmount(item.totalIncome) }}</span>
          </div>
          <div class="trend-row">
            <span class="trend-label">支出</span>
            <span class="trend-amount expense">{{ formatAmount(item.totalExpense) }}</span>
          </div>
          <div class="trend-row balance-row">
            <span class="trend-label">结余</span>
            <span
              class="trend-amount"
              :class="item.balance >= 0 ? 'income' : 'expense'"
            >
              {{ formatBalance(item.balance) }}
            </span>
          </div>
        </div>
      </el-timeline-item>
    </el-timeline>
  </div>
</template>

<script setup>
import { formatMonthDisplay, formatAmount, formatBalance } from '../utils/format.js'

defineProps({
  trendData: { type: Array, default: () => [] }
})
</script>

<style scoped>
.trend-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 20px 0;
}

.trend-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 4px 0;
}

.trend-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.trend-label {
  font-size: 13px;
  color: #64748b;
  min-width: 32px;
}

.trend-amount {
  font-family: 'DIN Alternate', 'Roboto Mono', monospace;
  font-size: 15px;
  font-weight: 500;
}

.trend-amount.income { color: #10b981; }
.trend-amount.expense { color: #ef4444; }

.balance-row {
  padding-top: 4px;
  border-top: 1px solid #f1f5f9;
  margin-top: 2px;
}

:deep(.el-timeline-item__timestamp) {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}
</style>

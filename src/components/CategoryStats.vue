<template>
  <div class="category-card">
    <div class="card-title">分类支出占比</div>

    <el-empty
      v-if="stats.length === 0"
      description="暂无支出数据"
      :image-size="48"
    />

    <div v-else class="category-list">
      <div
        v-for="item in stats"
        :key="item.code"
        class="category-item"
      >
        <div class="category-row">
          <span class="category-name">
            {{ getCategory(item.code).icon }} {{ getCategory(item.code).name }}
          </span>
          <span class="category-amount">{{ formatAmount(item.amount) }}</span>
          <span class="category-pct">{{ item.percentage }}%</span>
        </div>
        <el-progress
          :percentage="item.percentage"
          :show-text="false"
          :stroke-width="6"
          color="#2563eb"
          class="cat-progress"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { getCategoryByCode } from '../constants/categories.js'
import { formatAmount } from '../utils/format.js'

defineProps({
  stats: { type: Array, default: () => [] }
})

function getCategory(code) {
  return getCategoryByCode(code)
}
</script>

<style scoped>
.category-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-title {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.category-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.category-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-name {
  flex: 1;
  font-size: 13px;
  color: #1e293b;
  font-weight: 500;
}

.category-amount {
  font-size: 13px;
  font-family: 'DIN Alternate', 'Roboto Mono', monospace;
  color: #64748b;
  min-width: 80px;
  text-align: right;
}

.category-pct {
  font-size: 13px;
  color: #2563eb;
  font-weight: 600;
  min-width: 42px;
  text-align: right;
}

.cat-progress {
  border-radius: 100px;
}

:deep(.el-progress-bar__outer) {
  border-radius: 100px;
  background: #f1f5f9;
}
:deep(.el-progress-bar__inner) {
  border-radius: 100px;
}
</style>

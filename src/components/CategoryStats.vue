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
  background: #D4EDFC;
  border-radius: 8px;
  border: 2px solid #000;
  box-shadow: 4px 4px 0 #000;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.15s ease;
}

.category-card:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 #000;
}

.card-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 14px;
  color: #000;
  font-weight: 700;
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
  font-family: 'Space Grotesk', sans-serif;
  font-size: 13px;
  color: #000;
  font-weight: 500;
}

.category-amount {
  font-family: 'Space Mono', monospace;
  font-size: 13px;
  color: #000;
  min-width: 80px;
  text-align: right;
  font-weight: 700;
}

.category-pct {
  font-family: 'Space Mono', monospace;
  font-size: 13px;
  color: #000;
  font-weight: 700;
  min-width: 42px;
  text-align: right;
}

.cat-progress {
  border-radius: 4px;
}

:deep(.el-progress-bar__outer) {
  border-radius: 4px;
  background: #E5E5E5;
  border: 1px solid #000;
}
:deep(.el-progress-bar__inner) {
  border-radius: 4px;
  background: #7EC8E3;
}
</style>

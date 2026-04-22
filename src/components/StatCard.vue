<template>
  <div class="stat-card">
    <div class="stat-label">{{ label }}</div>
    <div class="stat-amount" :class="amountClass">{{ displayAmount }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatAmount, formatBalance } from '../utils/format.js'

const props = defineProps({
  label: { type: String, required: true },
  amount: { type: Number, default: 0 },
  // 'expense' | 'income' | 'neutral'
  color: { type: String, default: 'neutral' },
  // 结余卡片：负数显示负号
  isBalance: { type: Boolean, default: false }
})

const displayAmount = computed(() => {
  if (props.isBalance) return formatBalance(props.amount)
  return formatAmount(props.amount)
})

const amountClass = computed(() => {
  if (props.color === 'expense') return 'amount-expense'
  if (props.color === 'income') return 'amount-income'
  return 'amount-neutral'
})
</script>

<style scoped>
.stat-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-label {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.stat-amount {
  font-family: 'DIN Alternate', 'Roboto Mono', monospace;
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -0.5px;
  line-height: 1;
}

.amount-expense { color: #ef4444; }
.amount-income  { color: #10b981; }
.amount-neutral { color: #1e293b; }
</style>

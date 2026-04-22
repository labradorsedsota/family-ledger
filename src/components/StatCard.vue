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
  border-radius: 8px;
  border: 2px solid #000;
  box-shadow: 4px 4px 0 #000;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.15s ease;
}

.stat-card:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 #000;
}

.stat-label {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 14px;
  color: #000;
  font-weight: 700;
}

.stat-amount {
  font-family: 'Space Mono', monospace;
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -0.5px;
  line-height: 1;
}

.amount-expense { color: #FF6B9D; }
.amount-income  { color: #000; }
.amount-neutral { color: #000; }
</style>

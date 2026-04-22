<template>
  <div class="app">
    <div class="container">
      <AppHeader
        :current-month="currentMonth"
        @prev-month="prevMonth"
        @next-month="nextMonth"
      />

      <!-- 统计看板 Bento Grid -->
      <section class="stats-grid">
        <StatCard
          class="card-expense"
          label="本月支出"
          :amount="totalExpense"
          color="expense"
        />
        <StatCard
          class="card-income"
          label="本月收入"
          :amount="totalIncome"
          color="income"
        />
        <BudgetCard
          class="card-budget"
          :total-expense="totalExpense"
          @setup="showBudgetDialog = true"
        />
        <StatCard
          class="card-balance"
          label="本月结余"
          :amount="balance"
          :color="balance >= 0 ? 'income' : 'expense'"
          :is-balance="true"
        />
        <CategoryStats
          class="card-category"
          :stats="categoryStats"
        />
      </section>

      <!-- 操作区（表单 + 账单列表） -->
      <section class="action-grid">
        <RecordForm @record-added="handleRecordAdded" />
        <RecordList
          :grouped-records="groupedRecords"
          @edit="openEditDialog"
        />
      </section>

      <!-- 月度趋势 -->
      <section class="trend-section">
        <MonthlyTrend :trend-data="trendData" />
      </section>
    </div>

    <!-- 编辑弹窗 -->
    <EditDialog
      v-model:visible="showEditDialog"
      :record="editingRecord"
      @saved="handleEditSaved"
    />

    <!-- 预算设置弹窗 -->
    <BudgetDialog
      v-model:visible="showBudgetDialog"
      @saved="showBudgetDialog = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElNotification } from 'element-plus'

import AppHeader from './components/AppHeader.vue'
import StatCard from './components/StatCard.vue'
import BudgetCard from './components/BudgetCard.vue'
import CategoryStats from './components/CategoryStats.vue'
import RecordForm from './components/RecordForm.vue'
import RecordList from './components/RecordList.vue'
import EditDialog from './components/EditDialog.vue'
import BudgetDialog from './components/BudgetDialog.vue'
import MonthlyTrend from './components/MonthlyTrend.vue'

import { useRecords } from './composables/useRecords.js'
import { useBudget } from './composables/useBudget.js'
import {
  getCurrentMonth,
  getPrevMonth,
  getNextMonth,
  getRecentMonths,
  isInMonth,
  sumAmounts,
  formatDate
} from './utils/format.js'

const { records, deleteRecord } = useRecords()
const { budget, getBudgetProgress } = useBudget()

const currentMonth = ref(getCurrentMonth())
const showEditDialog = ref(false)
const showBudgetDialog = ref(false)
const editingRecord = ref(null)

// ── 月度统计（直接在 App.vue 用 records ref 计算，避免嵌套 computed 问题）──
const monthRecords = computed(() =>
  records.value.filter(r => isInMonth(r.date, currentMonth.value))
)
const monthExpenses = computed(() => monthRecords.value.filter(r => r.type === 'expense'))
const monthIncomes = computed(() => monthRecords.value.filter(r => r.type === 'income'))

const totalExpense = computed(() => sumAmounts(monthExpenses.value))
const totalIncome = computed(() => sumAmounts(monthIncomes.value))
const balance = computed(() => Number((totalIncome.value - totalExpense.value).toFixed(2)))

// 分类支出占比
const categoryStats = computed(() => {
  const total = totalExpense.value
  if (total === 0) return []

  const map = {}
  monthExpenses.value.forEach(r => {
    map[r.category] = (map[r.category] || 0) + Number(r.amount)
  })

  return Object.entries(map)
    .map(([code, amount]) => ({
      code,
      amount: Number(amount.toFixed(2)),
      percentage: Number(((amount / total) * 100).toFixed(1))
    }))
    .sort((a, b) => b.amount - a.amount)
})

// 按日期分组的账单列表
const groupedRecords = computed(() => {
  const sorted = [...monthRecords.value].sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date)
    return b.createdAt - a.createdAt
  })

  const groups = {}
  sorted.forEach(r => {
    if (!groups[r.date]) groups[r.date] = []
    groups[r.date].push(r)
  })

  return Object.entries(groups)
    .map(([date, items]) => {
      const expenses = items.filter(r => r.type === 'expense')
      const incomes = items.filter(r => r.type === 'income')
      return {
        date,
        items,
        totalExpense: sumAmounts(expenses),
        totalIncome: sumAmounts(incomes)
      }
    })
    .sort((a, b) => b.date.localeCompare(a.date))
})

// 月度趋势（最近 6 个月中有数据的月份，空月填 0）
const trendData = computed(() => {
  const allMonths = getRecentMonths(6)
  const currentMonthStr = getCurrentMonth()

  const dataMonths = new Set(records.value.map(r => r.date.substring(0, 7)))

  if (dataMonths.size === 0) {
    return [{ month: currentMonthStr, totalExpense: 0, totalIncome: 0, balance: 0 }]
  }

  const firstDataMonth = allMonths.find(m => dataMonths.has(m))
  if (!firstDataMonth) {
    return [{ month: currentMonthStr, totalExpense: 0, totalIncome: 0, balance: 0 }]
  }

  const startIdx = allMonths.indexOf(firstDataMonth)
  const endIdx = allMonths.indexOf(currentMonthStr)
  const monthsToShow = allMonths.slice(startIdx, endIdx + 1)

  return monthsToShow.map(monthStr => {
    const mRecords = records.value.filter(r => isInMonth(r.date, monthStr))
    const mExpenses = mRecords.filter(r => r.type === 'expense')
    const mIncomes = mRecords.filter(r => r.type === 'income')
    const mExpenseTotal = sumAmounts(mExpenses)
    const mIncomeTotal = sumAmounts(mIncomes)
    return {
      month: monthStr,
      totalExpense: mExpenseTotal,
      totalIncome: mIncomeTotal,
      balance: Number((mIncomeTotal - mExpenseTotal).toFixed(2))
    }
  })
})

// 预算进度
const budgetProgress = computed(() => getBudgetProgress(totalExpense.value).value)

// ── 超预算 Notification（每次打开页面最多一次）──
let overBudgetShown = false
watch(
  () => budgetProgress.value.isOverBudget,
  (isOver) => {
    if (isOver && !overBudgetShown) {
      overBudgetShown = true
      ElNotification({
        title: '超预算提醒',
        message: '本月支出已超预算！',
        type: 'error',
        duration: 5000
      })
    }
  },
  { immediate: true }
)

// ── 月份切换 ──
function prevMonth() {
  currentMonth.value = getPrevMonth(currentMonth.value)
}
function nextMonth() {
  currentMonth.value = getNextMonth(currentMonth.value)
}

// ── 记录操作 ──
function handleRecordAdded() {
  // records 是响应式的，自动刷新
}

function openEditDialog(record) {
  editingRecord.value = { ...record }
  showEditDialog.value = true
}

function handleEditSaved() {
  showEditDialog.value = false
  editingRecord.value = null
}
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #1e293b;
  min-width: 900px;
}

.app {
  min-height: 100vh;
  background: #f8fafc;
  padding: 24px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

/* ── 统计 Bento Grid ── */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1.5fr;
  grid-template-rows: auto auto;
  gap: 16px;
  margin-bottom: 16px;
}

.card-expense { grid-column: 1; grid-row: 1; }
.card-income  { grid-column: 2; grid-row: 1; }
.card-budget  { grid-column: 3; grid-row: 1 / 3; }
.card-balance { grid-column: 1; grid-row: 2; }
.card-category { grid-column: 2; grid-row: 2; }

/* ── 操作区 ── */
.action-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 16px;
  margin-bottom: 16px;
}

/* ── 趋势区 ── */
.trend-section {
  margin-bottom: 24px;
}
</style>

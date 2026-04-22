import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { sumAmounts, isInMonth, getRecentMonths } from '../utils/format.js'
import { ElMessage, ElNotification } from 'element-plus'

const STORAGE_KEY = 'feb_records'

// 全局共享的记录数据
const records = ref([])
let initialized = false

// 从 localStorage 加载数据
function loadRecords() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      const parsed = JSON.parse(data)
      if (Array.isArray(parsed)) {
        // 过滤损坏的记录
        const valid = parsed.filter(r =>
          r && r.id && r.type && r.amount && r.category && r.date
        )
        if (valid.length < parsed.length) {
          ElMessage.warning('部分数据异常已跳过')
        }
        records.value = valid
      }
    }
  } catch (e) {
    ElMessage.error('数据读取失败，请刷新页面')
    records.value = []
  }
}

// 保存到 localStorage
function saveRecords() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records.value))
    return true
  } catch (e) {
    ElNotification.error({
      title: '存储失败',
      message: '存储空间已满，请清理旧数据后重试',
      duration: 5000
    })
    return false
  }
}

export function useRecords() {
  // 初始化加载
  if (!initialized) {
    loadRecords()
    initialized = true
  }

  // 添加记录
  function addRecord(data) {
    const now = Date.now()
    const record = {
      id: uuidv4(),
      type: data.type,
      amount: Number(Number(data.amount).toFixed(2)),
      category: data.category,
      date: data.date,
      note: data.note || '',
      createdAt: now,
      updatedAt: now
    }
    records.value.push(record)
    if (saveRecords()) {
      return record
    }
    // 回滚
    records.value.pop()
    return null
  }

  // 更新记录
  function updateRecord(id, data) {
    const index = records.value.findIndex(r => r.id === id)
    if (index === -1) return false

    const old = records.value[index]
    records.value[index] = {
      ...old,
      type: data.type,
      amount: Number(Number(data.amount).toFixed(2)),
      category: data.category,
      date: data.date,
      note: data.note || '',
      updatedAt: Date.now()
    }

    if (saveRecords()) {
      return true
    }
    // 回滚
    records.value[index] = old
    return false
  }

  // 删除记录
  function deleteRecord(id) {
    const index = records.value.findIndex(r => r.id === id)
    if (index === -1) return false

    const old = records.value[index]
    records.value.splice(index, 1)

    if (saveRecords()) {
      return true
    }
    // 回滚
    records.value.splice(index, 0, old)
    return false
  }

  // 获取某月的记录
  function getMonthRecords(monthStr) {
    return computed(() => {
      return records.value.filter(r => isInMonth(r.date, monthStr))
    })
  }

  // 计算某月的统计数据
  function getMonthStats(monthStr) {
    return computed(() => {
      const monthRecords = records.value.filter(r => isInMonth(r.date, monthStr))
      const expenses = monthRecords.filter(r => r.type === 'expense')
      const incomes = monthRecords.filter(r => r.type === 'income')

      const totalExpense = sumAmounts(expenses)
      const totalIncome = sumAmounts(incomes)
      const balance = Number((totalIncome - totalExpense).toFixed(2))

      return {
        totalExpense,
        totalIncome,
        balance
      }
    })
  }

  // 获取某月各分类支出统计
  function getCategoryStats(monthStr) {
    return computed(() => {
      const monthRecords = records.value.filter(
        r => isInMonth(r.date, monthStr) && r.type === 'expense'
      )

      // 按分类汇总
      const categoryMap = {}
      monthRecords.forEach(r => {
        if (!categoryMap[r.category]) {
          categoryMap[r.category] = 0
        }
        categoryMap[r.category] += Number(r.amount)
      })

      // 计算总额
      const total = sumAmounts(monthRecords)

      // 转换为数组并排序
      const result = Object.entries(categoryMap)
        .map(([code, amount]) => ({
          code,
          amount: Number(amount.toFixed(2)),
          percentage: total > 0 ? Number(((amount / total) * 100).toFixed(1)) : 0
        }))
        .sort((a, b) => b.amount - a.amount)

      return result
    })
  }

  // 获取按日期分组的记录（用于列表）
  function getGroupedRecords(monthStr) {
    return computed(() => {
      const monthRecords = records.value
        .filter(r => isInMonth(r.date, monthStr))
        .sort((a, b) => {
          // 先按日期降序，同日按创建时间降序
          if (a.date !== b.date) {
            return b.date.localeCompare(a.date)
          }
          return b.createdAt - a.createdAt
        })

      // 按日期分组
      const groups = {}
      monthRecords.forEach(r => {
        if (!groups[r.date]) {
          groups[r.date] = []
        }
        groups[r.date].push(r)
      })

      // 计算每组的小计
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
  }

  // 获取趋势数据（最近6个月）
  function getTrendData() {
    return computed(() => {
      const months = getRecentMonths(6)
      const result = []

      months.forEach(monthStr => {
        const monthRecords = records.value.filter(r => isInMonth(r.date, monthStr))
        if (monthRecords.length === 0 && result.length === 0) {
          // 如果没有数据且还没有开始统计，跳过
          return
        }

        const expenses = monthRecords.filter(r => r.type === 'expense')
        const incomes = monthRecords.filter(r => r.type === 'income')

        const totalExpense = sumAmounts(expenses)
        const totalIncome = sumAmounts(incomes)
        const balance = Number((totalIncome - totalExpense).toFixed(2))

        result.push({
          month: monthStr,
          totalExpense,
          totalIncome,
          balance
        })
      })

      // 如果完全没有数据，至少返回当月
      if (result.length === 0) {
        const currentMonth = months[months.length - 1]
        result.push({
          month: currentMonth,
          totalExpense: 0,
          totalIncome: 0,
          balance: 0
        })
      }

      return result
    })
  }

  return {
    records,
    addRecord,
    updateRecord,
    deleteRecord,
    getMonthRecords,
    getMonthStats,
    getCategoryStats,
    getGroupedRecords,
    getTrendData
  }
}

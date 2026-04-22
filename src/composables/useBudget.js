import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const STORAGE_KEY = 'feb_budget'

// 全局共享的预算数据
const budget = ref(null)
let initialized = false

// 从 localStorage 加载预算
function loadBudget() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      const parsed = JSON.parse(data)
      if (typeof parsed === 'number' && parsed > 0) {
        budget.value = parsed
      }
    }
  } catch (e) {
    console.error('预算数据读取失败', e)
    budget.value = null
  }
}

// 保存预算到 localStorage
function saveBudget() {
  try {
    if (budget.value && budget.value > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(budget.value))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
    return true
  } catch (e) {
    ElMessage.error('预算保存失败')
    return false
  }
}

export function useBudget() {
  // 初始化加载
  if (!initialized) {
    loadBudget()
    initialized = true
  }

  // 设置预算
  function setBudget(amount) {
    const oldValue = budget.value

    if (amount <= 0) {
      // 预算为0等同于清除预算
      budget.value = null
    } else {
      budget.value = Number(Number(amount).toFixed(2))
    }

    if (saveBudget()) {
      return true
    }

    // 回滚
    budget.value = oldValue
    return false
  }

  // 计算预算进度
  function getBudgetProgress(totalExpense) {
    return computed(() => {
      if (!budget.value || budget.value <= 0) {
        return {
          hasBudget: false,
          percentage: 0,
          used: 0,
          total: 0,
          isOverBudget: false,
          isWarning: false
        }
      }

      const percentage = Number(((totalExpense / budget.value) * 100).toFixed(1))

      return {
        hasBudget: true,
        percentage: Math.min(percentage, 100),
        actualPercentage: percentage,
        used: totalExpense,
        total: budget.value,
        isOverBudget: totalExpense > budget.value,
        isWarning: percentage >= 80 && percentage < 100
      }
    })
  }

  return {
    budget,
    setBudget,
    getBudgetProgress
  }
}

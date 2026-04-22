// 支出分类（8 类）
export const EXPENSE_CATEGORIES = [
  { code: 'food', name: '餐饮', icon: '🍽️' },
  { code: 'transport', name: '交通', icon: '🚗' },
  { code: 'shopping', name: '购物', icon: '🛒' },
  { code: 'housing', name: '居住', icon: '🏠' },
  { code: 'entertainment', name: '娱乐', icon: '🎮' },
  { code: 'medical', name: '医疗', icon: '🏥' },
  { code: 'education', name: '教育', icon: '📚' },
  { code: 'other_expense', name: '其他', icon: '📦' }
]

// 收入分类（4 类）
export const INCOME_CATEGORIES = [
  { code: 'salary', name: '工资', icon: '💰' },
  { code: 'bonus', name: '奖金', icon: '🎁' },
  { code: 'investment', name: '投资', icon: '📈' },
  { code: 'other_income', name: '其他', icon: '💵' }
]

// 根据类型获取分类列表
export function getCategoriesByType(type) {
  return type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
}

// 根据分类 code 获取分类信息
export function getCategoryByCode(code) {
  const all = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]
  return all.find(c => c.code === code) || { code, name: code, icon: '📦' }
}

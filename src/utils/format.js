// 格式化金额：¥X,XXX.XX（千分位）
export function formatAmount(amount) {
  const num = Number(amount) || 0
  const fixed = num.toFixed(2)
  const parts = fixed.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return '¥' + parts.join('.')
}

// 汇总计算：先累加后 toFixed(2)
export function sumAmounts(records) {
  const sum = records.reduce((acc, r) => acc + Number(r.amount), 0)
  return Number(sum.toFixed(2))
}

// 格式化日期为 YYYY-MM-DD
export function formatDate(date) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 获取日期的中文显示，如"4月22日（周二）"
export function formatDateDisplay(dateStr) {
  const d = new Date(dateStr)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  const weekday = weekdays[d.getDay()]
  return `${month}月${day}日（周${weekday}）`
}

// 获取当前月份 YYYY-MM
export function getCurrentMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

// 获取月份显示文本，如"2026年4月"
export function formatMonthDisplay(monthStr) {
  const [year, month] = monthStr.split('-')
  return `${year}年${Number(month)}月`
}

// 判断日期是否属于指定月份
export function isInMonth(dateStr, monthStr) {
  return dateStr.startsWith(monthStr)
}

// 获取上一个月
export function getPrevMonth(monthStr) {
  const [year, month] = monthStr.split('-').map(Number)
  if (month === 1) {
    return `${year - 1}-12`
  }
  return `${year}-${String(month - 1).padStart(2, '0')}`
}

// 获取下一个月
export function getNextMonth(monthStr) {
  const [year, month] = monthStr.split('-').map(Number)
  if (month === 12) {
    return `${year + 1}-01`
  }
  return `${year}-${String(month + 1).padStart(2, '0')}`
}

// 获取最近 N 个月的月份列表（含当月）
export function getRecentMonths(count = 6) {
  const months = []
  let current = getCurrentMonth()
  for (let i = 0; i < count; i++) {
    months.unshift(current)
    current = getPrevMonth(current)
  }
  return months
}

// 判断日期是否是今天
export function isToday(dateStr) {
  return dateStr === formatDate(new Date())
}

// 判断日期是否是昨天
export function isYesterday(dateStr) {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return dateStr === formatDate(yesterday)
}

// 格式化结余（负数加负号前缀，在 ¥ 前面）
export function formatBalance(amount) {
  const num = Number(amount)
  if (num < 0) {
    return '-' + formatAmount(Math.abs(num))
  }
  return formatAmount(num)
}

// 格式化记录金额（支出加负号，收入加正号）
export function formatRecordAmount(amount, type) {
  const formatted = formatAmount(Number(amount))
  return type === 'expense' ? '-' + formatted : '+' + formatted
}

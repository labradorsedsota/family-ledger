<template>
  <div class="record-list-card">
    <div class="card-title">账单列表</div>

    <!-- 空状态 -->
    <el-empty
      v-if="groupedRecords.length === 0"
      description="还没有记账记录，开始记第一笔吧"
      :image-size="80"
    />

    <!-- 账单折叠面板 -->
    <el-collapse v-else v-model="activeNames" class="bill-collapse">
      <el-collapse-item
        v-for="group in groupedRecords"
        :key="group.date"
        :name="group.date"
      >
        <template #title>
          <div class="group-title">
            <span class="group-date">{{ formatDateDisplay(group.date) }}</span>
            <span v-if="group.totalExpense > 0" class="group-expense">
              支出 <strong>{{ formatAmount(group.totalExpense) }}</strong>
            </span>
            <span v-if="group.totalIncome > 0" class="group-income">
              收入 <strong>{{ formatAmount(group.totalIncome) }}</strong>
            </span>
          </div>
        </template>

        <!-- 每条记录 -->
        <div
          v-for="record in group.items"
          :key="record.id"
          class="record-item"
        >
          <div class="record-main">
            <span class="record-icon">{{ getCategory(record.category).icon }}</span>
            <div class="record-info">
              <span class="record-category">{{ getCategory(record.category).name }}</span>
              <span v-if="record.note" class="record-note">{{ record.note }}</span>
            </div>
          </div>
          <div class="record-right">
            <span
              class="record-amount"
              :class="record.type === 'expense' ? 'amount-expense' : 'amount-income'"
            >
              {{ formatRecordAmount(record.amount, record.type) }}
            </span>
            <div class="record-actions">
              <el-button
                :icon="Edit"
                size="small"
                circle
                @click.stop="$emit('edit', record)"
              />
              <el-button
                :icon="Delete"
                size="small"
                circle
                type="danger"
                plain
                @click.stop="handleDelete(record)"
              />
            </div>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Edit, Delete } from '@element-plus/icons-vue'
import { getCategoryByCode } from '../constants/categories.js'
import { formatDateDisplay, formatAmount, formatRecordAmount, formatDate } from '../utils/format.js'
import { useRecords } from '../composables/useRecords.js'

const props = defineProps({
  groupedRecords: { type: Array, default: () => [] }
})

const emit = defineEmits(['edit'])

const { deleteRecord } = useRecords()

const today = formatDate(new Date())
const yesterday = (() => {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return formatDate(d)
})()

// 默认展开今天和昨天
const activeNames = ref([today, yesterday])

// 当列表变化时（切换月份），重置展开状态
watch(() => props.groupedRecords, (groups) => {
  const dates = groups.map(g => g.date)
  activeNames.value = [today, yesterday].filter(d => dates.includes(d))
})

function getCategory(code) {
  return getCategoryByCode(code)
}

async function handleDelete(record) {
  try {
    await ElMessageBox.confirm('确定删除这条记录吗？', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    })
    const success = deleteRecord(record.id)
    if (success) {
      ElMessage.success('删除成功')
    }
  } catch {
    // 取消删除
  }
}
</script>

<style scoped>
.record-list-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 300px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

/* ── 折叠面板样式 ── */
.bill-collapse {
  border: none;
}

:deep(.el-collapse-item__header) {
  background: #f8fafc;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  border: none;
  height: auto;
  line-height: 1.4;
}

:deep(.el-collapse-item__wrap) {
  border: none;
}

:deep(.el-collapse-item__content) {
  padding: 4px 0 4px 0;
}

:deep(.el-collapse-item) {
  border: none;
  margin-bottom: 4px;
}

.group-title {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.group-date {
  color: #1e293b;
  font-weight: 600;
  font-size: 14px;
}

.group-expense {
  font-size: 13px;
  color: #64748b;
  font-weight: 400;
}

.group-expense strong { color: #ef4444; }

.group-income {
  font-size: 13px;
  color: #64748b;
  font-weight: 400;
}

.group-income strong { color: #10b981; }

/* ── 记录行 ── */
.record-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 8px;
  transition: background 0.15s;
}

.record-item:hover {
  background: #f8fafc;
}

.record-main {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.record-icon {
  font-size: 20px;
  line-height: 1;
  flex-shrink: 0;
}

.record-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.record-category {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
}

.record-note {
  font-size: 12px;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.record-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.record-amount {
  font-family: 'DIN Alternate', 'Roboto Mono', monospace;
  font-size: 16px;
  font-weight: 500;
  min-width: 90px;
  text-align: right;
}

.amount-expense { color: #ef4444; }
.amount-income  { color: #10b981; }

.record-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.15s;
}

.record-item:hover .record-actions {
  opacity: 1;
}
</style>

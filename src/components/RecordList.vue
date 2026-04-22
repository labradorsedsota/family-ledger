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
  border-radius: 8px;
  border: 2px solid #000;
  box-shadow: 4px 4px 0 #000;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 300px;
}

.card-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 18px;
  font-weight: 800;
  color: #000;
}

/* ── 折叠面板样式 ── */
.bill-collapse {
  border: none;
}

:deep(.el-collapse-item__header) {
  background: #FFFDF0;
  border-radius: 6px;
  padding: 8px 12px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #000;
  border: none;
  border-bottom: 2px solid #000;
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
  margin-bottom: 8px;
}

.group-title {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.group-date {
  font-family: 'Space Grotesk', sans-serif;
  color: #000;
  font-weight: 700;
  font-size: 14px;
}

.group-expense {
  font-size: 13px;
  color: #000;
  font-weight: 500;
}

.group-expense strong {
  font-family: 'Space Mono', monospace;
  color: #FF6B9D;
}

.group-income {
  font-size: 13px;
  color: #000;
  font-weight: 500;
}

.group-income strong {
  font-family: 'Space Mono', monospace;
  color: #000;
}

/* ── 记录行 ── */
.record-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 6px;
  border: 2px solid transparent;
  transition: all 0.15s ease;
}

.record-item:hover {
  background: #FFFDF0;
  border-color: #000;
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
  font-family: 'Space Grotesk', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #000;
}

.record-note {
  font-size: 12px;
  color: #555;
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
  font-family: 'Space Mono', monospace;
  font-size: 16px;
  font-weight: 700;
  min-width: 90px;
  text-align: right;
}

.amount-expense { color: #FF6B9D; }
.amount-income  { color: #000; }

.record-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.15s;
}

.record-item:hover .record-actions {
  opacity: 1;
}

:deep(.el-button.is-circle) {
  border: 2px solid #000 !important;
  box-shadow: 2px 2px 0 #000;
  transition: all 0.15s ease;
}

:deep(.el-button.is-circle:hover) {
  transform: translate(2px, 2px);
  box-shadow: none !important;
}
</style>

<template>
  <el-dialog
    v-model="dialogVisible"
    title="编辑账单"
    width="480px"
    :close-on-click-modal="false"
    :before-close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
    >
      <el-form-item label="类型">
        <el-radio-group v-model="form.type" @change="handleTypeChange">
          <el-radio value="expense">支出</el-radio>
          <el-radio value="income">收入</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="金额" prop="amount">
        <el-input-number
          v-model="form.amount"
          :min="0"
          :max="9999999.99"
          :precision="2"
          :controls="false"
          placeholder="请输入金额"
          class="full-width"
        />
      </el-form-item>

      <el-form-item label="分类" prop="category">
        <el-select v-model="form.category" placeholder="请选择分类" class="full-width">
          <el-option
            v-for="cat in categories"
            :key="cat.code"
            :label="`${cat.icon} ${cat.name}`"
            :value="cat.code"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="日期" prop="date">
        <el-date-picker
          v-model="form.date"
          type="date"
          placeholder="选择日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          :disabled-date="disabledDate"
          class="full-width"
        />
      </el-form-item>

      <el-form-item label="备注" prop="note">
        <el-input
          v-model="form.note"
          placeholder="备注（选填）"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getCategoriesByType } from '../constants/categories.js'
import { useRecords } from '../composables/useRecords.js'

const props = defineProps({
  visible: { type: Boolean, default: false },
  record: { type: Object, default: null }
})

const emit = defineEmits(['update:visible', 'saved'])

const { updateRecord } = useRecords()

const formRef = ref(null)
const saving = ref(false)

const form = reactive({
  type: 'expense',
  amount: null,
  category: '',
  date: '',
  note: ''
})

const categories = computed(() => getCategoriesByType(form.type))

// 当 record prop 变化时填充表单
watch(() => props.record, (record) => {
  if (record) {
    form.type = record.type
    form.amount = record.amount
    form.category = record.category
    form.date = record.date
    form.note = record.note || ''
  }
}, { immediate: true })

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const validateAmount = (rule, value, callback) => {
  if (value === null || value === undefined || value === '') {
    callback(new Error('请输入金额'))
  } else if (value <= 0) {
    callback(new Error('金额必须大于 0'))
  } else if (value > 9999999.99) {
    callback(new Error('金额不能超过 9,999,999.99'))
  } else {
    callback()
  }
}

const rules = {
  amount: [{ validator: validateAmount, trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  date: [{ required: true, message: '请选择日期', trigger: 'change' }],
  note: [{ max: 50, message: '备注最多 50 个字符', trigger: 'blur' }]
}

function handleTypeChange() {
  form.category = ''
}

function disabledDate(date) {
  return date > new Date()
}

function handleClose() {
  formRef.value?.clearValidate()
  emit('update:visible', false)
}

async function handleSave() {
  if (saving.value) return
  try {
    const valid = await formRef.value.validate()
    if (!valid) return

    saving.value = true
    const success = updateRecord(props.record.id, {
      type: form.type,
      amount: form.amount,
      category: form.category,
      date: form.date,
      note: form.note
    })

    if (success) {
      ElMessage.success('修改成功')
      emit('saved')
    }
  } catch {
    // 校验失败
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.full-width {
  width: 100%;
}

:deep(.el-dialog) {
  border-radius: 12px;
}

:deep(.el-radio.is-checked .el-radio__inner) {
  background-color: #2563eb;
  border-color: #2563eb;
}

:deep(.el-radio.is-checked .el-radio__label) {
  color: #2563eb;
}

:deep(.el-input__wrapper),
:deep(.el-select__wrapper),
:deep(.el-input-number) {
  border-radius: 8px;
}
</style>

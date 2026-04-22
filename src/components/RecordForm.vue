<template>
  <div class="record-form-card">
    <h3 class="card-title">记一笔</h3>
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      @submit.prevent="handleSubmit"
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
          class="amount-input"
          @blur="validateAmount"
        />
      </el-form-item>

      <el-form-item label="分类" prop="category">
        <el-select v-model="form.category" placeholder="请选择分类" class="category-select">
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
          class="date-picker"
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

      <el-form-item>
        <el-button
          type="primary"
          class="submit-btn"
          :disabled="submitting"
          @click="handleSubmit"
        >
          记一笔
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { getCategoriesByType } from '../constants/categories.js'
import { formatDate } from '../utils/format.js'
import { useRecords } from '../composables/useRecords.js'

const emit = defineEmits(['record-added'])

const { addRecord } = useRecords()

const formRef = ref(null)
const submitting = ref(false)

const form = reactive({
  type: 'expense',
  amount: null,
  category: '',
  date: formatDate(new Date()),
  note: ''
})

const categories = computed(() => getCategoriesByType(form.type))

const validateAmountValue = (rule, value, callback) => {
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
  amount: [
    { validator: validateAmountValue, trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ],
  date: [
    { required: true, message: '请选择日期', trigger: 'change' }
  ],
  note: [
    { max: 50, message: '备注最多 50 个字符', trigger: 'blur' }
  ]
}

function handleTypeChange() {
  // 切换类型时清空分类选择
  form.category = ''
}

function validateAmount() {
  if (form.amount > 9999999.99) {
    form.amount = 9999999.99
  }
}

function disabledDate(date) {
  // 不可选未来日期
  return date > new Date()
}

function resetForm() {
  form.amount = null
  form.category = ''
  form.date = formatDate(new Date())
  form.note = ''
  // 保持类型不变
  formRef.value?.clearValidate()
}

async function handleSubmit() {
  if (submitting.value) return

  try {
    const valid = await formRef.value.validate()
    if (!valid) return

    submitting.value = true

    const record = addRecord({
      type: form.type,
      amount: form.amount,
      category: form.category,
      date: form.date,
      note: form.note
    })

    if (record) {
      ElMessage.success('记账成功')
      resetForm()
      emit('record-added', record)
    }
  } catch (e) {
    // 校验失败
  } finally {
    // 防重复提交，1秒后解锁
    setTimeout(() => {
      submitting.value = false
    }, 1000)
  }
}
</script>

<style scoped>
.record-form-card {
  background: #fff;
  border-radius: 8px;
  border: 2px solid #000;
  box-shadow: 4px 4px 0 #000;
  padding: 20px;
}

.card-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 18px;
  font-weight: 800;
  color: #000;
  margin: 0 0 20px 0;
}

.amount-input {
  width: 100%;
}

.category-select {
  width: 100%;
}

.date-picker {
  width: 100%;
}

.submit-btn {
  width: 100%;
  height: 40px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 16px;
  font-weight: 700;
  background-color: #000 !important;
  border-color: #000 !important;
  color: #FFE156 !important;
  border-radius: 6px !important;
  box-shadow: 3px 3px 0 #555;
  transition: all 0.15s ease;
}

.submit-btn:hover {
  transform: translate(3px, 3px);
  box-shadow: none !important;
}

:deep(.el-radio-group) {
  display: flex;
  gap: 20px;
}

:deep(.el-radio__inner) {
  border-color: #000;
}

:deep(.el-radio.is-checked .el-radio__inner) {
  background-color: #000;
  border-color: #000;
}

:deep(.el-radio.is-checked .el-radio__label) {
  color: #000;
  font-weight: 700;
}

:deep(.el-input__wrapper),
:deep(.el-select__wrapper),
:deep(.el-input-number) {
  border-radius: 6px;
  box-shadow: 2px 2px 0 #000 !important;
  border: 2px solid #000 !important;
}

:deep(.el-input__wrapper:hover),
:deep(.el-select__wrapper:hover) {
  box-shadow: 2px 2px 0 #000 !important;
}

:deep(.el-input-number .el-input__wrapper) {
  padding-left: 11px;
  padding-right: 11px;
}

:deep(.el-form-item__label) {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  color: #000;
}
</style>

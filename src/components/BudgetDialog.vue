<template>
  <el-dialog
    v-model="dialogVisible"
    title="设置月预算"
    width="400px"
    :close-on-click-modal="false"
    :before-close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
    >
      <el-form-item label="月预算金额（元）" prop="amount">
        <el-input-number
          v-model="form.amount"
          :min="0"
          :max="9999999.99"
          :precision="2"
          :controls="false"
          placeholder="请输入月预算金额，0 表示清除预算"
          class="full-width"
        />
      </el-form-item>
      <div class="hint">提示：输入 0 等同于清除预算</div>
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
import { useBudget } from '../composables/useBudget.js'

const props = defineProps({
  visible: { type: Boolean, default: false }
})

const emit = defineEmits(['update:visible', 'saved'])

const { budget, setBudget } = useBudget()
const formRef = ref(null)
const saving = ref(false)

const form = reactive({ amount: null })

// 打开时预填已有预算
watch(() => props.visible, (val) => {
  if (val) {
    form.amount = budget.value || null
    formRef.value?.clearValidate()
  }
})

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const validateAmount = (rule, value, callback) => {
  if (value === null || value === undefined || value === '') {
    callback(new Error('请输入金额'))
  } else if (value < 0) {
    callback(new Error('预算金额不能为负数'))
  } else if (value > 9999999.99) {
    callback(new Error('金额不能超过 9,999,999.99'))
  } else {
    callback()
  }
}

const rules = {
  amount: [{ validator: validateAmount, trigger: 'blur' }]
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
    const success = setBudget(form.amount || 0)
    if (success) {
      if (!form.amount || form.amount <= 0) {
        ElMessage.success('预算已清除')
      } else {
        ElMessage.success('预算设置成功')
      }
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

.hint {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 12px;
  color: #555;
  font-weight: 500;
  margin-top: -8px;
}

:deep(.el-dialog) {
  border-radius: 8px;
  border: 2px solid #000;
  box-shadow: 6px 6px 0 #000;
}

:deep(.el-dialog__title) {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 800;
  color: #000;
}

:deep(.el-input__wrapper),
:deep(.el-input-number) {
  border-radius: 6px;
  box-shadow: 2px 2px 0 #000 !important;
  border: 2px solid #000 !important;
}

:deep(.el-form-item__label) {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  color: #000;
}

:deep(.el-button--primary) {
  background-color: #000 !important;
  border-color: #000 !important;
  color: #FFE156 !important;
  border-radius: 6px !important;
  box-shadow: 3px 3px 0 #555;
  font-weight: 700;
  transition: all 0.15s ease;
}

:deep(.el-button--primary:hover) {
  transform: translate(3px, 3px);
  box-shadow: none !important;
}

:deep(.el-button--default) {
  border: 2px solid #000 !important;
  border-radius: 6px !important;
  box-shadow: 3px 3px 0 #000;
  color: #000;
  font-weight: 700;
  transition: all 0.15s ease;
}

:deep(.el-button--default:hover) {
  transform: translate(3px, 3px);
  box-shadow: none !important;
}
</style>

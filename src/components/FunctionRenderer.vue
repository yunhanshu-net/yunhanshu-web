<template>
  <div class="function-renderer">
    <template v-if="request">
      <el-form :model="formData" label-width="auto" class="function-form">
        <!-- 请求参数部分 -->
        <div class="section-title">请求参数</div>
        <el-form-item
          v-for="field in request.children"
          :key="field.code"
          :label="field.name"
          :required="field.required"
        >
          <template v-if="field.widget.widget === 'input'">
            <el-input
              v-model="formData[field.code]"
              :placeholder="field.widget.placeholder || `请输入${field.name}`"
              :type="field.widget.type || 'text'"
            />
          </template>

          <template v-else-if="field.widget.widget === 'textarea'">
            <el-input
              v-model="formData[field.code]"
              type="textarea"
              :rows="4"
              :placeholder="field.widget.placeholder || `请输入${field.name}`"
            />
          </template>

          <template v-else-if="field.widget.widget === 'select'">
            <el-select
              v-model="formData[field.code]"
              :placeholder="field.widget.placeholder || `请选择${field.name}`"
              style="width: 100%"
            >
              <el-option
                v-for="option in field.widget.options"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </template>

          <template v-else-if="field.widget.widget === 'radio'">
            <el-radio-group v-model="formData[field.code]">
              <el-radio
                v-for="option in field.widget.options"
                :key="option.value"
                :label="option.value"
              >
                {{ option.label }}
              </el-radio>
            </el-radio-group>
          </template>

          <template v-else-if="field.widget.widget === 'checkbox'">
            <el-checkbox-group v-model="formData[field.code]">
              <el-checkbox
                v-for="option in field.widget.options"
                :key="option.value"
                :label="option.value"
              >
                {{ option.label }}
              </el-checkbox>
            </el-checkbox-group>
          </template>

          <template v-else-if="field.widget.widget === 'switch'">
            <el-switch v-model="formData[field.code]" />
          </template>

          <template v-else-if="field.widget.widget === 'date'">
            <el-date-picker
              v-model="formData[field.code]"
              :type="field.widget.type || 'date'"
              :placeholder="field.widget.placeholder || `请选择${field.name}`"
              style="width: 100%"
            />
          </template>

          <template v-else-if="field.widget.widget === 'time'">
            <el-time-picker
              v-model="formData[field.code]"
              :placeholder="field.widget.placeholder || `请选择${field.name}`"
              style="width: 100%"
            />
          </template>

          <template v-else-if="field.widget.widget === 'datetime'">
            <el-date-picker
              v-model="formData[field.code]"
              type="datetime"
              :placeholder="field.widget.placeholder || `请选择${field.name}`"
              style="width: 100%"
            />
          </template>

          <template v-else-if="field.widget.widget === 'number'">
            <el-input-number
              v-model="formData[field.code]"
              :min="field.widget.number_limit ? JSON.parse(field.widget.number_limit)[0] : undefined"
              :max="field.widget.number_limit ? JSON.parse(field.widget.number_limit)[1] : undefined"
              :step="field.widget.step || 1"
              style="width: 100%"
            />
          </template>

          <template v-else-if="field.widget.widget === 'slider'">
            <el-slider
              v-model="formData[field.code]"
              :min="field.widget.number_limit ? JSON.parse(field.widget.number_limit)[0] : undefined"
              :max="field.widget.number_limit ? JSON.parse(field.widget.number_limit)[1] : undefined"
              :step="field.widget.step || 1"
            />
          </template>

          <template v-else-if="field.widget.widget === 'rate'">
            <el-rate
              v-model="formData[field.code]"
              :max="field.widget.max || 5"
              :allow-half="field.widget.allowHalf"
            />
          </template>

          <template v-else-if="field.widget.widget === 'color'">
            <el-color-picker v-model="formData[field.code]" />
          </template>

          <template v-else>
            <el-input
              v-model="formData[field.code]"
              :placeholder="field.widget.placeholder || `请输入${field.name}`"
            />
          </template>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" class="run-button">运行</el-button>
        </el-form-item>

        <!-- 响应参数部分 -->
        <div class="section-title">响应参数</div>
        <el-form-item
          v-for="field in response?.children"
          :key="field.code"
          :label="field.name"
        >
          <template v-if="field.widget.widget === 'input'">
            <el-input
              v-model="responseData[field.code]"
              :placeholder="field.widget.placeholder || `请输入${field.name}`"
              :type="field.widget.type || 'text'"
              disabled
            />
          </template>

          <template v-else-if="field.widget.widget === 'textarea'">
            <el-input
              v-model="responseData[field.code]"
              type="textarea"
              :rows="4"
              :placeholder="field.widget.placeholder || `请输入${field.name}`"
              disabled
            />
          </template>

          <template v-else-if="field.widget.widget === 'select'">
            <el-select
              v-model="responseData[field.code]"
              :placeholder="field.widget.placeholder || `请选择${field.name}`"
              style="width: 100%"
              disabled
            >
              <el-option
                v-for="option in field.widget.options"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </template>

          <template v-else-if="field.widget.widget === 'radio'">
            <el-radio-group v-model="responseData[field.code]" disabled>
              <el-radio
                v-for="option in field.widget.options"
                :key="option.value"
                :label="option.value"
              >
                {{ option.label }}
              </el-radio>
            </el-radio-group>
          </template>

          <template v-else-if="field.widget.widget === 'checkbox'">
            <el-checkbox-group v-model="responseData[field.code]" disabled>
              <el-checkbox
                v-for="option in field.widget.options"
                :key="option.value"
                :label="option.value"
              >
                {{ option.label }}
              </el-checkbox>
            </el-checkbox-group>
          </template>

          <template v-else-if="field.widget.widget === 'switch'">
            <el-switch v-model="responseData[field.code]" disabled />
          </template>

          <template v-else-if="field.widget.widget === 'date'">
            <el-date-picker
              v-model="responseData[field.code]"
              :type="field.widget.type || 'date'"
              :placeholder="field.widget.placeholder || `请选择${field.name}`"
              style="width: 100%"
              disabled
            />
          </template>

          <template v-else-if="field.widget.widget === 'time'">
            <el-time-picker
              v-model="responseData[field.code]"
              :placeholder="field.widget.placeholder || `请选择${field.name}`"
              style="width: 100%"
              disabled
            />
          </template>

          <template v-else-if="field.widget.widget === 'datetime'">
            <el-date-picker
              v-model="responseData[field.code]"
              type="datetime"
              :placeholder="field.widget.placeholder || `请选择${field.name}`"
              style="width: 100%"
              disabled
            />
          </template>

          <template v-else-if="field.widget.widget === 'number'">
            <el-input-number
              v-model="responseData[field.code]"
              :min="field.widget.number_limit ? JSON.parse(field.widget.number_limit)[0] : undefined"
              :max="field.widget.number_limit ? JSON.parse(field.widget.number_limit)[1] : undefined"
              :step="field.widget.step || 1"
              style="width: 100%"
              disabled
            />
          </template>

          <template v-else-if="field.widget.widget === 'slider'">
            <el-slider
              v-model="responseData[field.code]"
              :min="field.widget.number_limit ? JSON.parse(field.widget.number_limit)[0] : undefined"
              :max="field.widget.number_limit ? JSON.parse(field.widget.number_limit)[1] : undefined"
              :step="field.widget.step || 1"
              disabled
            />
          </template>

          <template v-else-if="field.widget.widget === 'rate'">
            <el-rate
              v-model="responseData[field.code]"
              :max="field.widget.max || 5"
              :allow-half="field.widget.allowHalf"
              disabled
            />
          </template>

          <template v-else-if="field.widget.widget === 'color'">
            <el-color-picker v-model="responseData[field.code]" disabled />
          </template>

          <template v-else>
            <el-input
              v-model="responseData[field.code]"
              :placeholder="field.widget.placeholder || `请输入${field.name}`"
              disabled
            />
          </template>
        </el-form-item>
      </el-form>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Widget {
  mode: string
  type: string
  widget: string
  example: string
  text_limit: string
  placeholder: string
  number_limit: string
  default_value: string
  options?: Array<{
    label: string
    value: any
  }>
  step?: number
  max?: number
  allowHalf?: boolean
  action?: string
  multiple?: boolean
  accept?: string
}

interface Field {
  code: string
  desc: string
  name: string
  widget: Widget
  required: boolean
}

interface Request {
  children: Field[]
  render_type: string
}

const props = defineProps<{
  request: Request
  response?: Request
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()

const formData = ref<Record<string, any>>({})
const responseData = ref<Record<string, any>>({})

// 监听表单数据变化
watch(formData, (newValue) => {
  emit('update:modelValue', newValue)
}, { deep: true })

// 监听 request 变化，重置表单数据
watch(() => props.request, (newRequest) => {
  if (newRequest) {
    const initialData: Record<string, any> = {}
    newRequest.children.forEach(field => {
      initialData[field.code] = field.widget.default_value || null
    })
    formData.value = initialData
  }
}, { immediate: true })

// 监听 response 变化，重置响应数据
watch(() => props.response, (newResponse) => {
  if (newResponse) {
    const initialData: Record<string, any> = {}
    newResponse.children.forEach(field => {
      initialData[field.code] = field.widget.default_value || null
    })
    responseData.value = initialData
  }
}, { immediate: true })
</script>

<style lang="scss" scoped>
.function-renderer {
  width: 100%;

  .function-form {
    width: 100%;
  }

  .section-title {
    font-size: 16px;
    font-weight: 500;
    color: #e0e0e0;
    margin: 24px 0 16px;
    padding-left: 12px;
    border-left: 4px solid #3c9ae8;
  }

  :deep(.el-form) {
    .el-form-item {
      .el-form-item__label {
        color: #e0e0e0;
      }

      .el-input__wrapper,
      .el-textarea__inner,
      .el-select .el-input__wrapper,
      .el-date-editor .el-input__wrapper {
        background-color: #313650;
        border: 1px solid #3a3f50;
        box-shadow: none;

        &:hover {
          border-color: #3c9ae8;
        }

        &.is-focus {
          border-color: #3c9ae8;
          box-shadow: 0 0 0 1px #3c9ae8;
        }

        .el-input__inner {
          color: #e0e0e0;

          &::placeholder {
            color: #a1a7b7;
          }
        }
      }

      .el-radio,
      .el-checkbox {
        color: #e0e0e0;
      }

      .el-switch__core {
        background-color: #3a3f50;
        border-color: #3a3f50;
      }

      .el-slider__runway {
        background-color: #3a3f50;
      }

      .el-rate__icon {
        color: #3a3f50;
      }

      .run-button {
        width: 100%;
        height: 40px;
        font-size: 16px;
      }
    }
  }
}
</style> 
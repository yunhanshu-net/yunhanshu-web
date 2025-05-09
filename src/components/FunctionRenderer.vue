<template>
  <div class="function-renderer">
    <template v-if="request">
      <el-tabs v-model="activeTab" type="card" class="function-tabs">
        <!-- 运行函数标签页 -->
        <el-tab-pane label="运行函数" name="run">
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
              <el-button type="primary" class="run-button" @click="handleRun">运行</el-button>
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
        </el-tab-pane>

        <!-- 参数介绍标签页 -->
        <el-tab-pane label="参数介绍" name="params">
          <el-form label-width="auto" class="function-form">
            <!-- 请求参数部分 -->
            <div class="section-title">请求参数说明</div>
            <el-form-item
              v-for="field in request.children"
              :key="field.code"
              :label="field.name"
              :required="field.required"
            >
              <div class="param-info">
                <div class="param-desc" v-if="field.desc">{{ field.desc }}</div>
                <div class="param-detail">
                  <div class="param-type">
                    <span class="label">类型：</span>
                    <span class="value">{{ getTypeLabel(field.widget) }}</span>
                  </div>
                  <div class="param-format" v-if="getFormatLabel(field.widget)">
                    <span class="label">格式：</span>
                    <span class="value">{{ getFormatLabel(field.widget) }}</span>
                  </div>
                  <div class="param-default" v-if="field.widget.default_value">
                    <span class="label">默认值：</span>
                    <span class="value">{{ field.widget.default_value }}</span>
                  </div>
                </div>
              </div>
            </el-form-item>

            <!-- 响应参数部分 -->
            <div class="section-title">响应参数说明</div>
            <el-form-item
              v-for="field in response?.children"
              :key="field.code"
              :label="field.name"
            >
              <div class="param-info">
                <div class="param-desc" v-if="field.desc">{{ field.desc }}</div>
                <div class="param-detail">
                  <div class="param-type">
                    <span class="label">类型：</span>
                    <span class="value">{{ getTypeLabel(field.widget) }}</span>
                  </div>
                  <div class="param-format" v-if="getFormatLabel(field.widget)">
                    <span class="label">格式：</span>
                    <span class="value">{{ getFormatLabel(field.widget) }}</span>
                  </div>
                </div>
              </div>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 参数示例标签页 -->
        <el-tab-pane label="参数示例" name="example">
          <el-form label-width="auto" class="function-form">
            <!-- 请求示例部分 -->
            <div class="section-title">请求示例</div>
            <el-form-item
              v-for="field in request.children"
              :key="field.code"
              :label="field.name"
            >
              <div class="example-value">
                <template v-if="field.widget.widget === 'select' || field.widget.widget === 'radio' || field.widget.widget === 'checkbox'">
                  <div class="example-options">
                    <div class="option" v-for="option in field.widget.options" :key="option.value">
                      <span class="option-label">{{ option.label }}</span>
                      <span class="option-value">({{ option.value }})</span>
                    </div>
                  </div>
                </template>
                <template v-else>
                  {{ getExampleValue(field) }}
                </template>
              </div>
            </el-form-item>

            <!-- 响应示例部分 -->
            <div class="section-title">响应示例</div>
            <el-form-item
              v-for="field in response?.children"
              :key="field.code"
              :label="field.name"
            >
              <div class="example-value">
                <template v-if="field.widget.widget === 'select' || field.widget.widget === 'radio' || field.widget.widget === 'checkbox'">
                  <div class="example-options">
                    <div class="option" v-for="option in field.widget.options" :key="option.value">
                      <span class="option-label">{{ option.label }}</span>
                      <span class="option-value">({{ option.value }})</span>
                    </div>
                  </div>
                </template>
                <template v-else>
                  {{ getExampleValue(field) }}
                </template>
              </div>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { TabsPaneContext } from 'element-plus'

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

const activeTab = ref('run')
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

// 处理运行按钮点击
const handleRun = () => {
  ElMessage.info('功能正在开发中，敬请期待...')
}

// 获取请求示例数据
const getExampleRequest = () => {
  const example: Record<string, any> = {}
  props.request.children.forEach(field => {
    if (field.widget.example) {
      try {
        example[field.code] = JSON.parse(field.widget.example)
      } catch {
        example[field.code] = field.widget.example
      }
    } else {
      example[field.code] = field.widget.default_value || null
    }
  })
  return example
}

// 获取响应示例数据
const getExampleResponse = () => {
  const example: Record<string, any> = {}
  props.response?.children.forEach(field => {
    if (field.widget.example) {
      try {
        example[field.code] = JSON.parse(field.widget.example)
      } catch {
        example[field.code] = field.widget.example
      }
    } else {
      example[field.code] = field.widget.default_value || null
    }
  })
  return example
}

// 在 script setup 部分添加新的方法
const getTypeLabel = (widget: Widget) => {
  const typeMap: Record<string, string> = {
    input: '文本',
    textarea: '多行文本',
    select: '选择',
    radio: '单选',
    checkbox: '多选',
    switch: '开关',
    date: '日期',
    time: '时间',
    datetime: '日期时间',
    number: '数字',
    slider: '滑块',
    rate: '评分',
    color: '颜色'
  }
  return typeMap[widget.widget] || widget.type || '文本'
}

const getFormatLabel = (widget: Widget) => {
  const formatLabels: string[] = []
  
  if (widget.text_limit) {
    try {
      const [min, max] = JSON.parse(widget.text_limit)
      formatLabels.push(`长度${min}-${max}字符`)
    } catch {}
  }
  
  if (widget.number_limit) {
    try {
      const [min, max] = JSON.parse(widget.number_limit)
      formatLabels.push(`范围${min}-${max}`)
    } catch {}
  }
  
  if (widget.step) {
    formatLabels.push(`步长${widget.step}`)
  }
  
  if (widget.type === 'date') {
    formatLabels.push('YYYY-MM-DD')
  } else if (widget.type === 'time') {
    formatLabels.push('HH:mm:ss')
  } else if (widget.type === 'datetime') {
    formatLabels.push('YYYY-MM-DD HH:mm:ss')
  }
  
  return formatLabels.join('，')
}

// 修改 getExampleValue 方法
const getExampleValue = (field: Field) => {
  if (field.widget.example) {
    try {
      const value = JSON.parse(field.widget.example)
      return typeof value === 'object' ? JSON.stringify(value, null, 2) : value
    } catch {
      return field.widget.example
    }
  }
  
  // 根据类型返回默认示例
  switch (field.widget.widget) {
    case 'date':
      return '2024-03-20'
    case 'time':
      return '12:00:00'
    case 'datetime':
      return '2024-03-20 12:00:00'
    case 'number':
      return '0'
    case 'switch':
      return 'false'
    case 'rate':
      return '0'
    case 'color':
      return '#000000'
    default:
      return field.widget.default_value || '无示例值'
  }
}
</script>

<style lang="scss" scoped>
.function-renderer {
  width: 100%;

  .function-tabs {
    :deep(.el-tabs__header) {
      margin-bottom: 20px;
    }

    :deep(.el-tabs__nav-wrap::after) {
      background-color: #3a3f50;
    }

    :deep(.el-tabs__item) {
      color: #a1a7b7;
      
      &.is-active {
        color: #3c9ae8;
      }
      
      &:hover {
        color: #3c9ae8;
      }
    }
  }

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

  .params-doc {
    .param-info {
      .param-desc {
        margin-bottom: 8px;
        color: #e0e0e0;
      }

      .param-type {
        color: #a1a7b7;
        font-size: 13px;
      }

      .param-required {
        display: inline-block;
        margin-left: 8px;
        padding: 2px 6px;
        background-color: #f56c6c;
        color: #fff;
        border-radius: 4px;
        font-size: 12px;
      }
    }
  }

  .example-doc {
    .example-code {
      margin: 0;
      padding: 16px;
      background-color: #262b3c;
      border-radius: 4px;
      color: #e0e0e0;
      font-family: monospace;
      white-space: pre-wrap;
      word-break: break-all;
    }
  }

  :deep(.el-form) {
    .el-form-item {
      margin-bottom: 20px;

      .el-form-item__content {
        min-height: 40px;
        display: flex;
        align-items: center;
      }

      .el-form-item__label {
        color: #e0e0e0;
        line-height: 40px;
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

  :deep(.el-descriptions) {
    background-color: #262b3c;
    border-color: #3a3f50;

    .el-descriptions__label {
      background-color: #313650;
      color: #e0e0e0;
    }

    .el-descriptions__content {
      background-color: #262b3c;
      color: #e0e0e0;
    }
  }

  .param-info {
    .param-desc {
      margin-bottom: 12px;
      color: #e0e0e0;
      line-height: 1.5;
    }

    .param-detail {
      color: #a1a7b7;
      font-size: 13px;
      line-height: 1.8;

      .label {
        color: #8c8c8c;
        margin-right: 4px;
      }

      .value {
        color: #e0e0e0;
      }
    }
  }

  .example-value {
    color: #e0e0e0;
    font-family: monospace;
    white-space: pre-wrap;
    word-break: break-all;
    background-color: #262b3c;
    padding: 8px 12px;
    border-radius: 4px;
    line-height: 1.5;
    width: 100%;
  }

  .example-options {
    width: 100%;
    
    .option {
      margin-bottom: 4px;
      
      &:last-child {
        margin-bottom: 0;
      }

      .option-label {
        color: #e0e0e0;
      }

      .option-value {
        color: #a1a7b7;
        margin-left: 8px;
      }
    }
  }
}
</style> 
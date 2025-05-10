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
              <template v-if="field.widget_type === 'input'">
                <el-input
                  v-model="formData[field.code]"
                  :placeholder="field.widget_config?.placeholder || `请输入${field.name}`"
                  :type="field.widget_config?.mode || 'text'"
                />
              </template>

              <template v-else-if="field.widget_type === 'textarea'">
                <el-input
                  v-model="formData[field.code]"
                  type="textarea"
                  :rows="4"
                  :placeholder="field.widget_config?.placeholder || `请输入${field.name}`"
                />
              </template>

              <template v-else-if="field.widget_type === 'select'">
                <el-select
                  v-model="formData[field.code]"
                  :placeholder="field.widget_config?.placeholder || `请选择${field.name}`"
                  style="width: 100%"
                >
                  <el-option
                    v-for="option in field.widget_config?.options"
                    :key="option"
                    :label="option"
                    :value="option"
                  />
                </el-select>
              </template>

              <template v-else-if="field.widget_type === 'radio'">
                <el-radio-group v-model="formData[field.code]">
                  <el-radio
                    v-for="option in field.widget_config?.options"
                    :key="option"
                    :label="option"
                  >
                    {{ option }}
                  </el-radio>
                </el-radio-group>
              </template>

              <template v-else-if="field.widget_type === 'checkbox'">
                <el-checkbox-group v-model="formData[field.code]">
                  <el-checkbox
                    v-for="option in field.widget_config?.options"
                    :key="option"
                    :label="option"
                  >
                    {{ option }}
                  </el-checkbox>
                </el-checkbox-group>
              </template>

              <template v-else-if="field.widget_type === 'switch'">
                <el-switch v-model="formData[field.code]" />
              </template>

              <template v-else-if="field.widget_type === 'date'">
                <el-date-picker
                  v-model="formData[field.code]"
                  :type="field.widget_config?.mode || 'date'"
                  :placeholder="field.widget_config?.placeholder || `请选择${field.name}`"
                  style="width: 100%"
                />
              </template>

              <template v-else-if="field.widget_type === 'time'">
                <el-time-picker
                  v-model="formData[field.code]"
                  :placeholder="field.widget_config?.placeholder || `请选择${field.name}`"
                  style="width: 100%"
                />
              </template>

              <template v-else-if="field.widget_type === 'datetime'">
                <el-date-picker
                  v-model="formData[field.code]"
                  type="datetime"
                  :placeholder="field.widget_config?.placeholder || `请选择${field.name}`"
                  style="width: 100%"
                />
              </template>

              <template v-else-if="field.widget_type === 'number'">
                <el-input-number
                  v-model="formData[field.code]"
                  :min="field.widget_config?.min"
                  :max="field.widget_config?.max"
                  :step="field.widget_config?.step || 1"
                  style="width: 100%"
                />
              </template>

              <template v-else-if="field.widget_type === 'slider'">
                <el-slider
                  v-model="formData[field.code]"
                  :min="field.widget_config?.min"
                  :max="field.widget_config?.max"
                  :step="field.widget_config?.step || 1"
                />
              </template>

              <template v-else-if="field.widget_type === 'rate'">
                <el-rate
                  v-model="formData[field.code]"
                  :max="field.widget_config?.max || 5"
                  :allow-half="field.widget_config?.allowHalf"
                />
              </template>

              <template v-else-if="field.widget_type === 'color'">
                <el-color-picker v-model="formData[field.code]" />
              </template>

              <template v-else>
                <el-input
                  v-model="formData[field.code]"
                  :placeholder="field.widget_config?.placeholder || `请输入${field.name}`"
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
              <template v-if="field.widget_type === 'input'">
                <el-input
                  v-model="responseData[field.code]"
                  :placeholder="field.widget_config?.placeholder || `请输入${field.name}`"
                  :type="field.widget_config?.mode || 'text'"
                  disabled
                />
              </template>

              <template v-else-if="field.widget_type === 'textarea'">
                <el-input
                  v-model="responseData[field.code]"
                  type="textarea"
                  :rows="4"
                  :placeholder="field.widget_config?.placeholder || `请输入${field.name}`"
                  disabled
                />
              </template>

              <template v-else-if="field.widget_type === 'select'">
                <el-select
                  v-model="responseData[field.code]"
                  :placeholder="field.widget_config?.placeholder || `请选择${field.name}`"
                  style="width: 100%"
                  disabled
                >
                  <el-option
                    v-for="option in field.widget_config?.options"
                    :key="option"
                    :label="option"
                    :value="option"
                  />
                </el-select>
              </template>

              <template v-else-if="field.widget_type === 'radio'">
                <el-radio-group v-model="responseData[field.code]" disabled>
                  <el-radio
                    v-for="option in field.widget_config?.options"
                    :key="option"
                    :label="option"
                  >
                    {{ option }}
                  </el-radio>
                </el-radio-group>
              </template>

              <template v-else-if="field.widget_type === 'checkbox'">
                <el-checkbox-group v-model="responseData[field.code]" disabled>
                  <el-checkbox
                    v-for="option in field.widget_config?.options"
                    :key="option"
                    :label="option"
                  >
                    {{ option }}
                  </el-checkbox>
                </el-checkbox-group>
              </template>

              <template v-else-if="field.widget_type === 'switch'">
                <el-switch v-model="responseData[field.code]" disabled />
              </template>

              <template v-else-if="field.widget_type === 'date'">
                <el-date-picker
                  v-model="responseData[field.code]"
                  :type="field.widget_config?.mode || 'date'"
                  :placeholder="field.widget_config?.placeholder || `请选择${field.name}`"
                  style="width: 100%"
                  disabled
                />
              </template>

              <template v-else-if="field.widget_type === 'time'">
                <el-time-picker
                  v-model="responseData[field.code]"
                  :placeholder="field.widget_config?.placeholder || `请选择${field.name}`"
                  style="width: 100%"
                  disabled
                />
              </template>

              <template v-else-if="field.widget_type === 'datetime'">
                <el-date-picker
                  v-model="responseData[field.code]"
                  type="datetime"
                  :placeholder="field.widget_config?.placeholder || `请选择${field.name}`"
                  style="width: 100%"
                  disabled
                />
              </template>

              <template v-else-if="field.widget_type === 'number'">
                <el-input-number
                  v-model="responseData[field.code]"
                  :min="field.widget_config?.min"
                  :max="field.widget_config?.max"
                  :step="field.widget_config?.step || 1"
                  style="width: 100%"
                  disabled
                />
              </template>

              <template v-else-if="field.widget_type === 'slider'">
                <el-slider
                  v-model="responseData[field.code]"
                  :min="field.widget_config?.min"
                  :max="field.widget_config?.max"
                  :step="field.widget_config?.step || 1"
                  disabled
                />
              </template>

              <template v-else-if="field.widget_type === 'rate'">
                <el-rate
                  v-model="responseData[field.code]"
                  :max="field.widget_config?.max || 5"
                  :allow-half="field.widget_config?.allowHalf"
                  disabled
                />
              </template>

              <template v-else-if="field.widget_type === 'color'">
                <el-color-picker v-model="responseData[field.code]" disabled />
              </template>

              <template v-else>
                <el-input
                  v-model="responseData[field.code]"
                  :placeholder="field.widget_config?.placeholder || `请输入${field.name}`"
                  disabled
                />
              </template>
            </el-form-item>

            <!-- 移动运行信息到这里 -->
            <div v-if="runInfo.cost" class="run-info">
              <div class="info-item">
                <span class="label">执行耗时：</span>
                <span class="value">{{ runInfo.cost }}</span>
              </div>
              <div class="info-item">
                <span class="label">内存消耗：</span>
                <span class="value">{{ runInfo.memory }}</span>
              </div>
              <div class="info-item">
                <span class="label">函数版本：</span>
                <span class="value">{{ runInfo.version }}</span>
              </div>
              <div class="info-item">
                <span class="label">追踪ID：</span>
                <span class="value trace-id">{{ runInfo.trace_id }}</span>
              </div>
            </div>
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
                    <span class="value">{{ getTypeLabel(field) }}</span>
                  </div>
                  <div class="param-format" v-if="getFormatLabel(field)">
                    <span class="label">格式：</span>
                    <span class="value">{{ getFormatLabel(field) }}</span>
                  </div>
                  <div class="param-default" v-if="field.widget_config?.default_value">
                    <span class="label">默认值：</span>
                    <span class="value">{{ field.widget_config.default_value }}</span>
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
                    <span class="value">{{ getTypeLabel(field) }}</span>
                  </div>
                  <div class="param-format" v-if="getFormatLabel(field)">
                    <span class="label">格式：</span>
                    <span class="value">{{ getFormatLabel(field) }}</span>
                  </div>
                </div>
              </div>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 参数示例标签页 -->
        <el-tab-pane label="参数示例" name="example">
          <el-form label-position="left" label-width="120px">
            <template v-if="request.children && request.children.length > 0">
              <div class="example-section">
                <div class="example-title">请求参数示例</div>
                <el-form-item
                  v-for="param in request.children"
                  :key="param.name"
                  :label="param.name"
                >
                  <div class="example-value">
                    {{ getExampleValue(param) }}
                  </div>
                </el-form-item>
              </div>
            </template>

            <template v-if="response?.children && response.children.length > 0">
              <div class="example-section">
                <div class="example-title">响应参数示例</div>
                <el-form-item
                  v-for="param in response.children"
                  :key="param.name"
                  :label="param.name"
                >
                  <div class="example-value">
                    {{ getExampleValue(param) }}
                  </div>
                </el-form-item>
              </div>
            </template>
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
import workspaceApi from '@/api/workspace'
import type { Widget, Field, Request } from '@/types/function'

interface Props {
  request: Request
  response?: Request
  path?: string
  method?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()

const activeTab = ref('run')
const formData = ref<Record<string, any>>({})
const responseData = ref<Record<string, any>>({})
const runInfo = ref<{
  cost?: string
  memory?: string
  version?: string
  trace_id?: string
}>({})

// 监听表单数据变化
watch(formData, (newValue) => {
  emit('update:modelValue', newValue)
}, { deep: true })

// 监听 request 变化，重置表单数据
watch(() => props.request, (newRequest) => {
  if (newRequest) {
    const initialData: Record<string, any> = {}
    newRequest.children.forEach(field => {
      // 如果是必填字段，设置默认值为空字符串，这样可以触发校验
      if (field.required) {
        initialData[field.code] = ''
      } else {
        initialData[field.code] = field.widget_config?.default_value || null
      }
    })
    formData.value = initialData
  }
}, { immediate: true })

// 监听 response 变化，重置响应数据
watch(() => props.response, (newResponse) => {
  if (newResponse) {
    const initialData: Record<string, any> = {}
    newResponse.children.forEach(field => {
      initialData[field.code] = field.widget_config?.default_value || null
    })
    responseData.value = initialData
  }
}, { immediate: true })

// 修改 handleRun 函数
const handleRun = async () => {
  try {
    if (!props.path) {
      ElMessage.error('函数路径不能为空')
      return
    }

    // 获取请求方法（默认为 POST）
    const method = props.method?.toLowerCase() || 'post'
    
    // 验证必填字段
    const requiredFields = props.request.children.filter(field => field.required)
    for (const field of requiredFields) {
      const value = formData.value[field.code]
      if (value === undefined || value === '' || value === null) {
        ElMessage.error(`请填写${field.name}`)
        return
      }
    }

    // 处理请求数据，进行类型转换和验证
    const processedData = Object.entries(formData.value).reduce((acc, [key, value]) => {
      // 找到对应的字段定义
      const field = props.request.children.find(f => f.code === key)
      if (!field) return acc

      // 如果是必填字段，值不能为空
      if (field.required && (value === undefined || value === '' || value === null)) {
        throw new Error(`请填写${field.name}`)
      }

      // 如果值不为空，则进行验证和转换
      if (value !== undefined && value !== '' && value !== null) {
        // 根据字段类型进行转换和验证
        switch (field.value_type) {
          case 'number':
            // 数字类型转换和验证
            const numValue = Number(value)
            
            // 验证数值范围
            if (field.widget_config?.min || field.widget_config?.max) {
              try {
                if (numValue < (field.widget_config?.min || -Infinity) || numValue > (field.widget_config?.max || Infinity)) {
                  throw new Error(`${field.name}必须在${field.widget_config?.min || '最小值'}到${field.widget_config?.max || '最大值'}之间`)
                }
              } catch (error) {
                if (error instanceof Error) {
                  ElMessage.error(error.message)
                  throw error
                }
              }
            }
            
            acc[key] = numValue
            break

          case 'string':
            // 字符串类型验证
            if (field.validates) {
              try {
                const validates = field.validates.split(',')
                validates.forEach(validate => {
                  const [key, value] = validate.split('=')
                  if (key === 'min' || key === 'max') {
                    const strValue = String(value)
                    if (strValue.length < Number(key === 'min' ? value : -Infinity) || strValue.length > Number(key === 'max' ? value : Infinity)) {
                      throw new Error(`${field.name}长度必须在${key === 'min' ? value : '最小值'}到${key === 'max' ? value : '最大值'}个字符之间`)
                    }
                  }
                })
              } catch (error) {
                if (error instanceof Error) {
                  ElMessage.error(error.message)
                  throw error
                }
              }
            }
            acc[key] = value
            break

          case 'boolean':
            acc[key] = Boolean(value)
            break

          default:
            acc[key] = value
        }
      } else {
        // 如果值为空，且不是必填字段，则设置为 null
        acc[key] = null
      }
      return acc
    }, {} as Record<string, any>)
    
    // 调用运行函数 API
    const response = await workspaceApi.runFunction(props.path, method, processedData)
    console.log('函数运行响应:', response) // 添加日志

    // 处理响应
    if (response?.code === 0) {
      // 成功：更新响应数据
      if (response.data_type === 'form') {
        // 表单类型：直接更新响应数据
        responseData.value = response.data
        // 更新运行信息
        runInfo.value = {
          cost: response.meta_data?.cost,
          memory: response.meta_data?.memory,
          version: response.meta_data?.version,
          trace_id: response.trace_id
        }
        ElMessage.success(response.msg || '运行成功')
      } else {
        // 其他类型：后续可以添加其他类型的处理
        ElMessage.warning('暂不支持该响应类型')
      }
    } else {
      // 失败：显示错误信息
      ElMessage.error(response?.msg || '运行失败')
    }
  } catch (error) {
    // 处理错误
    console.error('运行函数失败:', error)
    ElMessage.error('运行函数失败，请稍后重试')
  }
}

// 获取请求示例数据
const getExampleRequest = () => {
  const example: Record<string, any> = {}
  props.request.children.forEach(field => {
    if (field.example) {
      try {
        example[field.code] = JSON.parse(field.example)
      } catch {
        example[field.code] = field.example
      }
    } else {
      example[field.code] = field.widget_config?.default_value || null
    }
  })
  return example
}

// 获取响应示例数据
const getExampleResponse = () => {
  const example: Record<string, any> = {}
  props.response?.children.forEach(field => {
    if (field.example) {
      try {
        example[field.code] = JSON.parse(field.example)
      } catch {
        example[field.code] = field.example
      }
    } else {
      example[field.code] = field.widget_config?.default_value || null
    }
  })
  return example
}

// 修改 getTypeLabel 方法
const getTypeLabel = (field: Field) => {
  const typeMap: Record<string, string> = {
    string: '文本',
    text: '文本',
    number: '数字',
    boolean: '布尔值',
    date: '日期',
    time: '时间',
    datetime: '日期时间',
    array: '数组',
    object: '对象'
  }
  return typeMap[field.value_type] || '文本'
}

// 修改 getFormatLabel 方法
const getFormatLabel = (field: Field) => {
  const formatLabels: string[] = []
  
  if (field.validates) {
    const validates = field.validates.split(',')
    validates.forEach(validate => {
      const [key, value] = validate.split('=')
      if (key === 'min' || key === 'max') {
        formatLabels.push(`${key === 'min' ? '最小' : '最大'}值: ${value}`)
      }
    })
  }
  
  if (field.widget_config?.step) {
    formatLabels.push(`步长${field.widget_config.step}`)
  }
  
  if (field.value_type === 'date') {
    formatLabels.push('YYYY-MM-DD')
  } else if (field.value_type === 'time') {
    formatLabels.push('HH:mm:ss')
  } else if (field.value_type === 'datetime') {
    formatLabels.push('YYYY-MM-DD HH:mm:ss')
  }
  
  return formatLabels.join('，')
}

// 修改 getExampleValue 方法
const getExampleValue = (field: Field) => {
  if (field.example) {
    try {
      const value = JSON.parse(field.example)
      return typeof value === 'object' ? JSON.stringify(value, null, 2) : value
    } catch {
      return field.example
    }
  }
  
  // 根据类型返回默认示例
  switch (field.widget_type) {
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
      return field.widget_config?.default_value || '无示例值'
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

  .example-section {
    margin-bottom: 24px;
    padding: 16px;
    background-color: #262b3c;
    border-radius: 8px;

    .example-title {
      font-size: 16px;
      font-weight: 500;
      color: #e0e0e0;
      margin-bottom: 16px;
      padding-left: 12px;
      border-left: 4px solid #3c9ae8;
    }

    :deep(.el-form-item) {
      margin-bottom: 12px;
      display: flex;
      align-items: center;

      &:last-child {
        margin-bottom: 0;
      }

      .el-form-item__label {
        color: #a1a7b7;
        font-size: 14px;
        line-height: 40px;
        padding-right: 12px;
      }

      .el-form-item__content {
        flex: 1;
        margin-left: 0 !important;
      }
    }

    .example-value {
      min-height: 40px;
      padding: 12px;
      background-color: #1a1d2b;
      border-radius: 4px;
      color: #e0e0e0;
      font-family: monospace;
      white-space: pre-wrap;
      word-break: break-all;
      display: flex;
      align-items: center;
    }
  }

  :deep(.el-form-item__label) {
    color: #a1a7b7;
    font-size: 14px;
    padding-bottom: 8px;
  }

  :deep(.el-form-item) {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .run-info {
    margin-bottom: 20px;
    padding: 16px;
    background-color: #262b3c;
    border-radius: 8px;
    border: 1px solid #3a3f50;

    .info-item {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      font-size: 14px;
      line-height: 1.5;

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        color: #a1a7b7;
        margin-right: 8px;
        min-width: 80px;
      }

      .value {
        color: #e0e0e0;
        font-family: monospace;

        &.trace-id {
          font-size: 12px;
          color: #8c8c8c;
        }
      }
    }
  }
}
</style> 
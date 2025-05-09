// 函数组件相关类型定义
export interface Widget {
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

export interface Field {
  code: string
  desc: string
  name: string
  widget: Widget
  required: boolean
}

export interface Request {
  children: Field[]
  render_type: string
  meta_data?: {
    cost: string
    memory: string
    version: string
  }
  trace_id?: string
}

export interface Response {
  children: Field[]
  render_type: string
  meta_data?: {
    cost: string
    memory: string
    version: string
  }
  trace_id?: string
}

// 函数详情接口返回的数据类型
export interface IFunctionDetail {
  id: number
  created_at: string
  updated_at: string
  created_by: string
  updated_by: string
  deleted_by: string
  title: string
  name: string
  description: string
  tags: string
  request: Request
  response: Response
  callbacks: string
  use_tables: string
  is_public: boolean
  user: string
  tree_id: number
  runner_id: number
  fork_from_version: string
  fork_from_id: number | null
  method: string
  path: string
} 
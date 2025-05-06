// 分页结果
export interface IPageResult<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

// 服务树节点
export interface IServiceTree {
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  title: string;
  name: string;
  parent_id: number;
  level: number;
  sort: number;
  full_path: string;
  full_id_path: string;
  full_name_path: string;
  children_count: number;
  children?: IServiceTree[];
  is_expanded?: boolean;
  user?: string;
}

// Runner函数
export interface IRunnerFunc {
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  title: string;
  name: string;
  description: string;
  runner_id: number;
  tree_id: number;
  language: string;
  code: string;
  script_path: string;
  timeout: number;
  memory: number;
  version: string;
  input_schema: string;
  output_schema: string;
  mock_data: string;
  user: string;
  example_input: string;
  example_output: string;
  is_public: boolean;
  path: string;
  tree?: IServiceTree;
}

// Runner执行引擎
export interface IRunner {
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  title: string;
  name: string;
  description: string;
  language: string;
  version: string;
  code: string;
  status: number;
  func_count: number;
  user: string;
  created_by: string;
  updated_by: string;
  is_public: boolean;
  variables: string;
}

// 函数表单类型
export interface IFunctionForm {
  title: string;
  name: string;
  description: string;
  runner_id: number;
  tree_id: number;
  language: string;
  code: string;
  timeout: number;
  memory: number;
  input_schema: string;
  output_schema: string;
  mock_data: string;
  example_input: string;
  example_output: string;
  is_public: boolean;
}

// 表单字段
export interface IFormField {
  id: number;
  name: string;
  code: string;
  type: string;
  required: boolean;
  help_text?: string;
  widget: {
    widget: string;
    placeholder?: string;
    default_value?: any;
    options?: Array<{ label: string; value: string | number }>;
    rules?: any[];
  };
}

// 表单分组
export interface IFormGroup {
  id: number;
  name: string;
  children: IFormField[];
} 
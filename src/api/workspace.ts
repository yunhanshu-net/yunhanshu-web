import request from '@/utils/request'
import type { IFunctionDetail, Request, Response } from '@/types/function'
import axios from 'axios'

// 工作空间接口类型定义
export interface IWorkspace {
  id: number;
  title: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  user: string;
  status: number;
  is_public: boolean;
  color?: string; // 用于UI显示的颜色
  tree_id: number;
  currentFunction?: {  // 添加 currentFunction
    id: number;
    request: Request;
    response: Response;
    responseData?: any;
    path: string;
    requestData?: any;
  };
}

// 服务目录节点类型
export interface IServiceTreeNode {
  id: number;
  title: string;
  name: string;
  parent_id: number;
  type: 'package' | 'function';
  runner_id: number;
  level: number;
  sort: number;
  full_id_path: string;
  full_name_path: string;
  user: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  deleted_by: string;
  children_count: number;
  fork_from_id: number | null;
}

// 创建服务目录参数
export interface ICreateServiceTreeParams {
  parent_id: number;
  title: string;
  name: string;
  type: 'package' | 'function';
}

// 云函数接口
export interface IRunnerFunc {
  id: number;
  name: string;
  title: string;
  runner_id: number;
  tree_id: number;
  created_at: string;
}

// 创建云函数参数
export interface ICreateRunnerFuncParams {
  tree_id: number;
  title: string;
  name: string;
  desc: string;
  code?: string; // 新增可选的 code 字段，表示函数代码
}

export interface IWorkspaceCreateParams {
  title: string;
  name: string;
  description: string;
}

export interface IPaginationParams {
  page?: number;
  page_size?: number;
  search?: string;
}

export interface IPaginationResult<T> {
  items: T[];
  total_count: number;
  total_pages: number;
  current_page: number;
  page_size: number;
}

/**
 * 工作空间相关API
 */
export const workspaceApi = {
  /**
   * 获取工作空间列表
   * @param params 分页参数
   * @returns Promise
   */
  getList(params: IPaginationParams = {}): Promise<IPaginationResult<IWorkspace>> {
    return request.get('/runner', params);
  },
  
  /**
   * 根据用户名和工作空间名获取工作空间详情
   * @param user 用户名
   * @param name 工作空间名称
   * @returns Promise
   */
  getDetailByName(user: string, name: string): Promise<IWorkspace> {
    return request.get(`/runner/by-name/${user}/${name}`);
  },
  
  /**
   * 创建工作空间
   * @param data 工作空间信息
   * @returns Promise
   */
  create(data: IWorkspaceCreateParams): Promise<IWorkspace> {
    return request.post('/runner', data);
  },
  
  /**
   * 获取服务目录子节点
   * @param treeId 目录树ID
   * @returns Promise
   */
  getServiceTreeChildren(treeId: number): Promise<IServiceTreeNode[]> {
    return request.get(`/service-tree/children/${treeId}`);
  },
  
  /**
   * 创建服务目录
   * @param data 服务目录信息
   * @returns Promise
   */
  createServiceTree(data: ICreateServiceTreeParams): Promise<IServiceTreeNode> {
    return request.post('/service-tree', data);
  },
  
  /**
   * 创建云函数
   * @param data 云函数信息
   * @returns Promise
   */
  createRunnerFunc(data: ICreateRunnerFuncParams): Promise<IRunnerFunc> {
    return request.post('/runner-func', data);
  },

  /**
   * 获取函数信息
   * @param funcId 函数ID
   * @returns Promise
   */
  getRunnerFunc(funcId: number): Promise<IFunctionDetail> {
    return request.get(`/runner-func/tree/${funcId}`);
  },

  /**
   * 运行函数
   * @param path 函数路径
   * @param method 请求方法
   * @param params 请求参数
   * @returns Promise
   */
  runFunction(path: string, method: string, params: any): Promise<any> {
    console.log('运行函数 - 参数:', { path, method, params });
    
    // 创建一个新的 axios 实例，不使用拦截器
    const axiosInstance = axios.create({
      baseURL: 'http://localhost:8080',
      timeout: 15000
    });

    if (method.toLowerCase() === 'get') {
      return axiosInstance.get(`/function/${path}`, { params })
        .then(response => {
          console.log('运行函数 - GET响应:', response.data);
          return response.data;
        });
    }
    
    return axiosInstance.post(`/function/${path}`, params)
      .then(response => {
        console.log('运行函数 - POST响应:', response.data);
        return response.data;
      });
  },
}

export default workspaceApi 
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { ElMessage } from 'element-plus';

// 创建axios实例
const service = axios.create({
  baseURL: 'http://127.0.0.1:8080/api/v1',
  timeout: 15000
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 从localStorage获取token，并添加到请求头
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // 添加统一的请求参数
    if (config.method?.toLowerCase() === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now() // 添加时间戳，防止缓存
      };
    }

    return config;
  },
  (error) => {
    console.error('请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data;

    // 统一处理返回结果，判断接口调用是否成功
    if (res.code !== 0) {
      ElMessage({
        message: res.msg || '接口请求失败',
        type: 'error',
        duration: 3000
      });
      return Promise.reject(new Error(res.msg || '接口请求失败'));
    }

    return res;
  },
  (error) => {
    // 统一处理HTTP错误
    let message = '网络错误，请稍后重试';

    if (error.response) {
      const status = error.response.status;

      switch (status) {
        case 401:
          message = '认证失败，请重新登录';
          // 可以添加自动跳转到登录页
          // router.push('/login');
          break;
        case 403:
          message = '没有权限访问该资源';
          break;
        case 404:
          message = '请求的资源不存在';
          break;
        case 500:
          message = '服务器内部错误';
          break;
        default:
          message = `请求错误 (${status})`;
      }
    } else if (error.request) {
      message = '服务器无响应，请检查网络连接';
    }

    ElMessage({
      message,
      type: 'error',
      duration: 3000
    });

    return Promise.reject(error);
  }
);

// 封装通用请求方法
const request = {
  /**
   * GET请求
   * @param url 请求URL
   * @param params 请求参数
   * @param config 额外配置
   * @returns Promise
   */
  get<T = any>(url: string, params = {}, config: AxiosRequestConfig = {}): Promise<T> {
    return service.get(url, { params, ...config })
      .then(res => res.data as T);
  },

  /**
   * POST请求
   * @param url 请求URL
   * @param data 请求体
   * @param config 额外配置
   * @returns Promise
   */
  post<T = any>(url: string, data = {}, config: AxiosRequestConfig = {}): Promise<T> {
    return service.post(url, data, config)
      .then(res => res.data as T);
  },

  /**
   * PUT请求
   * @param url 请求URL
   * @param data 请求体
   * @param config 额外配置
   * @returns Promise
   */
  put<T = any>(url: string, data = {}, config: AxiosRequestConfig = {}): Promise<T> {
    return service.put(url, data, config)
      .then(res => res.data as T);
  },

  /**
   * DELETE请求
   * @param url 请求URL
   * @param params 请求参数
   * @param config 额外配置
   * @returns Promise
   */
  delete<T = any>(url: string, params = {}, config: AxiosRequestConfig = {}): Promise<T> {
    return service.delete(url, { params, ...config })
      .then(res => res.data as T);
  },

  /**
   * 上传文件
   * @param url 请求地址
   * @param formData 表单数据
   * @param config 额外配置
   */
  upload<T = any>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> {
    return service.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      ...config
    });
  },

  /**
   * 下载文件
   * @param url 请求地址
   * @param params 请求参数
   * @param filename 文件名
   */
  download(url: string, params: any, filename?: string): void {
    service
      .get(url, { params, responseType: 'blob' })
      .then((response: any) => {
        // 获取文件名
        let downloadFilename = filename;
        if (!downloadFilename) {
          const contentDisposition = response.headers['content-disposition'];
          if (contentDisposition) {
            const match = contentDisposition.match(/filename="?([^"]+)"?/);
            if (match) {
              downloadFilename = match[1];
            }
          }
        }

        // 创建blob链接
        const blob = new Blob([response.data]);
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = downloadFilename || 'download';
        link.click();
        URL.revokeObjectURL(link.href);
      })
      .catch((error) => {
        console.error('下载文件失败:', error);
        ElMessage.error('下载文件失败');
      });
  }
};

export default request;

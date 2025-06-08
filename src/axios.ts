export interface AxiosResponse<T> {
  data: T;
}

// Simple mock axios that returns predefined responses for testing
import { data as mockData } from './mock/mockData';

const responses: Record<string, any> = { ...mockData };

export const registerResponse = (url: string, data: any) => {
  responses[url] = data;
};

interface RequestConfig {
  params?: Record<string, any>;
  data?: any;
  headers?: Record<string, any>;
}

const get = async <T = any>(url: string, _config?: RequestConfig): Promise<AxiosResponse<T>> => {
  return { data: responses[url] as T };
};

const post = async <T = any>(url: string, _data?: any, _config?: RequestConfig): Promise<AxiosResponse<T>> => {
  return { data: responses[url] as T };
};

const put = async <T = any>(url: string, _data?: any, _config?: RequestConfig): Promise<AxiosResponse<T>> => {
  return { data: responses[url] as T };
};

const del = async <T = any>(url: string, _config?: RequestConfig): Promise<AxiosResponse<T>> => {
  return { data: responses[url] as T };
};

const axios = { get, post, put, delete: del, defaults: { headers: { common: {} } } };

export default axios;

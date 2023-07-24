import type {AxiosRequestConfig} from 'axios';
import axios from 'axios';
import qs from 'qs';
export const pending: Map<any, any> = new Map();

/**
 * 添加请求
 * @param config
 */
export const addPending = (config: AxiosRequestConfig) => {
  const url: string = [
    config.method,
    config.url,
    qs.stringify(config.params),
    qs.stringify(config.data),
  ].join('&');

  config.cancelToken =
    config.cancelToken ||
    new axios.CancelToken((cancel: any) => {
      if (!pending.has(url)) {
        pending.set(url, cancel);
      }
    });
};

/**
 * 移除请求
 * @param config
 */
export const removePending = (config: AxiosRequestConfig) => {
  const url: string = [
    config.method,
    config.url,
    qs.stringify(config.params),
    qs.stringify(config.data),
  ].join('&');
  if (pending.has(url)) {
    const cancel: (url: string) => void = pending.get(url);
    cancel(url);
    pending.delete(url);
  }
};

/**
 * 清空pending中的请求
 */
export const clearPending = () => {
  pending.forEach((url: string) => {
    const cancel: (url: string) => void = pending.get(url);
    cancel(url);
  });
  pending.clear();
};

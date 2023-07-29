// @ts-ignore
/* eslint-disable */
import { request } from 'umi';
import { TableListItem } from './data';

/** 获取规则列表 GET /api/rule */
export async function rule(
  params: {
    // query
    /** 当前的页码 */
    pageNum?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  return request<{
    data: TableListItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  }>('/admin/user_level/getProjectList', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 新建规则 PUT /api/rule */
export async function updateRule(data: { [key: string]: any }, options?: { [key: string]: any }) {
  return request<TableListItem>('/api/rule', {
    data,
    method: 'PUT',
    ...(options || {}),
  });
}

/** 新建规则 POST /api/rule */
export async function addRule(data: { [key: string]: any }, options?: { [key: string]: any }) {
  return request<Record<string, any>>('/admin/user_level/saveOrUpdate', {
    data,
    method: 'POST',
    ...(options || {}),
  });
}

/** 删除规则 DELETE /api/rule */
export async function removeRule(data: { id: number }, options?: { [key: string]: any }) {
  return request<Record<string, any>>(`/admin/user_level/delete/${data.id}`, {
    data,
    method: 'DELETE',
    ...(options || {}),
  });
}

/** 获取规则列表 GET /api/rule */
export async function getExpandrule() {
  return request<any>('/admin/config/getConfig', {
    method: 'GET',
  });
}

/** 新建规则 PUT /api/rule */
export async function updateExpandRule(
  data: { [key: string]: any },
  options?: { [key: string]: any },
) {
  return request<any>('/admin/config/updateConfig', {
    data,
    method: 'POST',
    ...(options || {}),
  });
}

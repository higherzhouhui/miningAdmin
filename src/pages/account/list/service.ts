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
  }>('/user/getUserList', {
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
  return request<Record<string, any>>('/admin/user/update', {
    data,
    method: 'PUT',
    ...(options || {}),
  });
}

/** 删除规则 DELETE /api/rule */
export async function removeRule(data: { id: number }, options?: { [key: string]: any }) {
  return request<Record<string, any>>(`/user/remove/${data.id}`, {
    data,
    method: 'DELETE',
    ...(options || {}),
  });
}


/** 获取规则列表 GET /api/rule */
export async function getPartnerProject() {
  return request<any>('/admin/user_level/getProjectList', {
    method: 'GET',
    params: {pageNum: 1, pageSize: 20},
  });
}

/** 创建订单 PUT /api/rule */
export async function createOrderRequest(data: { [key: string]: any }, options?: { [key: string]: any }) {
  return request<TableListItem>('/admin/order/createOrder', {
    data,
    method: 'POST',
    ...(options || {}),
  });
}
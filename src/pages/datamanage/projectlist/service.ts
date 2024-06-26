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
  }>('/product/getProductList', {
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
  return request<Record<string, any>>('/product/saveOrUpdate', {
    data,
    method: 'POST',
    ...(options || {}),
  });
}

/** 删除规则 DELETE /api/rule */
export async function removeRule(data: { id: number }, options?: { [key: string]: any }) {
  return request<Record<string, any>>(`/product/remove/${data.id}`, {
    data,
    method: 'POST',
    ...(options || {}),
  });
}

export async function sendMoney() {
  return request<Record<string, any>>(`/admin/project/paymentInterval`, {
    method: 'POST',
  });
}

export async function getSelectCatList() {
  return request<Record<string, any>>(`/productCat/getSelectCatList`, {
    method: 'GET',
  });
}
export async function getProductDetail(id) {
  return request<Record<string, any>>(`/product/getProductDetail?id=${id}`, {
    method: 'GET',
  });
}


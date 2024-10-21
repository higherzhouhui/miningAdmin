// @ts-ignore
/* eslint-disable */
import { request } from 'umi';
import { TableListItem } from './data';

/** 获取规则列表 GET /api/rule */
export async function listReq(
  params: {
    // query
    /** 当前的页码 */
    pageNum?: number;
    /** 页面的容量 */
    pageSize?: number;
    user_id?: any;
  },
  options?: { [key: string]: any },
) {
  return request<{
    data: TableListItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  }>('/dogAdmin/follow/list', {
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
export async function updateReq(data: { [key: string]: any }, options?: { [key: string]: any }) {
  return request<Record<string, any>>('/dogAdmin/anchor/update', {
    data,
    method: 'POST',
    ...(options || {}),
  });
}

/** 删除规则 DELETE /api/rule */
export async function removeRule(data: { id: number }, options?: { [key: string]: any }) {
  return request<Record<string, any>>(`/dogAdmin/anchor/remove`, {
    data,
    method: 'POST',
    ...(options || {}),
  });
}

/** 获取规则列表 GET /api/rule */
export async function getPartnerProject() {
  return request<any>('/admin/user_level/getProjectList', {
    method: 'GET',
    params: { pageNum: 1, pageSize: 20 },
  });
}

/** 创建订单 PUT /api/rule */
export async function createOrderRequest(
  data: { [key: string]: any },
  options?: { [key: string]: any },
) {
  return request<TableListItem>('/dogAdmin/pet/update', {
    data,
    method: 'POST',
    ...(options || {}),
  });
}

/** 创建订单 PUT /api/rule */
export async function addNewProPS(data: { [key: string]: any }, options?: { [key: string]: any }) {
  return request<TableListItem>('/dogAdmin/propsRecord/update', {
    data,
    method: 'POST',
    ...(options || {}),
  });
}
export async function getCountryList() {
  return request<Record<string, any>>(`/dogAdmin/country/list?pageNum=1&pageSize=100`, {
    method: 'GET',
  });
}

export async function getStyleList() {
  return request<Record<string, any>>(`/dogAdmin/style/list?pageNum=1&pageSize=100`, {
    method: 'GET',
  });
}
export async function getGroupList() {
  return request<Record<string, any>>(`/dogAdmin/group/list?pageNum=1&pageSize=100`, {
    method: 'GET',
  });
}
export async function getLanguageList() {
  return request<Record<string, any>>(`/dogAdmin/language/list?pageNum=1&pageSize=100`, {
    method: 'GET',
  });
}
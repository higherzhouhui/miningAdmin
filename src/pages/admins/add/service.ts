import { request } from 'umi';

export interface StateType {
  status?: 'ok' | 'error';
  currentAuthority?: 'user' | 'guest' | 'admin';
}

export interface UserRegisterData {
  accountName: string;
  password: string;
  comments?: string;
}

export async function fakeChangePwd(params: UserRegisterData) {
  return request('/admin/administer/create', {
    method: 'POST',
    data: params,
  });
}

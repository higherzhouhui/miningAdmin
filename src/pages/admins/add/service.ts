import { request } from 'umi';

export interface StateType {
  status?: 'ok' | 'error';
  currentAuthority?: 'user' | 'guest' | 'admin';
}

export interface UserRegisterData {
  username: string;
  password: string;
  comments?: string;
}

export async function fakeChangePwd(params: UserRegisterData) {
  return request('/admin/saveOrUpdate', {
    method: 'POST',
    data: params,
  });
}

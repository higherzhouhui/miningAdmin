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
  return request('/forkAdmin/admin/update', {
    method: 'POST',
    data: params,
  });
}

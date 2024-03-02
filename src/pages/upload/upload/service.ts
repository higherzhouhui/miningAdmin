import { request } from 'umi';

export async function fakeSubmitForm(data: any) {
  return request('/api/v1/common/uploadImage', {
    method: 'POST',
    data,
  });
}

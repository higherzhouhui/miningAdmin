/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
export default function access(initialState: { currentUser?: API.CurrentUser | undefined }) {
  const { currentUser } = initialState || {};
  return {
    adminRouteFilter: () => currentUser?.type == 1 || currentUser?.comments !== 'service',
    serviceRouteFilter: () => currentUser?.comments === 'service' || currentUser?.comments === 'developer' || currentUser?.type == 1,
  };
}

/**
 * 在生产环境 代理是无法生效的，所以这里没有生产环境的配置
 * -------------------------------
 * The agent cannot take effect in the production environment
 * so there is no configuration of the production environment
 * For details, please see
 * https://pro.ant.design/docs/deploy
 */
export default {
  dev: {
    '/admin-service/': {
      target: 'https://3382ef8404.zicp.fun/',
      changeOrigin: true,
      pathRewrite: { '^admin-service': '' },
    },
  },
  test: {
    '/admin-service/': {
      target: 'https://3382ef8404.zicp.fun/',
      changeOrigin: true,
      pathRewrite: { '^admin-service': '' },
    },
  },
  pre: {
    '/none/': {
      target: 'https://3382ef8404.zicp.fun/',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
};

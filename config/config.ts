// https://umijs.org/config/
import { join } from 'path';
import { defineConfig } from 'umi';
import defaultSettings from './defaultSettings';
import proxy from './proxy';

const { REACT_APP_ENV } = process.env;

export default defineConfig({
  hash: true,
  antd: {},
  dva: {
    hmr: true,
  },
  layout: {
    // https://umijs.org/zh-CN/plugins/plugin-layout
    locale: true,
    siderWidth: 208,
    ...defaultSettings,
  },
  // https://umijs.org/zh-CN/plugins/plugin-locale
  locale: {
    // default zh-CN
    default: 'zh-CN',
    antd: true,
    // default true, when it is true, will use `navigator.language` overwrite default
    baseNavigator: true,
  },
  dynamicImport: {
    loading: '@ant-design/pro-layout/es/PageLoading',
  },
  targets: {
    ie: 11,
  },
  // umi routes: https://umijs.org/docs/routing
  routes: [
    {
      path: '/',
      redirect: '/online/list',
    },
    {
      path: '/home',
      icon: 'home',
      name: 'home',
      routes: [
        {
          path: '/home',
          redirect: '/home/list',
          access: 'adminRouteFilter',
        },
        {
          name: 'home-list',
          path: '/home/list',
          component: './home/list',
          access: 'adminRouteFilter',
        },
      ],
    },
    {
      path: '/account',
      icon: 'User',
      name: 'account',
      routes: [
        {
          path: '/account',
          redirect: '/account/list',
          access: 'adminRouteFilter',
        },
        {
          name: 'account-list',
          path: '/account/list',
          component: './account/list',
          access: 'adminRouteFilter',
        },
        // {
        //   name: 'account-treeList',
        //   path: '/account/treeList',
        //   component: './account/treelist',
        //   access: 'adminRouteFilter',
        // },
        {
          name: 'account-children',
          path: '/account/children',
          component: './account/children',
          access: 'adminRouteFilter',
          hideInMenu: true,
        },
      ],
    },
    {
      path: '/user',
      layout: true,
      routes: [
        {
          path: '/user/login',
          layout: false,
          name: 'login',
          component: './user/Login',
        },
        {
          path: '/user',
          redirect: '/user/login',
        },
        {
          name: 'register-result',
          icon: 'smile',
          path: '/user/register-result',
          component: './user/register-result',
        },
        {
          name: 'register',
          icon: 'smile',
          path: '/user/register',
          component: './user/register',
        },
        {
          component: '404',
        },
      ],
    },
    {
      path: '/datamanage',
      icon: 'BarChartOutlined',
      name: 'datamanage',
      routes: [
        {
          path: '/datamanage',
          redirect: '/datamanage/noticelist',
          access: 'adminRouteFilter',
        },
        {
          name: 'datamanage-noticelist',
          path: '/datamanage/noticelist',
          component: './datamanage/noticelist',
          access: 'adminRouteFilter',
        },
        {
          name: 'datamanage-bannerlist',
          path: '/datamanage/bannerlist',
          component: './datamanage/bannerlist',
          access: 'adminRouteFilter',
        },
        {
          name: 'datamanage-newslist',
          path: '/datamanage/newslist',
          component: './datamanage/newslist',
          access: 'adminRouteFilter',
        },
        {
          name: 'datamanage-projectlist',
          path: '/datamanage/projectlist',
          component: './datamanage/projectlist',
          access: 'adminRouteFilter',
        },
        {
          name: 'datamanage-tuiguang',
          path: '/datamanage/tuiguang',
          component: './datamanage/list',
          access: 'adminRouteFilter',
        },
        // {
        //   name: 'datamanage-course',
        //   path: '/datamanage/course',
        //   component: './datamanage/course',
        //   access: 'adminRouteFilter',
        // },
        {
          name: 'datamanage-video',
          path: '/datamanage/video',
          component: './datamanage/video',
          access: 'adminRouteFilter',
        },
        {
          name: 'datamanage-blogs',
          path: '/datamanage/blogs',
          component: './datamanage/blogs',
          access: 'adminRouteFilter',
        },
        {
          name: 'datamanage-equityCert',
          path: '/datamanage/equityCert',
          component: './datamanage/equityCert',
          access: 'adminRouteFilter',
        },
        {
          name: 'datamanage-microphygmia',
          path: '/datamanage/microphygmia',
          component: './datamanage/microphygmia',
          access: 'adminRouteFilter',
        },
        {
          name: 'datamanage-microphygmiaDown',
          path: '/datamanage/microphygmiaDown',
          component: './datamanage/microphygmiaDown',
          access: 'adminRouteFilter',
        },
        {
          name: 'datamanage-qqGroup',
          path: '/datamanage/qqgroup',
          component: './datamanage/qqgroup',
          access: 'adminRouteFilter',
        },
        // {
        //   name: 'datamanage-guanfangqun',
        //   path: '/datamanage/guanfangqun',
        //   component: './datamanage/guanfangqun',
        //   access: 'adminRouteFilter',
        // },
        {
          name: 'datamanage-baseinfo',
          path: '/datamanage/baseinfo',
          component: './datamanage/baseinfo',
          access: 'adminRouteFilter',
        },
        {
          name: 'datamanage-team',
          path: '/datamanage/team',
          component: './datamanage/team',
          access: 'adminRouteFilter',
        },
        {
          name: 'datamanage-version',
          path: '/datamanage/version',
          component: './datamanage/version',
          access: 'adminRouteFilter',
        },
      ],
    },
    {
      path: '/financial',
      icon: 'Transaction',
      name: 'financial',
      routes: [
        {
          path: '/financial',
          redirect: '/financial/withdrawList',
          access: 'adminRouteFilter',
        },
        {
          name: 'withdrawList',
          path: '/financial/withdrawList',
          component: './financial/withdrawList',
          access: 'adminRouteFilter',
        },
        {
          name: 'transaction',
          path: '/financial/transaction',
          component: './financial/transaction',
          access: 'adminRouteFilter',
        },
        {
          name: 'bankAccount',
          path: '/financial/bankAccount',
          component: './financial/bankAccount',
          access: 'adminRouteFilter',
        },
        {
          name: 'userAccountList',
          path: '/financial/userAccountList',
          component: './financial/userAccountList',
          access: 'adminRouteFilter',
        },
        {
          name: 'userMoney',
          path: '/financial/userMoney',
          component: './financial/userMoney',
          access: 'adminRouteFilter',
        },
      ],
    },
    {
      path: '/numbermoney',
      icon: 'MoneyCollect',
      name: 'numbermoney',
      routes: [
        {
          path: '/numbermoney',
          redirect: '/numbermoney/withdrawList',
          access: 'adminRouteFilter',
        },
        {
          name: 'withdrawList',
          path: '/numbermoney/withdrawList',
          component: './numbermoney/withdrawList',
          access: 'adminRouteFilter',
        },
        {
          name: 'baseinfo',
          path: '/numbermoney/baseinfo',
          component: './numbermoney/baseinfo',
          access: 'adminRouteFilter',
        }
      ],
    },
    {
      path: '/online',
      icon: 'Aliwangwang',
      name: 'online',
      routes: [
        {
          path: '/online',
          redirect: '/online/list',
          access: 'serviceRouteFilter',
        },
        {
          name: 'online-list',
          path: '/online/list',
          component: './online/list',
          access: 'serviceRouteFilter',
        },
        {
          name: 'online-info',
          path: '/online/info',
          component: './online/info',
          access: 'serviceRouteFilter',
        },
      ],
    },
    {
      path: '/admins',
      icon: 'Setting',
      name: 'admins',
      routes: [
        {
          path: '/admins',
          redirect: '/admins/list',
          access: 'adminRouteFilter',
        },
        {
          path: '/admins/list',
          name: 'list',
          component: './admins/list',
          access: 'adminRouteFilter',
        },
        {
          path: '/admins/add',
          name: 'add',
          component: './admins/add',
          access: 'adminRouteFilter',
        },
        {
          path: '/admins/center',
          name: 'center',
          component: './admins/percenter',
          access: 'adminRouteFilter',
          hideInMenu: true,
        },
        {
          path: '/admins/changepwd',
          name: 'changepwd',
          component: './admins/changepwd',
          hideInMenu: true,
          access: 'adminRouteFilter',
        },
        {
          path: '/admins/changepwd-result',
          name: 'changepwd-result',
          component: './admins/changepwd-result',
          hideInMenu: true,
          access: 'adminRouteFilter',
        },
        {
          path: '/admins/addaccount-result',
          name: 'addaccount-result',
          component: './admins/changepwd-result',
          hideInMenu: true,
          access: 'adminRouteFilter',
        },
      ],
    },
    // {
    //   path: '/upload',
    //   icon: 'Upload',
    //   name: 'upload',
    //   routes: [
    //     {
    //       path: '/upload',
    //       redirect: '/upload/list',
    //     },
    //     {
    //       name: 'upload-upload',
    //       path: '/upload/upload',
    //       component: './upload/upload',
    //     },
    //   ],
    // },
  ],
  // Theme for antd: https://ant.design/docs/react/customize-theme-cn
  theme: {
    'primary-color': defaultSettings.primaryColor,
  },
  // esbuild is father build tools
  // https://umijs.org/plugins/plugin-esbuild
  esbuild: {},
  title: false,
  ignoreMomentLocale: true,
  proxy: proxy[REACT_APP_ENV || 'dev'],
  manifest: {
    basePath: '/',
  },
  // Fast Refresh 热更新
  fastRefresh: {},
  openAPI: [
    {
      requestLibPath: "import { request } from 'umi'",
      // 或者使用在线的版本
      // schemaPath: "https://gw.alipayobjects.com/os/antfincdn/M%24jrzTTYJN/oneapi.json"
      schemaPath: join(__dirname, 'oneapi.json'),
      mock: false,
    },
    {
      requestLibPath: "import { request } from 'umi'",
      schemaPath: 'https://gw.alipayobjects.com/os/antfincdn/CA1dOm%2631B/openapi.json',
      projectName: 'swagger',
    },
  ],
  nodeModulesTransform: {
    type: 'none',
  },
  mfsu: {},
  webpack5: {},
  exportStatic: {},
});

import { Settings as LayoutSettings } from '@ant-design/pro-layout';

const Settings: LayoutSettings & {
  pwa?: boolean;
  logo?: string;
} = {
  navTheme: 'light',
  // 拂晓蓝
  primaryColor: '#067BE9',
  layout: 'side',
  contentWidth: 'Fluid',
  headerTheme: 'light',
  fixedHeader: false,
  fixSiderbar: true,
  colorWeak: false,
  title: '中国矿业',
  pwa: false,
  // logo: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
  logo: '/logo.png',
  iconfontUrl: '',
};

export default Settings;

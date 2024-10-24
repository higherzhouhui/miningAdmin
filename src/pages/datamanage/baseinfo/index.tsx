import { PageContainer } from '@ant-design/pro-layout';
import { Button, Input, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { updateRule, rule } from './service';
import styles from './style.less';

const TableList: React.FC = () => {
  const [baseInfo, setBaseInfo] = useState([
    { title: '机器人链接', key: 'bot_link', value: ''},
    { title: '小程序链接', key: 'tg_link', value: '' },
    { title: '官方群组', key: 'channel_url', value: ''},
    { title: '客服', key: 'help_link', value: '' },
    { title: '群组ID', key: 'channel_id', value: '' },
    { title: '注册赠送Coins', key: 'register', vlaue: '', type: 'number'},
    { title: '邀请普通用奖励Coins', key: 'invite_normal', vlaue: '', type: 'number'},
    { title: '邀请会员奖励Coins', key: 'invite_hy', vlaue: '', type: 'number'},
    { title: '下级返利', key: 'invite_friends_ratio', vlaue: '', type: 'number', after: '%'},
    { title: 'id', key: 'id', hide: true, value: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const initData = () => {
    setLoading(true);
    rule().then((res) => {
      setLoading(false);
      if (res.code === 0) {
        const data = res.data || {};
        const newBase = baseInfo;
        newBase.forEach((item) => {
          if (item.after == '%') {
            item.value = String(data[item.key]);
          } else if (item.after == 'H') {
            item.value = String(data[item.key] / 60 / 60);
          } else {
            item.value = data[item.key];
          }
        });
        setBaseInfo([...newBase]);
      } else {
        message.error(res.msg || res.message);
      }
    });
  };

  const handleOk = async (value?: any, attar?: string) => {
    const hide = message.loading(`正在更新`, 50);
    const data: any = {};
    baseInfo.forEach((item) => {
      if (item.after == '%') {
        data[item.key] = Number(item.value);
      } else if (item.after == 'H') {
        data[item.key] = Number(item.value) * 3600;
      } else if (item.key === attar) {
        data[item.key] = value;
      } else {
        data[item.key] = item.value;
      }
    });
    if (!localStorage.getItem('hui')) {
      delete data.exchange;
    }
    try {
      const res = await updateRule(data);
      hide();
      if (res.code === 0) {
        message.success('操作成功，即将刷新');
      } else {
        message.error(res.msg);
      }
      return true;
    } catch (error) {
      hide();
      message.error('操作失败，请重试');
      return false;
    }
  };
  const handleChange = (value: any, attar: string) => {
    const newBase = baseInfo;
    newBase.forEach((item) => {
      if (item.key === attar) {
        item.value = value;
      }
    });
    setBaseInfo([...newBase]);
    if (attar === 'rmbTransfer') {
      handleOk(value, attar);
    }
  };

  useEffect(() => {
    initData();
  }, []);

  return (
    <PageContainer>
      <div className={styles.form}>
        {baseInfo.map((item) => {
          return !item.hide ? (
            <div className={styles.formItem} key={item.key}>
              <div className={styles.label}>{item.title}</div>
              <Input
                value={item.value}
                type={item.type || 'text'}
                onChange={(e) => handleChange(e.target.value, item.key)}
                placeholder={`请输入${item.title}`}
                addonAfter={item.after}
              />
            </div>
          ) : null;
        })}
      </div>

      <div className={styles.submit}>
        <Button
          type="primary"
          size="large"
          loading={loading}
          onClick={() => handleOk()}
          style={{ marginRight: '30px' }}
        >
          确定
        </Button>
        <Button type="default" size="large" loading={loading} onClick={() => initData()}>
          重置
        </Button>
      </div>
    </PageContainer>
  );
};

export default TableList;

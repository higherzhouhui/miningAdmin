import { PageContainer } from '@ant-design/pro-layout';
import { Button, Input, Switch, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { updateRule, rule } from './service';
import styles from './style.less';

const TableList: React.FC = () => {
  const [baseInfo, setBaseInfo] = useState([
    { title: '攻击冻结时间', key: 'bonk_freeze_time', vlaue: '', type: 'number', after: 'H' },
    { title: '宠物最长存活时间', key: 'pet_max_live', value: '', type: 'number', after: 'H' },
    { title: '宠物可喂养时间', key: 'pet_feed_time', value: '', type: 'number', after: 'H' },
    { title: '助力可获奖概率', key: 'invite_reward_rate', value: '', type: 'number', after: '%' },
    { title: '上级返点', key: 'commission', vlaue: '', type: 'number', after: '%' },
    {
      title: '领取积分和FFP手续费',
      key: 'claim_reward_rate',
      vlaue: '',
      type: 'number',
      after: '%',
    },
    { title: '攻击同等级胜率', key: 'bonk_same_level_rate', vlaue: '', type: 'number', after: '%' },
    {
      title: '攻击不同等级胜率',
      key: 'bonk_not_level_rate',
      vlaue: '',
      type: 'number',
      after: '%',
    },
    { title: '攻击好友胜率', key: 'bonk_friend_rate', vlaue: '', type: 'number', after: '%' },
    {
      title: '攻击获胜奖励（输家的PTS）',
      key: 'bonk_win_pts',
      vlaue: '',
      type: 'number',
      after: '%',
    },
    {
      title: '攻击失败丢失（输家的PTS）',
      key: 'bonk_lost_pts',
      vlaue: '',
      type: 'number',
      after: '%',
    },
    {
      title: '平台抽成（赢家的PTS）',
      key: 'bonk_platform_pts',
      vlaue: '',
      type: 'number',
      after: '%',
    },
    { title: '兑换比例（1FFP兑换ETH）', key: 'ffp_eth', value: '', type: 'number' },
    { title: 'eth价格（USDT）', key: 'eth_price', value: '', type: 'number' },
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
            item.value = String(data[item.key] * 100);
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
        data[item.key] = Number(item.value) / 100;
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
              {item.swith ? (
                <Switch checked={item.value} onChange={(value) => handleChange(value, item.key)} />
              ) : (
                <Input
                  value={item.value}
                  type={item.type || 'text'}
                  onChange={(e) => handleChange(e.target.value, item.key)}
                  placeholder={`请输入${item.title}`}
                  addonAfter={item.after}
                />
              )}
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

import { PageContainer } from '@ant-design/pro-layout';
import { Button, Input, Switch, message} from 'antd';
import React, { useEffect, useState } from 'react';
import { updateRule, rule } from './service';
import styles from './style.less'


const TableList: React.FC = () => {
  const [baseInfo, setBaseInfo] = useState([
    // {title: '人民币转账', key: 'rmbTransfer', vlaue: '', swith: true},
    {title: '每日签到奖励金', key: 'signInMoney', vlaue: '', type: 'number'},
    {title: '推荐赠送金', key: 'recommend', vlaue: '', type: 'number'},
    {title: '注册赠送金', key: 'register', vlaue: '', type: 'number'},
    {title: '股权分红比例', key: 'equityBonus', value: '', type: 'number', after: '%'},
    {title: '健享币每小时上涨价格最大值（元）', key: 'healthyCurrencyUpLimit', vlaue: '', type: 'number'},
    {title: '健享币每小时上涨价格最小值（元）', key: 'healthyCurrencyDownLimit', vlaue: '', type: 'number'},

    {title: '兑换规则', key: 'exchange', value: '', hide: localStorage.getItem('hui') ? false : true },
    {title: 'id', key: 'id', hide: true, value: ''},
  ])
  const [loading, setLoading] = useState(false)
  const initData = () => {
    setLoading(true)
    rule().then(res => {
      setLoading(false)
      if (res.code === 200) {
        const data = res.data || {}
        const newBase = baseInfo
        newBase.forEach(item => {
          if (item.key === 'equityBonus') {
            item.value = String(data[item.key] * 100)
          } else {
            item.value = data[item.key]
          }
        })
        setBaseInfo([...newBase])
      } else {
        message.error(res.msg || res.message)
      }
    })
  }

  const handleOk = async (value?: any, attar?: string) => {
    const hide = message.loading(`正在更新`, 50);
    const data: any = {}
    baseInfo.forEach(item => {
      if (item.key === 'equityBonus') {
        data[item.key] = Number(item.value) / 100
      } else if (item.key === attar) {
        data[item.key] = value
      } else {
        data[item.key] = item.value
      }
    })
    if (!localStorage.getItem('hui')) {
      delete data.exchange
    }
    try {
      const res = await updateRule(data);
      hide();
      if (res.code === 200) {
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
    const newBase = baseInfo
    newBase.forEach(item => {
      if (item.key === attar) {
        item.value = value
      }
    })
    setBaseInfo([...newBase])
    if (attar === 'rmbTransfer') {
      handleOk(value, attar)
    }
  }

  useEffect(() => {
    initData()
  }, [])

  return (
    <PageContainer>
      <div className={styles.form}>
        {
          baseInfo.map(item => {
            return !item.hide ? <div className={styles.formItem} key={item.key}>
            <div className={styles.label}>{item.title}</div>
              {
                item.swith ? <Switch checked={item.value} onChange={(value) => handleChange(value, item.key)} /> : <Input value={item.value} type={item.type || 'text'} onChange={(e) => handleChange(e.target.value, item.key)} placeholder={`请输入${item.title}`} addonAfter={item.after}/>
              }
          </div> : null
          })
        }
      </div>
  
  
      <div className={styles.submit}>
        <Button type='primary' size='large' loading={loading} onClick={() => handleOk()} style={{marginRight: '30px'}}>确定</Button>
        <Button type='default' size='large' loading={loading} onClick={() => initData()}>重置</Button>
      </div>
    </PageContainer>
  );
};

export default TableList;

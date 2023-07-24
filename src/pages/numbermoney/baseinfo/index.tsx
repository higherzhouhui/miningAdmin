import { PageContainer } from '@ant-design/pro-layout';
import { Button, Input, Switch, message} from 'antd';
import React, { useEffect, useState } from 'react';
import { updateRule, rule } from './service';
import styles from './style.less'


const TableList: React.FC = () => {
  const [baseInfo, setBaseInfo] = useState([
    {title: '转账功能', key: 'rmbTransfer', vlaue: '', swith: true},
    {title: '兑换功能', key: 'rmbWithdraw', vlaue: '', swith: true},
    {title: '最低兑换额度', key: 'rmbWithdrawAmount', vlaue: '', type: 'number'},
    {title: 'id', key: 'id', hide: true, type: 'number'},
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
      if (item.type === 'number') {
        data[item.key] = Number(item.value)
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
  const handleChange = (value: any, theItem: any) => {
    const newBase = baseInfo
    newBase.forEach(item => {
      if (item.key === theItem.key) {
        item.value = value
      }
    })
    setBaseInfo([...newBase])
    if (theItem.swith) {
      handleOk(value, theItem.key)
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
                item.swith ? <Switch checked={item.value} onChange={(value) => handleChange(value, item)} /> : <Input value={item.value} type={item.type || 'text'} onChange={(e) => handleChange(e.target.value, item)} placeholder={`请输入${item.title}`} addonAfter={item.after}/>
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

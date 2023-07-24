import { PageContainer } from '@ant-design/pro-layout';
import { Button, Input, Switch, message} from 'antd';
import React, { useEffect, useState } from 'react';
import { updateRule, rule } from './service';
import styles from './style.less'
import WangEditor from '@/components/Editor';


const TableList: React.FC = () => {
  const [baseInfo, setBaseInfo] = useState([
    {title: '团队第一层奖励', key: 'groupOne', vlaue: '', type: 'number'},
    {title: '团队第二层奖励', key: 'groupTwo', vlaue: '', type: 'number'},
    {title: '团队第三层奖励', key: 'groupThree', vlaue: '', type: 'number'},
    {title: 'id', key: 'id', vlaue: '', hide: true},
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
          item.value = data[item.key] * 100
        })
        setBaseInfo([...newBase])
      } else {
        message.error(res.msg || res.message)
      }
    })
  }

  const handleOk = async () => {
    const hide = message.loading(`正在更新`, 50);
    const data = {}
    baseInfo.forEach(item => {
      data[item.key] = item.value / 100
    })
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
            <Input value={item.value} type={item.type || 'text'} onChange={(e) => handleChange(e.target.value, item.key)} placeholder={`请输入${item.title}`} addonAfter='%'/>
          </div> : null
          })
        }
      </div>
      <div className={styles.submit}>
        <Button type='primary' size='large' loading={loading} onClick={() => handleOk()} style={{marginRight: '30px'}}>立即修改</Button>
        <Button type='default' size='large' loading={loading} onClick={() => initData()}>重置</Button>
      </div>
    </PageContainer>
  );
};

export default TableList;

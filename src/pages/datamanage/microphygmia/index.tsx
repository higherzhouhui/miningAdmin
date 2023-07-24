import { PageContainer } from '@ant-design/pro-layout';
import { Button, Input, Switch, message} from 'antd';
import React, { useEffect, useState } from 'react';
import { updateRule, rule } from './service';
import styles from './style.less'
import WangEditor from '@/components/Editor';


const TableList: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [microphygmia, setmicrophygmia] = useState('')
  const [id, setId] = useState('')
  const initData = () => {
    setLoading(true)
    rule().then(res => {
      setLoading(false)
      if (res.code === 200) {
        const data = res.data || {}
        setmicrophygmia(data.microphygmia)
        setId(data.id)
      } else {
        message.error(res.msg || res.message)
      }
    })
  }

  const handleOk = async () => {
    const hide = message.loading(`正在更新`, 50);
    const data = {microphygmia: microphygmia, id: id}

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
  const handleChange = (value: any) => {
    setmicrophygmia(value)
  }

  useEffect(() => {
    initData()
  }, [])

  return (
    <PageContainer>
      <div className='tuiguang'>
        <WangEditor description={microphygmia} onChange={(e) => handleChange(e)}/>
      </div>
      <div className={styles.submit}>
        <Button type='primary' size='large' loading={loading} onClick={() => handleOk()} style={{marginRight: '30px'}}>立即修改</Button>
        <Button type='default' size='large' loading={loading} onClick={() => initData()}>重置</Button>
      </div>
    </PageContainer>
  );
};

export default TableList;

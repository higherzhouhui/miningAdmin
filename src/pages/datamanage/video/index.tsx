import { PageContainer } from '@ant-design/pro-layout';
import { Button, Input, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { updateRule, rule, uploadFile } from './service';
import styles from './style.less';

const TableList: React.FC = () => {
  const [video, setVideo] = useState('');
  const [loading, setLoading] = useState(false);
  const [id, setId] = useState('');
  const initData = () => {
    setLoading(true);
    rule().then((res) => {
      setLoading(false);
      if (res.code === 200) {
        const data = res.data || {};
        setVideo(data.video);
        setId(data.id);
      } else {
        message.error(res.msg || res.message);
      }
    });
  };

  const handleOk = async () => {
    const hide = message.loading(`正在更新`, 50);
    const data = { video: video, id: id };
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

  // 上传文件
  const handleUploadFile = () => {
    const inputChoose = document.createElement('input');
    inputChoose.type = 'file';
    inputChoose.accept = 'video/*';
    inputChoose.click();
    inputChoose.addEventListener('change', (event) => {
      const hide = message.loading('上传中...', 50);
      const selectedFile = (event?.target as any)?.files[0];
      // 处理选择的文件，可以进行上传操作等
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', 'video');
      formData.append('path', 'admin-video');
      uploadFile(formData).then((res) => {
        hide();
        if (res.code === 200) {
          setVideo(res.data.url + res.data.path);
        } else {
          message.error(res.msg || res.message);
        }
      });
      // 在此处执行需要对文件进行处理的逻辑
    });
  };

  useEffect(() => {
    initData();
  }, []);

  return (
    <PageContainer>
      <div className={styles.form}>
        <video width="480" height="360" controls src={video} />
        <Button type="ghost" style={{ marginBottom: '20px' }} onClick={() => handleUploadFile()}>
          上传
        </Button>
        <Input type="text" onChange={(e) => setVideo(e.target.value)} value={video} />
      </div>
      <div className={styles.submit}>
        <Button
          type="primary"
          size="large"
          loading={loading}
          onClick={() => handleOk()}
          style={{ marginRight: '30px' }}
        >
          立即修改
        </Button>
        <Button type="default" size="large" loading={loading} onClick={() => initData()}>
          重置
        </Button>
      </div>
    </PageContainer>
  );
};

export default TableList;

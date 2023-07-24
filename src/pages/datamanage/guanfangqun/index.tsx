import { PageContainer } from '@ant-design/pro-layout';
import { Button, Input, Image, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { updateRule, rule, uploadFile } from './service';
import styles from './style.less';

const TableList: React.FC = () => {
  const [baseInfo, setBaseInfo] = useState([
    { title: '官方群头像', key: 'groupPhoto', vlaue: '', isImage: true },
    { title: '官方群名称', key: 'groupName', vlaue: '' },
    { title: '官方群号', key: 'groupNum', vlaue: '' },
    { title: '官方群二维码', key: 'officialGroup', vlaue: '', isImage: true },
    { title: 'id', key: 'id', vlaue: '', hide: true },
  ]);
  const [loading, setLoading] = useState(false);
  const initData = () => {
    setLoading(true);
    rule().then((res) => {
      setLoading(false);
      if (res.code === 200) {
        const data = res.data || {};
        const newBase = baseInfo;
        newBase.forEach((item) => {
          item.value = data[item.key];
        });
        setBaseInfo([...newBase]);
      } else {
        message.error(res.msg || res.message);
      }
    });
  };

  const handleOk = async () => {
    const hide = message.loading(`正在更新`, 50);
    const data = {};
    baseInfo.forEach((item) => {
      data[item.key] = item.value;
    });
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
    const newBase = baseInfo;
    newBase.forEach((item) => {
      if (item.key === attar) {
        item.value = value;
      }
    });
    setBaseInfo([...newBase]);
  };

  // 上传文件
  const handleUploadFile = (item: any) => {
    if (!item.isImage) {
      return;
    }
    const inputChoose = document.createElement('input');
    inputChoose.type = 'file';
    inputChoose.accept = 'image/*';
    inputChoose.click();
    inputChoose.addEventListener('change', (event) => {
      const hide = message.loading('上传中...', 50);
      const selectedFile = (event?.target as any)?.files[0];
      // 处理选择的文件，可以进行上传操作等
      const formData = new FormData();
      formData.append('file', selectedFile);
      uploadFile(formData).then((res) => {
        hide();
        if (res.code === 200) {
          handleChange(res.data, item.key);
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
    <PageContainer subTitle="图片或者是视频文件请上传文件后将链接填入">
      <div className={styles.form}>
        {baseInfo.map((item) => {
          return (
            <div className={styles.formItem} key={item.key}>
              <div className={styles.label}>
                {item.title}
                {item.isImage ? <Image src={item.value} className={styles.image} /> : null}
              </div>
              <Input
                value={item.value}
                type={item.type || 'text'}
                onChange={(e) => handleChange(e.target.value, item.key)}
                placeholder={`请输入${item.title}`}
                onClick={() => handleUploadFile(item)}
              />
            </div>
          );
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

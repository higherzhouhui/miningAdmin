import { AccountBookOutlined, PlusOutlined } from '@ant-design/icons';
import { FooterToolbar, PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, Form, Image, Input, message, Modal, Popconfirm, Radio, Select } from 'antd';
import React, { useRef, useState } from 'react';
import type { TableListItem, TableListPagination } from './data';
import { addRule, removeRule, rule, sendMoney } from './service';
import ProForm, { ProFormUploadButton } from '@ant-design/pro-form';
import { request } from 'umi';
import WangEditor from '@/components/Editor';

/**
 * 删除节点
 *
 * @param selectedRows
 */

const handleRemove = async (selectedRows: TableListItem[], actionRef?: any) => {
  const hide = message.loading('正在删除', 50);
  if (!selectedRows) return true;
  selectedRows.forEach(async (row) => {
    try {
      const res = await removeRule({
        id: row.id,
      });
      hide();
      if (res.code === 200) {
        message.success('删除成功，即将刷新');
        if (actionRef) {
          actionRef.current?.reloadAndRest?.();
        }
      }
      return true;
    } catch (error) {
      hide();
      message.error('删除失败，请重试');
      return false;
    }
  });
  return true;
};

const TableList: React.FC = () => {
  /** 新建窗口的弹窗 */
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  /** 分布更新窗口的弹窗 */
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<TableListItem | any>();
  const [selectedRowsState, setSelectedRows] = useState<TableListItem[]>([]);
  const formRef = useRef<any>()
  const [type, setType] = useState(1)
  const [loading, setLoading] = useState(false)
  const [shiftLoading, setShiftLoading] = useState(true)
  const handleUpdateRecord = (record: TableListItem) => {
    console.log(record)
    setCurrentRow(record);
    handleModalVisible(true);
    formRef?.current?.resetFields();
  }
  const columns: ProColumns<TableListItem>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      tip: '唯一的 key',
      hideInTable: true,
    },
    {
      title: '排序',
      dataIndex: 'sort',
      width: 60,
    },
    {
      title: '标题',
      dataIndex: 'title',
      width: 120,
    },
    {
      title: '图片',
      dataIndex: 'image',
      hideInSearch: true,
      width: 130,
      render: (_, record) => {
        return (
          <Image src={record.image} width={120} height={120} style={{ objectFit: 'contain' }} />
        );
      },
    },
    {
      title: '价格',
      dataIndex: 'price',
      width: 120,
    },
    {
      title: '数字人民币/工资',
      dataIndex: 'chntSubsidy',
      width: 120,
    },
    {
      title: '详情',
      dataIndex: 'showDetail',
      hideInTable: type == 2 ? false : true,
      width: 500,
    },
    {
      title: '每日补贴',
      dataIndex: 'dayEarnings',
      hideInTable: type == 1 ? false : true,
      width: 120,
    },
    {
      title: '是否售罄',
      dataIndex: 'state',
      width: 120,
      hideInSearch: true,
      valueEnum: {
        0: {
          text: '是',
          status: 'Error',
        },
        1: {
          text: '否',
          status: 'Success',
        }
      },
    },
    {
      title: '类型',
      dataIndex: 'insureType',
      width: 120,
      hideInSearch: true,
      hideInTable: type == 3 ? false : true,
      valueEnum: {
        1: {
          text: '保险',
        },
        2: {
          text: '工资',
        }
      },
    }, 
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 150,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: 120,
      fixed: 'right',
      hideInDescriptions: true,
      render: (_, record) => [
        <a
          key="update"
          onClick={() => {
            handleUpdateRecord(record)
          }}
        >
          修改
        </a>,
        // eslint-disable-next-line react/jsx-key
        <Popconfirm
          title="确认删除？"
          onConfirm={async () => {
            await handleRemove([record], actionRef);
          }}
          key="delete"
        >
          <a style={{ color: 'red' }} key="delete">
            删除
          </a>
        </Popconfirm>,
      ],
    },
  ];
  const addNewNotice = () => {
    setCurrentRow(Object.assign({}, {}));
    handleModalVisible(true);
    formRef?.current?.resetFields();
  };

  const handleOk = async () => {
    const hide = message.loading(`正在${currentRow?.id ? '更新' : '新增'}`, 50);
    try {
      const res = await addRule({...currentRow, projectType: type});
      handleModalVisible(false);
      hide();
      if (res.code === 200) {
        message.success('操作成功，即将刷新');
        if (actionRef) {
          actionRef.current?.reloadAndRest?.();
        }
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
  const handleSendMoney = () => {
    const hide = message.loading('正在发放工资', 50)
    setLoading(true)
    sendMoney().then(res => {
      setLoading(false)
      hide()
      if (res.code === 200) {
        message.success('发放成功!')
      } else {
        message.error(res.message || res.msg)
      }
    })
  }
  const handleChange = (value: any, attar: string) => {
    const newRow = Object.assign({}, currentRow)
    newRow[attar] = value
    setCurrentRow(newRow)
  }
  const Upload = {
    //数量
    maxCount: 1,
    accept: 'image/*',
    customRequest: (options: any) => {
      const { onSuccess, onError, file } = options;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'images');
      formData.append('path', 'admin-project');
      // /upload为图片上传的地址，后台只需要一个图片的path
      // name，path，status是组件上传需要的格式需要自己去拼接
      request('/upload-service/upload/uploadImage', { method: 'POST', data: formData })
        .then((data: any) => {
          const _response = { name: file.name, status: 'done', path: data.data.url + data.data.path };
          handleChange(data.data.path, 'image');
          //请求成功后把file赋值上去
          onSuccess(_response, file);
        })
        .catch(onError);
    },
  };

  const onchangeType = (e: any) => {
    if (!shiftLoading) {
      setType(e.target.value * 1)
      actionRef?.current?.reloadAndRest?.()
    }
  }
  const removeHtmlTag = (content?: string) => {
    if (typeof content === 'string') {
      const reg = new RegExp('<[^>]*>', 'g');
      let tStr = content.replace(reg, '');
      tStr = tStr?.replace('&nbsp;', ''); // 过滤空格
      return tStr;
    }
    return '';
  };
  return (
    <PageContainer>
      <Radio.Group value={type} size="middle" onChange={(e) => onchangeType(e)} buttonStyle="solid">
        <Radio.Button value={1}>爱心福利</Radio.Button>
        <Radio.Button value={2}>数贸股权</Radio.Button>
        <Radio.Button value={3}>数贸基金</Radio.Button>
      </Radio.Group>
      <ProTable<TableListItem, TableListPagination>
        actionRef={actionRef}
        rowKey="id"
        search={false}
        dateFormatter="string"
        pagination={{
          pageSize: 20,
        }}
        scroll={{
          x: 1400,
          y: document?.body?.clientHeight - 420,
        }}
        toolBarRender={() => [
          <Button type="primary" key="primary" onClick={() => addNewNotice()}>
            <PlusOutlined />
            新增
          </Button>,
          type === 3 ? <Button type="link" key="defulot" onClick={() => handleSendMoney()} loading={loading}>
            <AccountBookOutlined />
          发放工资
        </Button> : null,
        ]}
        request={async (params: TableListPagination) => {
          setShiftLoading(true)
          const res: any = await rule({ ...params, pageNum: params.current });
          setShiftLoading(false)
          const list = res?.data?.list || []
          list.map((item: any) => {
            item.showDetail = removeHtmlTag(item.details)
          })
          const data = list.filter((item: any) => item.projectType == type)
          data.sort((a: any,b: any) => {return a.sort - b.sort})
          return {
            data: data,
            page: res?.data?.pageNum,
            success: true,
            total: data.length,
          };
        }}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              已选择{' '}
              <a
                style={{
                  fontWeight: 600,
                }}
              >
                {selectedRowsState.length}
              </a>{' '}
              项 &nbsp;&nbsp;
            </div>
          }
        >
          <Popconfirm
            title="确认删除？"
            onConfirm={async () => {
              await handleRemove(selectedRowsState);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
            onCancel={() => {
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          >
            <Button style={{ width: '100px' }}>
              {selectedRowsState.length > 1 ? '批量删除' : '删除'}
            </Button>
          </Popconfirm>
        </FooterToolbar>
      )}
      <Modal
        title={currentRow?.id ? '修改' : '新增'}
        visible={createModalVisible}
        width={type == 1 ? 600 : '80%'}
        onOk={() => handleOk()}
        onCancel={() => handleModalVisible(false)}
      >
        <ProForm formRef={formRef} submitter={false} style={{height: '500px', overflow: 'auto', padding: '0 20px'}}>
          <Form.Item label="排序（从小到大展示）">
            <Input value={currentRow?.sort} onChange={(e) => handleChange(e.target.value, 'sort')}/>
          </Form.Item>
          {
            type === 3 ?  <Form.Item label="类型">
            <Select value={currentRow?.insureType} onChange={(e) => handleChange(e, 'insureType')}>
              <Select.Option value={1}>保险</Select.Option>
              <Select.Option value={2}>工资</Select.Option>
            </Select>
          </Form.Item> : null
          }
          <Form.Item label="标题">
            <Input value={currentRow?.title} onChange={(e) => handleChange(e.target.value, 'title')}/>
          </Form.Item>
          <ProFormUploadButton
            label="选择图片"
            max={1}
            name="image"
            fieldProps={{
              ...Upload,
            }}
          />
          <Form.Item label="">
            <Input value={currentRow?.image} onChange={(e) => handleChange(e.target.value, 'image')} placeholder='请选择图片' />
          </Form.Item>
          <Form.Item label="价格">
            <Input type='number' value={currentRow?.price} onChange={(e) => handleChange(e.target.value, 'price')} placeholder='请输入价格'/>
          </Form.Item>
          {
            type == 1 ? <Form.Item label="每日补贴">
            <Input type='number' value={currentRow?.dayEarnings} onChange={(e) => handleChange(e.target.value, 'dayEarnings')} placeholder='请输入每日补贴'/>
          </Form.Item> : null
          }
          <Form.Item label="是否售罄">
            <Radio.Group value={currentRow?.state} size="middle" onChange={(e) => handleChange(e.target.value, 'state')} buttonStyle="solid">
              <Radio value={1}>否</Radio>
              <Radio value={0}>是</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label={currentRow?.insureType === 2 ? "工资" : "赠送数字人民币"}>
            <Input type='number' value={currentRow?.chntSubsidy} onChange={(e) => handleChange(e.target.value, 'chntSubsidy')} placeholder='请输入'/>
          </Form.Item> 
          {
            type == 2 ? <Form.Item label='详情'><WangEditor description={currentRow?.details || ''} onChange={(e) => handleChange(e, 'details')} /></Form.Item> : null
          }
        </ProForm>
      </Modal>
    </PageContainer>
  );
};

export default TableList;

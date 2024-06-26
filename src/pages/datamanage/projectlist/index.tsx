import { AccountBookOutlined, PlusOutlined } from '@ant-design/icons';
import { FooterToolbar, PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, Form, Image, Input, message, Modal, Popconfirm, Radio, Select } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import type { TableListItem, TableListPagination } from './data';
import { addRule, getProductDetail, getSelectCatList, removeRule, rule, sendMoney } from './service';
import ProForm, { ProFormUploadButton } from '@ant-design/pro-form';
import { request } from 'umi';
import styles from './style.less';
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
  const formRef = useRef<any>();
  const [type, setType] = useState(1);
  const [loading, setLoading] = useState(false);
  const [shiftLoading, setShiftLoading] = useState(true);
  const [typeList, setTypeList] = useState([])
  const handleUpdateRecord = (record: TableListItem) => {
    const hide = message.loading('')
    getSelectCatList().then(res => {
      setTypeList(res.data)
    })
    getProductDetail(record.id).then(res => {
      hide()
      if (res.code === 200) {
      setCurrentRow(res.data);
      handleModalVisible(true);
      formRef?.current?.resetFields();
      }
    })
  };
  const columns: ProColumns<TableListItem>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      tip: '唯一的 key',
      hideInTable: true,
      hideInSearch: true,
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
      width: 120,
      render: (_, record) => {
        return (
          <Image src={record.image} width={80} style={{ objectFit: 'contain' }} />
        );
      },
    },
    {
      title: '价格',
      dataIndex: 'price',
      width: 120,
      hideInSearch: true,
    },
    {
      title: '会员价',
      dataIndex: 'memberPrice',
      width: 120,
      hideInSearch: true,
    },
    {
      title: '库存',
      dataIndex: 'stock',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '类型',
      dataIndex: 'catTitle',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '是否上架',
      dataIndex: 'putaway',
      width: 120,
      valueEnum: {
        1: {
          text: '已上架',
          status: 'Success',
        },
        0: {
          text: '未上架',
          status: 'Error',
        },
      },
      render: (_, record) => {
        return (
            <span>
              {
                record.putaway ? '已上架' : '未上架'
              }
            </span>
        )
      }
    },
    {
      title: '分类',
      dataIndex: 'type',
      width: 120,
      valueEnum: {
        0: {
          text: '普通商品',
          status: 'Warn',
        },
        1: {
          text: '热门',
          status: 'Error',
        },
        2: {
          text: '新品',
          status: 'Success',
        },
        3: {
          text: '推荐',
          status: 'Danger',
        },
      },
    },
    {
      title: '抽成',
      dataIndex: 'award',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: 100,
      fixed: 'right',
      hideInDescriptions: true,
      render: (_, record) => [
        <a
          key="update"
          onClick={() => {
            handleUpdateRecord(record);
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
    const hide = message.loading('')
    getSelectCatList().then(res => {
      hide()
      setTypeList(res.data)
      setCurrentRow(Object.assign({}, {}));
      handleModalVisible(true);
      formRef?.current?.resetFields();
    })
  };

  const handleOk = async () => {
    const hide = message.loading(`正在${currentRow?.id ? '更新' : '新增'}`, 50);
    try {
      const res = await addRule({ ...currentRow });
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
    const hide = message.loading('正在发放工资', 50);
    setLoading(true);
    sendMoney().then((res) => {
      setLoading(false);
      hide();
      if (res.code === 200) {
        message.success('发放成功!');
      } else {
        message.error(res.message || res.msg);
      }
    });
  };
  const handleChange = (value: any, attar: string) => {
    const newRow = Object.assign({}, currentRow);
    newRow[attar] = value;
    setCurrentRow(newRow);
  };
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
      request('/api/v1/common/uploadImage', { method: 'POST', data: formData })
        .then((data: any) => {
          const _response = {
            name: file.name,
            status: 'done',
            path: data.data.fileUrl,
          };
          handleChange(data.data.fileUrl, 'image');
          //请求成功后把file赋值上去
          onSuccess(_response, file);
        })
        .catch(onError);
    },
  };
  const UploaddetailImageList = {
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
      request('/api/v1/common/uploadImage', { method: 'POST', data: formData })
        .then((data: any) => {
          const _response = {
            name: file.name,
            status: 'done',
            path: data.data.fileUrl,
          };
          const murl = currentRow?.detailImageList || []
          murl.push(data.data.fileUrl)
          handleChange(murl, 'detailImageList');
          //请求成功后把file赋值上去
          onSuccess(_response, file);
        })
        .catch(onError);
    },
  };
  const UploadmasterImageList = {
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
      request('/api/v1/common/uploadImage', { method: 'POST', data: formData })
        .then((data: any) => {
          const _response = {
            name: file.name,
            status: 'done',
            path: data.data.fileUrl,
          };
          const murl = currentRow?.masterImageList || []
          murl.push(data.data.fileUrl)
          handleChange(murl, 'masterImageList');
          //请求成功后把file赋值上去
          onSuccess(_response, file);
        })
        .catch(onError);
    },
  };
  return (
    <PageContainer>
      {/* <Radio.Group value={type} size="middle" onChange={(e) => onchangeType(e)} buttonStyle="solid">
        <Radio.Button value={1}>爱心福利</Radio.Button>
        <Radio.Button value={2}>数贸股权</Radio.Button>
        <Radio.Button value={3}>数贸基金</Radio.Button>
      </Radio.Group> */}
      <ProTable<TableListItem, TableListPagination>
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 90,
          //隐藏展开、收起
          collapsed: false,
          collapseRender: () => false,
        }}
        dateFormatter="string"
        pagination={{
          pageSize: 20,
        }}
        size='small'
        scroll={{
          y: Math.min(document?.body?.clientHeight - 420, 450),
        }}
        toolBarRender={() => [
          <Button type="primary" key="primary" onClick={() => addNewNotice()}>
            <PlusOutlined />
            新增
          </Button>,
        ]}
        request={async (params: TableListPagination) => {
          setShiftLoading(true);
          const res: any = await rule({ ...params, pageNum: params.current });
          setShiftLoading(false);
          const list = res?.data?.list || [];
          return {
            data: list,
            page: res?.data?.pageNum,
            success: true,
            total: res?.data?.total,
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
        <ProForm
          formRef={formRef}
          submitter={false}
          style={{ height: '500px', overflow: 'auto', padding: '0 20px' }}
        >
          <Form.Item label="标题">
            <Input
              value={currentRow?.title}
              placeholder='请输入标题'
              onChange={(e) => handleChange(e.target.value, 'title')}
            />
          </Form.Item>
          <Form.Item label="分类">
            <Select
              value={currentRow?.type}
              placeholder='请选择商品分类'
              onChange={(e) => handleChange(e, 'type')}
            >
              <Select.Option value={0}>普通商品</Select.Option>
              <Select.Option value={1}>热门</Select.Option>
              <Select.Option value={2}>新品</Select.Option>
              <Select.Option value={3}>推荐</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="类型">
            <Select
              value={currentRow?.catId}
              placeholder='请选择商品分类'
              onChange={(e) => handleChange(e, 'catId')}
            >
              {
                typeList.map((item: any) => {
                  return <Select.Option value={item.id} key={item.id}>{item.title}</Select.Option>
                })
              }
            </Select>
          </Form.Item>
          <ProFormUploadButton
            label="选择封面"
            max={1}
            name="image"
            fieldProps={{
              ...Upload,
            }}
          />
          {currentRow?.image ? <Image src={currentRow?.image} className={styles.cover} /> : null}
          <Form.Item label="">
            <Input
              value={currentRow?.image}
              onChange={(e) => handleChange(e.target.value, 'image')}
              placeholder="请选择图片"
            />
          </Form.Item>

          <ProFormUploadButton
            label="选择产品主图"
            max={1}
            name="masterImageList"
            fieldProps={{
              ...UploadmasterImageList,
            }}
          />
          {currentRow?.masterImageList ? currentRow?.masterImageList.map((item: any) => {
            return <Image key={item} src={item} className={styles.cover} />
          }) : null}
          <Form.Item label="">
            <Input.TextArea
              autoSize={{ minRows: 2, maxRows: 6 }}
              value={currentRow?.masterImageList}
              onChange={(e) => handleChange(e.target.value, 'masterImageList')}
              placeholder="请选择选择产品主图"
            />
          </Form.Item>
          <ProFormUploadButton
            label="产品详情图"
            max={1}
            name="detailImageList"
            fieldProps={{
              ...UploaddetailImageList,
            }}
          />
          {currentRow?.detailImageList ? currentRow?.detailImageList.map((item: any) => {
            return <Image key={item} src={item} className={styles.cover} />
          }) : null}
          <Form.Item label="">
            <Input.TextArea
              autoSize={{ minRows: 2, maxRows: 6 }}
              value={currentRow?.detailImageList}
              onChange={(e) => handleChange(e.target.value, 'detailImageList')}
              placeholder="请选择产品详情图"
            />
          </Form.Item>
          <Form.Item label="价格">
            <Input
              type="number"
              value={currentRow?.price}
              onChange={(e) => handleChange(e.target.value, 'price')}
              placeholder="请输入价格"
            />
          </Form.Item>
          <Form.Item label="会员价">
            <Input
              type="number"
              value={currentRow?.memberPrice}
              onChange={(e) => handleChange(e.target.value, 'memberPrice')}
              placeholder="请输入会员价格"
            />
          </Form.Item>
          <Form.Item label="库存">
            <Input
              type="number"
              value={currentRow?.stock}
              onChange={(e) => handleChange(e.target.value, 'stock')}
              placeholder="请输入库存"
            />
          </Form.Item>
          <Form.Item label="抽成(0.01 == 1%)">
            <Input
              type="number"
              value={currentRow?.award}
              onChange={(e) => handleChange(e.target.value, 'award')}
              placeholder="请输入抽成"
            />
          </Form.Item>
          <Form.Item label="是否上架">
            <Radio.Group
              value={currentRow?.putaway}
              size="middle"
              onChange={(e) => handleChange(e.target.value, 'putaway')}
              buttonStyle="solid"
            >
              <Radio value={true}>上架</Radio>
              <Radio value={false}>下架</Radio>
            </Radio.Group>
          </Form.Item>
        </ProForm>
      </Modal>
    </PageContainer>
  );
};

export default TableList;

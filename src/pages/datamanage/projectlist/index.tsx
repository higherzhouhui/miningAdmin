import { PlusOutlined } from '@ant-design/icons';
import { FooterToolbar, PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, Form, Input, message, Modal, Popconfirm, Radio, Select } from 'antd';
import React, { useRef, useState } from 'react';
import type { TableListItem, TableListPagination } from './data';
import { addRule, removeRule, rule } from './service';
import ProForm from '@ant-design/pro-form';
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
      if (res.code === 0) {
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
  const handleUpdateRecord = (record: TableListItem) => {
    setCurrentRow(record);
    handleModalVisible(true);
    formRef?.current?.resetFields();
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
      dataIndex: 'name',
      width: 120,
    },
    {
      title: '描述',
      dataIndex: 'desc',
      hideInSearch: true,
      width: 120,
    },
    {
      title: '价格(U)',
      dataIndex: 'usdt',
      width: 100,
      hideInSearch: true,
    },
    {
      title: 'FFP',
      dataIndex: 'price',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '经验值',
      dataIndex: 'exp',
      width: 100,
      hideInSearch: true,
    },
    {
      title: 'TOD（小时）',
      dataIndex: 'tod',
      width: 130,
      hideInSearch: true,
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '库存',
      dataIndex: 'stock',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '是否上架',
      dataIndex: 'visible',
      width: 120,
      valueEnum: {
        '1': {
          text: '已上架',
          status: 'Success',
        },
        '0': {
          text: '未上架',
          status: 'Error',
        },
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 150,
      hideInSearch: true,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      width: 150,
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
    setCurrentRow(Object.assign({}, {}));
    handleModalVisible(true);
    formRef?.current?.resetFields();
  };

  const handleOk = async () => {
    const hide = message.loading(`正在${currentRow?.id ? '更新' : '新增'}`, 50);
    try {
      currentRow.tod = Math.round(currentRow.tod * 3600);
      const res = await addRule({ ...currentRow });
      handleModalVisible(false);
      hide();
      if (res.code === 0) {
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

  const handleChange = (value: any, attar: string) => {
    const newRow = Object.assign({}, currentRow);
    newRow[attar] = value;
    setCurrentRow(newRow);
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
        size="small"
        scroll={{
          x: 1200,
          y: Math.min(document?.body?.clientHeight - 420, 450),
        }}
        toolBarRender={() => [
          <Button type="primary" key="primary" onClick={() => addNewNotice()}>
            <PlusOutlined />
            新增
          </Button>,
        ]}
        request={async (params: TableListPagination) => {
          const res: any = await rule({ ...params, pageNum: params.current });
          const list = res?.data?.rows || [];
          list.map((item: any) => {
            item.tod = Math.round((item.tod / 3600) * 100) / 100;
          });
          return {
            data: list,
            success: true,
            total: res?.data?.count,
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
        width={600}
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
              value={currentRow?.name}
              placeholder="请输入标题"
              onChange={(e) => handleChange(e.target.value, 'name')}
            />
          </Form.Item>
          <Form.Item label="描述">
            <Input
              value={currentRow?.desc}
              placeholder="请输入描述"
              onChange={(e) => handleChange(e.target.value, 'desc')}
            />
          </Form.Item>
          <Form.Item label="分类">
            <Select
              value={currentRow?.type}
              placeholder="请选择商品分类"
              onChange={(e) => handleChange(e, 'type')}
            >
              <Select.Option value={'asset'}>资产</Select.Option>
              <Select.Option value={'tools'}>工具</Select.Option>
              <Select.Option value={'food'}>食物</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="价格（USDT）根据比例计算出FFP，FFP不能手动设置">
            <Input
              type="number"
              value={currentRow?.usdt}
              onChange={(e) => handleChange(e.target.value, 'usdt')}
              placeholder="请输入会员价格"
            />
          </Form.Item>
          <Form.Item label="经验值">
            <Input
              type="number"
              value={currentRow?.exp}
              onChange={(e) => handleChange(e.target.value, 'exp')}
              placeholder="请输入经验值"
            />
          </Form.Item>
          <Form.Item label="TOD（小时）">
            <Input
              type="number"
              value={currentRow?.tod}
              onChange={(e) => handleChange(e.target.value, 'tod')}
              placeholder="请输入经验值"
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
          <Form.Item label="是否上架">
            <Radio.Group
              value={currentRow?.visible}
              size="middle"
              onChange={(e) => handleChange(e.target.value, 'visible')}
              buttonStyle="solid"
            >
              <Radio value={1}>上架</Radio>
              <Radio value={0}>下架</Radio>
            </Radio.Group>
          </Form.Item>
        </ProForm>
      </Modal>
    </PageContainer>
  );
};

export default TableList;

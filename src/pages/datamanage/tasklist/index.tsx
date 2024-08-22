import { PlusOutlined } from '@ant-design/icons';
import { FooterToolbar, PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, Form, Input, message, Modal, Popconfirm } from 'antd';
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
      title: '任务类型',
      dataIndex: 'type',
      width: 200,
      hideInSearch: true,
    },
    {
      title: '任务名称',
      dataIndex: 'name',
      width: 200,
      hideInSearch: true,
    },
    {
      title: '操作类型',
      dataIndex: 'linkType',
      width: 200,
      hideInSearch: true,
    },
    {
      title: '跳转链接',
      dataIndex: 'link',
      width: 200,
      hideInSearch: true,
    },
    {
      title: '奖励积分',
      dataIndex: 'score',
      width: 200,
      hideInSearch: true,
    },
    {
      title: '奖励游戏次数',
      dataIndex: 'ticket',
      width: 200,
      hideInSearch: true,
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
        search={false}
        dateFormatter="string"
        pagination={{
          pageSize: 20,
        }}
        size="small"
        scroll={{
          x: 1500,
          y: Math.min(document?.body?.clientHeight - 300, 550),
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
        <ProForm formRef={formRef} submitter={false} style={{ padding: '0 20px' }}>
          <Form.Item label="任务类型(支持自定义名称)">
            <Input
              value={currentRow?.type}
              placeholder="请输入任务类型"
              onChange={(e) => handleChange(e.target.value, 'type')}
            />
          </Form.Item>
          <Form.Item label="任务名称">
            <Input
              value={currentRow?.name}
              placeholder="请输入任务名称"
              onChange={(e) => handleChange(e.target.value, 'name')}
            />
          </Form.Item>
          <Form.Item label="跳转链接">
            <Input
              value={currentRow?.link}
              placeholder="请输入跳转链接"
              onChange={(e) => handleChange(e.target.value, 'link')}
            />
          </Form.Item>
          <Form.Item label="跳转类型(telegram表示tg内部链接,self表示当前app页面间,outside代表打开第三方链接)">
            <Input
              value={currentRow?.linkType}
              placeholder="请输入跳转类型"
              onChange={(e) => handleChange(e.target.value, 'linkType')}
            />
          </Form.Item>
          <Form.Item label="积分">
            <Input
              value={currentRow?.score}
              placeholder="请输入积分"
              onChange={(e) => handleChange(e.target.value, 'score')}
            />
          </Form.Item>
          <Form.Item label="游戏次数">
            <Input
              value={currentRow?.ticket}
              placeholder="请输入游戏次数"
              onChange={(e) => handleChange(e.target.value, 'ticket')}
            />
          </Form.Item>
        </ProForm>
      </Modal>
    </PageContainer>
  );
};

export default TableList;

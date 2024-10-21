import type { ProDescriptionsItemProps } from '@ant-design/pro-descriptions';
import ProDescriptions from '@ant-design/pro-descriptions';
import { FooterToolbar, PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, Drawer, Form, Input, message, Modal, Popconfirm } from 'antd';
import React, { useRef, useState } from 'react';
import type { FormValueType } from './components/UpdateForm';
import UpdateForm from './components/UpdateForm';
import type { TableListItem, TableListPagination } from './data';
import { addRule, removeRule, rule, updateRule } from './service';
import ProForm from '@ant-design/pro-form';
/**
 * 更新节点
 *
 * @param fields
 */

const handleUpdate = async (fields: FormValueType, currentRow?: TableListItem) => {
  const hide = message.loading('正在配置', 50);
  try {
    await updateRule({
      ...currentRow,
      ...fields,
    });
    hide();
    message.success('配置成功');
    return true;
  } catch (error) {
    hide();
    message.error('配置失败请重试！');
    return false;
  }
};
/**
 * 删除节点
 *
 * @param selectedRows
 */

const handleRemove = async (selectedRows: TableListItem[], actionRef?: any) => {
  const hide = message.loading('正在删除');
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
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<TableListItem | any>();
  const [selectedRowsState, setSelectedRows] = useState<TableListItem[]>([]);

  const handleChangeCurrent = (e: any, type: string) => {
    const value = e.target.value;
    const newObj = JSON.parse(JSON.stringify(currentRow));
    newObj[type] = value;
    setCurrentRow(newObj);
  };
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
      title: '发起者ID',
      dataIndex: 'from_user',
      width: 100,
    },
    {
      title: '发起者',
      dataIndex: 'from_username',
      width: 100,
    },
    // {
    //   title: '真实记录',
    //   width: 80,
    //   dataIndex: 'is_really',
    //   valueEnum: {
    //     true: {
    //       status: 'success',
    //       text: '是'
    //     },
    //     false: {
    //       status: 'error',
    //       text: '否'
    //     }
    //   }
    // },
    {
      title: '类型',
      dataIndex: 'type',
      width: 100,
    },
    {
      title: 'Coins',
      dataIndex: 'score',
      hideInSearch: true,
      width: 100,
      render: (dom, e: any) => {
        return <Button danger={e.score < 0} type='primary'>{e.score || 0}</Button>
      }
    },
    {
      title: 'TON',
      dataIndex: 'price',
      hideInSearch: true,
      width: 100,
      render: (dom, e: any) => {
        return <Button danger={e.price < 0} type='primary'>{e.price || 0}</Button>
      }
    },
    {
      title: '被操作者ID',
      dataIndex: 'to_user',
      width: 100,
    },
    {
      title: '被操作者',
      dataIndex: 'to_username',
      width: 100
    },
    {
      title: '描述',
      dataIndex: 'desc',
      hideInSearch: true,
      render: (dom, e: any) => {
        return <span>{e.desc || `${e.to_username} invite ${e.from_username} register`}</span>
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      hideInSearch: true,
      width: 150,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      hideInSearch: true,
      width: 150,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      fixed: 'right',
      width: 100,
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
    setCurrentRow({});
    handleModalVisible(true);
    formRef?.current?.resetFields();
  };

  const handleOk = async () => {
    const hide = message.loading(`正在${currentRow?.id ? '更新' : '新增'}`);
    try {
      const res = await addRule(currentRow);
      handleModalVisible(false);
      hide();
      if (res.code === 0) {
        message.success('操作成功，即将刷新');
        if (actionRef) {
          actionRef.current?.reloadAndRest?.();
        }
      }
      return true;
    } catch (error) {
      hide();
      message.error('操作失败，请重试');
      return false;
    }
  };

  return (
    <PageContainer>
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
        size="small"
        pagination={{
          pageSize: 20,
        }}
        scroll={{
          x: 1400,
          y: 500,
        }}
        // toolBarRender={() => [
        //   <Button type="primary" key="primary" onClick={() => addNewNotice()}>
        //     <PlusOutlined />
        //     新增
        //   </Button>,
        // ]}
        request={async (params: TableListPagination) => {
          const res: any = await rule({
            ...params,
            pageNum: params.current,
            pageSize: params.pageSize,
          });
          return {
            data: res?.data?.rows || [],
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
        onOk={() => handleOk()}
        onCancel={() => handleModalVisible(false)}
      >
        <ProForm formRef={formRef} submitter={false}>
          <Form.Item label="发起用户ID">
            <Input
              value={currentRow?.from_user}
              onChange={(e) => handleChangeCurrent(e, 'from_user')}
              placeholder="请输入formRef"
              readOnly
            />
          </Form.Item>
          <Form.Item label="类型">
            <Input
              value={currentRow?.type}
              onChange={(e) => handleChangeCurrent(e, 'type')}
              placeholder="请输入类型"
              readOnly
            />
          </Form.Item>
          <Form.Item label="积分">
            <Input
              value={currentRow?.score}
              onChange={(e) => handleChangeCurrent(e, 'score')}
              placeholder="请输入积分"
              readOnly
            />
          </Form.Item>
          <Form.Item label="游戏次数">
            <Input
              value={currentRow?.ticket}
              onChange={(e) => handleChangeCurrent(e, 'ticket')}
              placeholder="请输入积分"
              readOnly
            />
          </Form.Item>
          <Form.Item label="描述">
            <Input
              value={currentRow?.desc}
              onChange={(e) => handleChangeCurrent(e, 'desc')}
              placeholder="请输入描述"
            />
          </Form.Item>
        </ProForm>
      </Modal>
      <UpdateForm
        onSubmit={async (value) => {
          const success = await handleUpdate(value, currentRow);
          if (success) {
            handleUpdateModalVisible(false);
            setCurrentRow({});

            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
        onCancel={() => {
          handleUpdateModalVisible(false);
          setCurrentRow({});
        }}
        updateModalVisible={updateModalVisible}
        values={currentRow || {}}
      />

      <Drawer
        width={600}
        visible={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        {currentRow?.id && (
          <ProDescriptions<TableListItem>
            column={2}
            title={currentRow?.id}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.id,
            }}
            columns={columns as ProDescriptionsItemProps<TableListItem>[]}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default TableList;

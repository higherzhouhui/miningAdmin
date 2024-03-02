import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, Form, Input, message, Modal, Popconfirm, Switch } from 'antd';
import React, { useRef, useState } from 'react';
import type { TableListItem, TableListPagination } from './data';
import { addRule, removeRule, rule } from './service';
import ProForm from '@ant-design/pro-form';
import { PlusOutlined } from '@ant-design/icons';

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
  const [currentRow, setCurrentRow] = useState<TableListItem | any>({});
  const [selectedRowsState, setSelectedRows] = useState<TableListItem[]>([]);
  const formRef = useRef<any>()
  const handleUpdateRecord = (record: TableListItem) => {
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
      hideInSearch: true,
    },
    {
      title: '用户ID',
      dataIndex: 'userId',
      hideInSearch: true,
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      hideInSearch: true,
    },
    {
      title: '激活码',
      dataIndex: 'code',
      hideInSearch: true,
    },
    {
      title: '是否使用',
      dataIndex: 'putaway',
      valueEnum: {
        1: {
          text: '已使用',
          status: 'Error',
        },
        0: {
          text: '未使用',
          status: 'Success',
        },
      },
    },
    {
      title: '使用时间',
      dataIndex: 'useTime',
      hideInSearch: true,
    },
   
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      hideInDescriptions: true,
      fixed: 'right',
      render: (_, record) => [
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

  const handleOk = async () => {
    const hide = message.loading(`正在更新`);
    try {
      const res = await addRule(currentRow);
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
  const handleChange = (value: any, attar: string) => {
    const newRow = currentRow
    newRow[attar] = value
    setCurrentRow(Object.assign({}, newRow))
  }
  const handleShowModal = () => {
    handleModalVisible(true)
  }
  return (
    <PageContainer>
      <ProTable<TableListItem, TableListPagination>
        toolBarRender={() => [
          <Button type="primary" key="primary" onClick={() => handleShowModal()}>
            <PlusOutlined />
            生成激活码
          </Button>,
        ]}
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 'auto'
        }}
        dateFormatter="string"
        pagination={{
          pageSize: 10,
        }}
        scroll={{
          y: document?.body?.clientHeight - 390,
        }}
        request={async (params: TableListPagination) => {
          const res: any = await rule({ pageNum: params.current, pageSize: params.pageSize });
          return {
            data: res?.data?.list || [],
            success: true,
            total: res?.data?.total
          };
        }}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
      />
      <Modal
        title='生成激活码'
        visible={createModalVisible}
        onOk={() => handleOk()}
        onCancel={() => handleModalVisible(false)}
      >
        <ProForm formRef={formRef} submitter={false}>
          <Form.Item label="天数">
            <Input type="number" value={currentRow?.day} onChange={(e) => handleChange(e.target.value, 'day')} placeholder='请输入天数'/>
          </Form.Item>
          <Form.Item label="数量">
            <Input type="number" value={currentRow?.num} onChange={(e) => handleChange(e.target.value, 'num')} placeholder='请输入生成数量'/>
          </Form.Item>
        </ProForm>
      </Modal>
    </PageContainer>
  );
};

export default TableList;

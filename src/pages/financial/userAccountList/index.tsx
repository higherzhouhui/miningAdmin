import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, Form, Input, message, Modal, Tag } from 'antd';
import React, { useRef, useState } from 'react';
import type { TableListItem, TableListPagination } from './data';
import { addRule, removeRule, rule, updateRule } from './service';
import ProForm from '@ant-design/pro-form';
import { TableOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';

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
  const [currentRow, setCurrentRow] = useState<TableListItem | any>();
  const [selectedRowsState, setSelectedRows] = useState<TableListItem[]>([]);
  const formRef = useRef<any>();
  const handleUpdateRecord = (record: TableListItem, type: number) => {
    const hide = message.loading('正在操作中...');
    updateRule({
      id: record.id,
      auditStatus: type,
    })
      .then((res: any) => {
        hide();
        if (res.code === 200) {
          message.success('操作完成，即将刷新');
          actionRef.current?.reloadAndRest?.();
        }
      })
      .catch(() => {
        hide();
      });
    // setCurrentRow(record);
    // handleModalVisible(true);
    // formRef?.current?.resetFields();
  };
  const updateBankAccount = (row: any) => {
    setCurrentRow(Object.assign({}, row));
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
      title: '电话号码',
      dataIndex: 'phone',
      width: 120,
    },
    {
      title: '资金来源',
      dataIndex: 'type',
      hideInTable: true,
      valueEnum: {
        gold: {
          text: '黄金',
        },
        referrer: {
          text: '推荐金',
        },
        subsidy: {
          text: '挖矿金',
        },
        annuity: {
          text: '养老金',
        },
        asset: {
          text: '总资产',
        },
        balance: {
          text: '余额',
        },
      },
    },
    {
      title: '金额',
      dataIndex: 'amount',
      width: 120,
      hideInSearch: true,
    },
    {
      title: '类型',
      dataIndex: 'state',
      width: 120,
      hideInSearch: true,
      render: (_, record: any) => {
        return (
          <>{record.state ? <Tag color="success">增加</Tag> : <Tag color="error">减少</Tag>}</>
        );
      },
    },
    {
      title: '描述',
      dataIndex: 'describe',
      width: 120,
      hideInSearch: true,
    },
    {
      title: '资金类型',
      dataIndex: 'typeStr',
      width: 120,
      hideInSearch: true,
    },
    {
      title: '操作时间',
      dataIndex: 'createTime',
      width: 120,
      hideInSearch: true,
    },
  ];

  const handleOk = async () => {
    const hide = message.loading(`正在${currentRow?.id ? '更新' : '新增'}`);
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
    const newRow = currentRow;
    newRow[attar] = value;
    setCurrentRow(Object.assign({}, newRow));
  };
  const export2Excel = (id: string, name: string) => {
    const exportFileContent = document.getElementById(id)!.cloneNode(true);
    const wb = XLSX.utils.table_to_book(exportFileContent, { sheet: 'sheet1' });
    XLSX.writeFile(wb, `${name}.xlsx`);
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
        size='small'
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => export2Excel('userAccountList', '交易记录')}
          >
            <TableOutlined />
            导出Excel
          </Button>,
        ]}
        dateFormatter="string"
        pagination={{
          current: 1,
        }}
        id="userAccountList"
        scroll={{
          y: Math.max(400, document?.body?.clientHeight - 490),
        }}
        request={async (params: any) => {
          const res: any = await rule({ ...params, pageNum: params.current });
          return {
            data: res?.data?.list,
            page: res?.data?.pageNum,
            success: true,
            total: res?.data?.totalSize,
          };
        }}
        columns={columns}
        // rowSelection={{
        //   onChange: (_, selectedRows) => {
        //     setSelectedRows(selectedRows);
        //   },
        // }}
      />
      <Modal
        title={currentRow?.id ? '修改' : '新增'}
        visible={createModalVisible}
        onOk={() => handleOk()}
        onCancel={() => handleModalVisible(false)}
      >
        <ProForm formRef={formRef} submitter={false}>
          <Form.Item label="姓名">
            <Input
              value={currentRow?.name}
              onChange={(e) => handleChange(e.target.value, 'name')}
            />
          </Form.Item>
          <Form.Item label="银行名称">
            <Input
              value={currentRow?.bankName}
              onChange={(e) => handleChange(e.target.value, 'bankName')}
            />
          </Form.Item>
          <Form.Item label="银行卡号">
            <Input
              value={currentRow?.bankCode}
              onChange={(e) => handleChange(e.target.value, 'bankCode')}
            />
          </Form.Item>
        </ProForm>
      </Modal>
    </PageContainer>
  );
};

export default TableList;

import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, Form, Input, message, Modal } from 'antd';
import React, { useRef, useState } from 'react';
import type { TableListItem, TableListPagination } from './data';
import { changeAmountRequest, removeRule, rule } from './service';
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
  const [state, setState] = useState(0);
  const [loading, setLoading] = useState(false);

  const operationAddOrMin = (type: number, record: any) => {
    setCurrentRow(record);
    setState(type);
    handleModalVisible(true);
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
      title: '资金类型',
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
      title: '余额',
      dataIndex: 'balance',
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
      title: '创建时间',
      dataIndex: 'createTime',
      width: 120,
      hideInSearch: true,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: 90,
      fixed: 'right',
      hideInDescriptions: true,
      render: (_, record) => [
        <a
          key="add"
          onClick={() => {
            operationAddOrMin(1, record);
          }}
        >
          充值
        </a>,
        <a
          style={{ color: 'red' }}
          key="delete"
          onClick={() => {
            operationAddOrMin(0, record);
          }}
        >
          扣款
        </a>,
      ],
    },
  ];

  const calcMoney = (change: any, balance: any) => {
    let money = 0;
    let opera = change;
    if (!change) {
      opera = 0;
    }
    if (state) {
      money = Number(opera) + Number(balance);
    } else {
      money = Number(balance) - Number(opera);
    }
    return money;
  };

  const handleOk = async () => {
    if (loading) {
      return;
    }
    setLoading(true);
    const hide = message.loading(`正在操作中`, 50);
    try {
      const res = await changeAmountRequest({
        id: currentRow?.id,
        balance: currentRow?.changeAmount,
        state: state,
      });
      handleModalVisible(false);
      setLoading(false);
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
      setLoading(false);
      return false;
    }
  };
  const handleChange = (value: any, attar: string) => {
    const newRow = JSON.parse(JSON.stringify(currentRow));
    newRow[attar] = value;
    setCurrentRow(newRow);
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
        size="small"
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => export2Excel('userMoney', '钱包余额')}
          >
            <TableOutlined />
            导出Excel
          </Button>,
        ]}
        dateFormatter="string"
        pagination={{
          current: 1,
        }}
        id="userMoney"
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
        title={state ? '充值' : '扣款'}
        visible={createModalVisible}
        onOk={() => handleOk()}
        onCancel={() => handleModalVisible(false)}
      >
        <ProForm formRef={formRef} submitter={false}>
          <Form.Item label="手机号">
            <Input
              value={currentRow?.phone}
              readOnly
              onChange={(e) => handleChange(e.target.value, 'phone')}
            />
          </Form.Item>
          <Form.Item label="资金类型">
            <Input
              value={currentRow?.typeStr}
              readOnly
              onChange={(e) => handleChange(e.target.value, 'typeStr')}
            />
          </Form.Item>
          <Form.Item label="当前余额">
            <Input
              value={currentRow?.balance}
              readOnly
              onChange={(e) => handleChange(e.target.value, 'balance')}
            />
          </Form.Item>
          <Form.Item label={state ? '充值金额' : '扣款金额'}>
            <Input
              value={currentRow?.changeAmount}
              onChange={(e) => handleChange(e.target.value, 'changeAmount')}
              type="number"
            />
          </Form.Item>
          {currentRow?.changeAmount ? (
            <Form.Item label={`${state ? '充值' : '扣款'}后余额`}>
              <span style={{ color: '#f12828' }}>
                {calcMoney(currentRow?.changeAmount, currentRow?.balance)}
              </span>
            </Form.Item>
          ) : null}
        </ProForm>
      </Modal>
    </PageContainer>
  );
};

export default TableList;

import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Form, Input, message, Modal, DatePicker, Radio } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import type { TableListItem, TableListPagination } from './data';
import { removeRule, rule, updateRule } from './service';
import ProForm from '@ant-design/pro-form';

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
        id: selectedRows[0].walletType,
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
  /** 分布更新窗口的弹窗 */
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<TableListItem | any>();
  const [showDetail, setShowDetail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState(1);
  const formRef = useRef<any>();
  const handleUpdateRecord = (record: TableListItem, ctype: number) => {
    if (loading) {
      return;
    }
    const hide = message.loading('正在操作中...', 50);
    setLoading(true);
    updateRule(record)
      .then((res: any) => {
        hide();
        setLoading(false);
        if (res.code === 200) {
          setCurrentRow({});
          setShowDetail(false);
          message.success('操作完成，即将刷新');
          actionRef.current?.reloadAndRest?.();
        }
      })
      .catch(() => {
        hide();
      });
  };
  const showDetailModal = (row: any, t: number) => {
    setCurrentRow(row);
    setShowDetail(true);
    setType(t);
  };
  const columns: ProColumns<TableListItem>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      tip: '唯一的 key',
      width: 120,
      hideInSearch: true,
      hideInTable: true,
    },
    {
      title: '钱包类型',
      dataIndex: 'walletType',
      width: 120,
      hideInSearch: true,
      fixed: 'left',
      valueEnum: {
        'annuity': {
          text: '养老金',
        },
        'asset': {
          text: '总资产',
        },
        'balance': {
          text: '余额',
        },
        'gold': {
          text: '黄金',
        },
        'referrer': {
          text: '推荐奖',
        },
        'subsidy': {
          text: '补贴金',
        },
      },
    },
    {
      title: '最大提现金额',
      dataIndex: 'maxWithdrawAmountStr',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '最小提现金额',
      dataIndex: 'minWithdrawAmount',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '注册赠送',
      dataIndex: 'regGive',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '签到赠送',
      dataIndex: 'signGive',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '提现开始时间',
      dataIndex: 'withdrawStartTime',
      width: 200,
      hideInSearch: true,
    },
    {
      title: '提现结束时间',
      dataIndex: 'withdrawEndTime',
      width: 180,
      hideInSearch: true,
    },
    {
      title: '提现状态',
      dataIndex: 'withdrawState',
      width: 120,
      hideInSearch: true,
      valueEnum: {
        false: {
          text: '关闭',
          status: 'Processing',
        },
        true: {
          text: '开启',
          status: 'Success',
        },
      },
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: 100,
      fixed: 'right',
      hideInDescriptions: true,
      render: (_, record) => [
        <a key="access" onClick={() => showDetailModal(record, 1)}>
          编辑
        </a>,
        // eslint-disable-next-line react/jsx-key
        // <Popconfirm
        //   title="确认删除？"
        //   onConfirm={async () => {
        //     await handleRemove([record], actionRef);
        //   }}
        //   key="delete"
        // >
        //   <a style={{ color: 'red' }} key="delete">
        //     删除
        //   </a>
        // </Popconfirm>,
      ],
    },
  ];

  const handleChange = (value: any, attar: string) => {
    const newRow = currentRow;
    newRow[attar] = value;
    if (attar == 'withdrawTime') {
      newRow.withdrawStartTime = value[0].format('YYYY-MM-DD HH:mm:ss');
      newRow.withdrawEndTime = value[0].format('YYYY-MM-DD HH:mm:ss');
    }
    setCurrentRow(Object.assign({}, newRow));
  };

  useEffect(() => {}, []);

  return (
    <PageContainer>
      <ProTable<TableListItem, TableListPagination>
        actionRef={actionRef}
        rowKey="walletType"
        id="withdrawListIndex"
        search={{
          labelWidth: 90,
          //隐藏展开、收起
          collapsed: false,
          collapseRender: () => false,
        }}
        pagination={{
          current: 1,
        }}
        dateFormatter="string"
        scroll={{
          x: 1400,
          y: document?.body?.clientHeight - 390,
        }}
        request={async (params: TableListPagination) => {
          const res: any = await rule({ ...params, pageNum: params.current });
          let data: any = [];
          data = res?.data;
          if (data.length) {
            data.forEach((item: any) => {
              item.maxWithdrawAmountStr = item.maxWithdrawAmount;
              if (item.maxWithdrawAmount == 0) {
                item.maxWithdrawAmountStr = '无限制';
              }
              item.withdrawTime = [item.withdrawStartTime, item.withdrawEndTime];
            });
          }
          return {
            data: data,
          };
        }}
        columns={columns}
      />
      <Modal
        width={600}
        visible={showDetail}
        title={'详情'}
        onOk={() => handleUpdateRecord(currentRow, type)}
        okText="保存"
        onCancel={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        <ProForm formRef={formRef} submitter={false}>
          <Form.Item label="最大提现金额">
            <Input
              type="number"
              value={currentRow?.maxWithdrawAmount || 0}
              onChange={(e) => handleChange(e.target.value, 'maxWithdrawAmount')}
            />
          </Form.Item>
          <Form.Item label="最小提现金额">
            <Input
              type="number"
              value={currentRow?.minWithdrawAmount || 0}
              onChange={(e) => handleChange(e.target.value, 'minWithdrawAmount')}
            />
          </Form.Item>
          <Form.Item label="注册赠送">
            <Input
              type="number"
              value={currentRow?.regGive || 0}
              onChange={(e) => handleChange(e.target.value, 'regGive')}
            />
          </Form.Item>
          <Form.Item label="签到赠送">
            <Input
              type="number"
              value={currentRow?.signGive || 0}
              onChange={(e) => handleChange(e.target.value, 'signGive')}
            />
          </Form.Item>
          <Form.Item label="提现时间">
            <DatePicker.RangePicker
              value={currentRow?.withdrawTime}
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              size="middle"
              onChange={(e) => handleChange(e, 'withdrawTime')}
            />
          </Form.Item>
          <Form.Item label="是否开启">
            <Radio.Group
              value={currentRow?.withdrawState}
              size="middle"
              onChange={(e) => handleChange(e.target.value, 'withdrawState')}
              buttonStyle="solid"
            >
              <Radio value={true}>是</Radio>
              <Radio value={false}>否</Radio>
            </Radio.Group>
          </Form.Item>
        </ProForm>
      </Modal>
    </PageContainer>
  );
};

export default TableList;

import { FooterToolbar, PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, Form, Input, message, Modal, Popconfirm, Image } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import type { TableListItem, TableListPagination } from './data';
import { removeRule, rule, updateRule } from './service';
import * as XLSX from 'xlsx';
import { DeleteOutlined, TableOutlined } from '@ant-design/icons';
import type { ProDescriptionsItemProps } from '@ant-design/pro-descriptions';
import ProDescriptions from '@ant-design/pro-descriptions';
import { useLocation } from 'umi';
import style from './style.less';
import { history } from 'umi';
import moment from 'moment';

/**
 * 删除节点
 *
 * @param selectedRows
 */

const handleRemove = async (selectedRows: TableListItem[], actionRef?: any) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;
  selectedRows.map(async (item) => {
    try {
      const res = await removeRule({ id: item.id });
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
  return false;
};

const TableList: React.FC = () => {
  /** 新建窗口的弹窗 */
  /** 分布更新窗口的弹窗 */
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<TableListItem | any>();
  const [selectedRowsState, setSelectedRows] = useState<TableListItem[]>([]);
  const [showDetail, setShowDetail] = useState(false);
  const [loading, setLoading] = useState(false);
  const type = 1;
  const [myParams, setMyparams] = useState<any>({});
  const localMy = useLocation();
  const handleUpdateRecord = (record: TableListItem) => {
    if (loading) {
      return;
    }
    const hide = message.loading('正在操作中...', 50);
    setLoading(true);
    updateRule({
      id: record.id,
      stock: record.modifyStock,
    })
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
    // setCurrentRow(record);
    // handleModalVisible(true);
    // formRef?.current?.resetFields();
  };

  const routeToChildren = (record: any) => {
    if (!record.invite_amount) {
      return;
    }
    localStorage.setItem('childrenObj', JSON.stringify({ id: record.id, name: record.nick_name }));
    history.push(`/account/children?id=${record.id}&name=${record.nick_name}`);
  };

  const columns: ProColumns<any>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 90,
      render: (_, record) => {
        return <div>{record.id}</div>;
      },
    },
    {
      title: '昵称',
      dataIndex: 'nick_name',
      width: 100,
      fixed: 'left',
      tooltip: '点击可查看该用户详情',
      render: (dom, entity) => {
        return (
          <div
            className={style.link}
            onClick={() => {
              setCurrentRow(entity);
              setShowDetail(true);
            }}
          >
            {dom}
          </div>
        );
      },
    },
    {
      title: '头像',
      dataIndex: 'photo',
      width: 110,
      hideInSearch: true,
      hideInTable: true,
      render: (_, record) => {
        return (
          <Image
            src={record.head || '/logo.png'}
            width={90}
            height={90}
            style={{ objectFit: 'contain' }}
          />
        );
      },
    },
    {
      title: '推特ID',
      dataIndex: 'twitter_id',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '当前积分(pts)',
      dataIndex: 'pts',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '宠物数量',
      dataIndex: 'pets',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '可领取奖励(FFP)',
      dataIndex: 'invite_reward_coins',
      width: 130,
      hideInSearch: true,
    },
    {
      title: '邀请奖励(FFP)',
      dataIndex: 'coins',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '推荐人ID',
      dataIndex: 'invite_id',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '邀请码',
      dataIndex: 'code',
      width: 110,
      hideInSearch: true,
    },
    {
      title: '下级会员',
      dataIndex: 'invite_amount',
      width: 110,
      hideInSearch: true,
      render: (_, record: any) => {
        return (
          <div style={{ color: 'blue', cursor: 'pointer' }} onClick={() => routeToChildren(record)}>
            {record.invite_amount}
          </div>
        );
      },
    },
    {
      title: '使用盾牌次数',
      dataIndex: 'shield_protect_count',
      width: 110,
      hideInSearch: true,
      hideInTable: true,
    },
    {
      title: '可以攻击时间',
      dataIndex: 'bonk_freeze_time',
      width: 110,
      hideInSearch: true,
      hideInTable: true,
      render: (_, record: any) => {
        return <span>{moment(record.bonk_freeze_time).format('YYYY-MM-DD HH:mm:ss')}</span>;
      },
    },
    {
      title: '盾牌结束时间',
      dataIndex: 'shield_protect_time',
      width: 110,
      hideInSearch: true,
      hideInTable: true,
      render: (_, record: any) => {
        return <span>{moment(record.shield_protect_time).format('YYYY-MM-DD HH:mm:ss')}</span>;
      },
    },
    {
      title: '战斗次数',
      dataIndex: 'bonk_count',
      width: 110,
      hideInSearch: true,
      hideInTable: true,
    },
    {
      title: '赢的pts',
      dataIndex: 'bonk_win_pts',
      width: 110,
      hideInSearch: true,
      hideInTable: true,
    },
    {
      title: '输的次数',
      dataIndex: 'bonk_loss_count',
      width: 110,
      hideInSearch: true,
      hideInTable: true,
    },
    {
      title: '输的pts',
      dataIndex: 'bonk_loss_pts',
      width: 110,
      hideInSearch: true,
      hideInTable: true,
    },
    {
      title: '赢的次数',
      dataIndex: 'bonk_win_count',
      width: 110,
      hideInSearch: true,
      hideInTable: true,
    },
    {
      title: '注册时间',
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
      hideInTable: true,
      hideInDescriptions: true,
      fixed: 'right',
      render: (_, record) => [
        <Popconfirm
          title="确认删除该会员?"
          onConfirm={async () => {
            handleRemove(record.userId);
          }}
          key="access"
        >
          <a key="access" style={{ color: 'red' }}>
            <DeleteOutlined />
            删除
          </a>
        </Popconfirm>,
      ],
    },
  ];

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

  useEffect(() => {
    const newObj = localStorage.getItem('childrenObj');
    if (newObj) {
      const obj = JSON.parse(newObj);
      let reFresh = false;
      if (myParams.id && obj.id && obj.id != myParams.id) {
        reFresh = true;
      }
      setMyparams(obj);
      if (reFresh) {
        actionRef.current?.reloadAndRest?.();
      }
    }
  }, [localMy.key]);

  return (
    <PageContainer>
      <ProTable<TableListItem, TableListPagination>
        actionRef={actionRef}
        rowKey="id"
        headerTitle={`上级昵称：${myParams.name}`}
        id="withdrawListIndex"
        size="small"
        search={false}
        pagination={{
          current: 1,
          pageSizeOptions: [100, 500, 1000, 2000],
        }}
        dateFormatter="string"
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => export2Excel('withdrawListIndex', '店铺详情')}
          >
            <TableOutlined />
            导出Excel
          </Button>,
        ]}
        scroll={{
          y: Math.max(400, document?.body?.clientHeight - 390),
        }}
        request={async (params: TableListPagination) => {
          const res: any = await rule({ pageSize: 20, pageNum: params.current, id: myParams.id });
          let data: any = [];
          data = res?.data?.rows;
          return {
            data: data,
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
        width={600}
        visible={showDetail}
        title={'详情'}
        onOk={() => handleUpdateRecord(currentRow, type)}
        okText={type === 1 ? '通过' : '确认'}
        onCancel={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        {currentRow?.id && (
          <ProDescriptions<API.RuleListItem>
            column={2}
            title={currentRow?.name}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.id,
            }}
            columns={columns as ProDescriptionsItemProps<API.RuleListItem>[]}
          />
        )}
        {type == 2 ? (
          <Form.Item label="修改库存">
            <Input
              value={currentRow?.modifyStock}
              onChange={(e) => handleChange(e.target.value, 'modifyStock')}
              placeholder="请输入库存"
              type="number"
            />
          </Form.Item>
        ) : null}
      </Modal>
    </PageContainer>
  );
};

export default TableList;

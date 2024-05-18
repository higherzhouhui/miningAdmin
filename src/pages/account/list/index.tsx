import type { ProDescriptionsItemProps } from '@ant-design/pro-descriptions';
import ProDescriptions from '@ant-design/pro-descriptions';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, Drawer, Form, Image, Input, Modal, Popconfirm, message } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import type { TableListItem, TableListPagination } from './data';
import { addRule, rule, removeRule, createOrderRequest } from './service';
import ProForm from '@ant-design/pro-form';
import style from './style.less';
import { history } from 'umi';
import * as XLSX from 'xlsx';
import { DeleteOutlined, EditOutlined, TableOutlined } from '@ant-design/icons';
import moment from 'moment';
const TableList: React.FC = () => {
  /** 分布更新窗口的弹窗 */
  const [showDetail, setShowDetail] = useState(false);
  const [currentRow, setCurrentRow] = useState<any>();
  const [total, setTotal] = useState(0);
  const actionRef = useRef<ActionType>();
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  const formRef = useRef<any>();
  const [operationType, setOperationType] = useState('baseInfo');
  const titleMap = {
    baseInfo: '修改基本资料',
    resetPassword: '修改密码',
    addNewProject: '添加宠物',
  };
  const handleUpdateRecord = (record: TableListItem, type: string) => {
    setOperationType(type);
    setCurrentRow(record);
    handleModalVisible(true);
    formRef?.current?.resetFields();
  };
  const routeToChildren = (record: TableListItem) => {
    localStorage.setItem('childrenObj', JSON.stringify({ id: record.id, name: record.nick_name }));
    history.push(`/account/children?id=${record.id}&name=${record.nick_name}`);
  };
  const routeToPetList = (record: TableListItem) => {
    localStorage.setItem('petListObj', JSON.stringify({ uid: record.id, name: record.nick_name }));
    history.push(`/account/petlist?uid=${record.id}&name=${record.nick_name}`);
  };

  const handleRemove = async (userId: number) => {
    const hide = message.loading('正在删除...');
    const res = await removeRule({ id: userId });
    hide();
    if (res.code === 0) {
      message.success('删除成功,正在刷新!');
      actionRef?.current?.reloadAndRest?.();
    }
  };

  useEffect(() => {}, []);

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
      title: '宠物',
      dataIndex: 'pets',
      width: 100,
      hideInSearch: true,
      render: (_, record: any) => {
        return <a onClick={() => routeToPetList(record)}>查看</a>;
      },
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
            查看
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
      width: 210,
      hideInDescriptions: true,
      fixed: 'right',
      render: (_, record: any) => [
        <a
          key={'new'}
          style={{ color: 'green' }}
          onClick={() => handleUpdateRecord(record, 'addNewProject')}
        >
          <EditOutlined />
          +宠物
        </a>,
        <a key={'modify'} onClick={() => handleUpdateRecord(record, 'baseInfo')}>
          <EditOutlined />
          修改
        </a>,
        <Popconfirm
          title="确认删除该会员?"
          onConfirm={async () => {
            handleRemove(record.id);
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

  const handleOk = async () => {
    if (operationType === 'baseInfo') {
      if (!currentRow?.pts || !currentRow?.invite_reward_coins || !currentRow?.coins) {
        message.warning('请输入完整信息!');
        return;
      }
    }
    if (operationType === 'resetPassword') {
      if (!currentRow?.newPassword) {
        message.warning('请输入新密码!');
        return;
      }
    }
    if (operationType === 'addNewProject') {
      const hide = message.loading(`正在${currentRow?.id ? '更新' : '新增'}`, 50);
      createOrderRequest({ uid: currentRow.id }).then((res: any) => {
        hide();
        if (res.code === 0) {
          handleModalVisible(false);
          message.success(`添加成功`);
          actionRef.current?.reloadAndRest?.();
        }
      });
      return;
    }
    const hide = message.loading(`正在${currentRow?.id ? '更新' : '新增'}`, 50);
    try {
      const res = await addRule(currentRow);
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
        dateFormatter="string"
        id="accountListIndex"
        headerTitle={`总会员：${total}`}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => export2Excel('accountListIndex', '会员列表')}
          >
            <TableOutlined />
            导出Excel
          </Button>,
        ]}
        size="small"
        search={{
          labelWidth: 90,
          //隐藏展开、收起
          collapsed: false,
          collapseRender: () => false,
        }}
        pagination={{
          current: 1,
          pageSizeOptions: [50, 200, 500, 1000, 2000],
        }}
        scroll={{
          x: 1500,
          y: Math.max(470, document?.body?.clientHeight - 460),
        }}
        request={async (params: TableListPagination) => {
          const res: any = await rule({ ...params, pageNum: params.current });
          // (res?.data?.list || []).map((item: any) => {
          //   let registerType = 'APP注册';
          //   if (item.registerType == 2) {
          //     registerType = '链接注册';
          //   }
          //   item.registerType = registerType;
          // });
          let data: any = [];
          data = res?.data?.rows;
          setTotal(res?.data?.total);
          return {
            data: data,
            success: true,
            total: res?.data?.count,
          };
        }}
        columns={columns}
      />
      <Modal
        title={titleMap[operationType]}
        visible={createModalVisible}
        onOk={() => handleOk()}
        onCancel={() => handleModalVisible(false)}
        width={500}
      >
        <ProForm formRef={formRef} submitter={false}>
          {operationType === 'baseInfo' ? (
            <>
              <Form.Item label="积分pts">
                <Input
                  value={currentRow?.pts}
                  onChange={(e) => handleChange(e.target.value, 'pts')}
                />
              </Form.Item>
              <Form.Item label="可领取FFP">
                <Input
                  value={currentRow?.invite_reward_coins}
                  onChange={(e) => handleChange(e.target.value, 'invite_reward_coins')}
                />
              </Form.Item>
              <Form.Item label="邀请奖励(FFP)">
                <Input
                  value={currentRow?.coins}
                  onChange={(e) => handleChange(e.target.value, 'coins')}
                />
              </Form.Item>
              <Form.Item label="推荐人ID">
                <Input
                  value={currentRow?.invite_id}
                  onChange={(e) => handleChange(e.target.value, 'invite_id')}
                  placeholder="请输入上级推荐人"
                />
              </Form.Item>
            </>
          ) : operationType === 'resetPassword' ? (
            <>
              <Form.Item label="新密码">
                <Input
                  value={currentRow?.newPassword}
                  onChange={(e) => handleChange(e.target.value, 'newPassword')}
                  placeholder="请输入新密码"
                />
              </Form.Item>
            </>
          ) : operationType === 'addNewProject' ? (
            <>
              <Form.Item label="ownerId">
                <Input value={currentRow?.id} readOnly />
              </Form.Item>
            </>
          ) : null}
        </ProForm>
      </Modal>
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
      </Drawer>
    </PageContainer>
  );
};

export default TableList;

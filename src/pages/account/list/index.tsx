import type { ProDescriptionsItemProps } from '@ant-design/pro-descriptions';
import ProDescriptions from '@ant-design/pro-descriptions';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, Drawer, Form, Image, Input, Modal, Popconfirm, Select, message } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import type { TableListItem, TableListPagination } from './data';
import {
  addRule,
  rule,
  removeRule,
  createOrderRequest,
  getPropsList,
} from './service';
import ProForm from '@ant-design/pro-form';
import style from './style.less';
import { history } from 'umi';
import * as XLSX from 'xlsx';
import { TableOutlined } from '@ant-design/icons';
import moment from 'moment';
const TableList: React.FC = () => {
  /** 分布更新窗口的弹窗 */
  const [showDetail, setShowDetail] = useState(false);
  const [currentRow, setCurrentRow] = useState<any>();
  const [total, setTotal] = useState(0);
  const [totalUse, setTotalUse] = useState(0);
  const actionRef = useRef<ActionType>();
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  const formRef = useRef<any>();
  const [operationType, setOperationType] = useState('baseInfo');
  const [propsList, setPropsList] = useState([]);
  const titleMap = {
    baseInfo: '修改基本资料',
    resetPassword: '修改密码',
    addNewProject: '添加宠物',
    addNewPropsProject: '添加道具',
  };
  const handleUpdateRecord = async (record: TableListItem, type: string) => {
    if (type == 'addNewPropsProject') {
      const hide = message.loading('加载中');
      const res = await getPropsList();
      hide();
      setPropsList(res.data.rows);
    }
    setOperationType(type);
    setCurrentRow({ ...record, amount: 1 });
    handleModalVisible(true);
    formRef?.current?.resetFields();
  };
  const routeToChildren = (record: TableListItem) => {
    localStorage.setItem('childrenObj', JSON.stringify({ id: record.user_id, name: record.username }));
    history.push(`/account/children?id=${record.user_id}&name=${record.username}`);
  };
  const routeToFollow = (record: TableListItem) => {
    localStorage.setItem('followObj', JSON.stringify({ id: record.user_id, name: record.username }));
    history.push(`/account/follow?id=${record.user_id}&name=${record.username}`);
  };
  const routeToChat = (record: TableListItem) => {
    localStorage.setItem('chatObj', JSON.stringify({ id: record.user_id, name: record.username }));
    history.push(`/account/chat?id=${record.user_id}&name=${record.username}`);
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
      title: '昵称',
      dataIndex: 'username',
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
      title: 'ID',
      dataIndex: 'user_id',
      width: 90,
      render: (_, record) => {
        return <div>{record.user_id}</div>;
      },
    },
    {
      title: '姓',
      dataIndex: 'firstName',
      width: 90,
      hideInTable: true,
      hideInSearch: true,
   
    },
    {
      title: '名',
      dataIndex: 'lastName',
      width: 90,
      hideInTable: true,
      hideInSearch: true,
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
      title: '当前Coins',
      dataIndex: 'score',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '累计充值（Ton）',
      dataIndex: 'use_ton',
      width: 130,
      hideInSearch: true,
    },
    {
      title: '会员',
      width: 100,
      dataIndex: 'isPremium',
      hideInSearch: true,
      valueEnum: {
        true: {
          status: 'success',
          text: '是'
        },
        false: {
          status: 'error',
          text: '否'
        }
      }
    },
    {
      title: '关注主播',
      dataIndex: 'subUser',
      width: 110,
      hideInSearch: true,
      render: (_, record: any) => {
        return (
          <div className={style.link} onClick={() => routeToFollow(record)}>
            {record.follow_num}
          </div>
        );
      },
    },
    {
      title: '聊天主播',
      dataIndex: 'subUser',
      width: 110,
      hideInSearch: true,
      render: (_, record: any) => {
        return (
          <div className={style.link} onClick={() => routeToChat(record)}>
            {record.chat_num}
          </div>
        );
      },
    },
    {
      title: '下级会员',
      dataIndex: 'subUser',
      width: 110,
      hideInSearch: true,
      render: (_, record: any) => {
        return (
          <div className={style.link} onClick={() => routeToChildren(record)}>
            {record.subUser}
          </div>
        );
      },
    },
    {
      title: '上级ID',
      dataIndex: 'startParam',
      width: 100,
    },
    {
      title: '邀请码',
      dataIndex: 'code',
      width: 110,
      hideInSearch: true,
      render: (_, record) => {
        return <div>{btoa(record.user_id)}</div>;
      },
    },
    {
      title: '邀请奖励',
      dataIndex: 'invite_friends_score',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '钱包地址',
      dataIndex: 'wallet',
      width: 120,
      hideInTable: true,
    },
    {
      title: '语言',
      dataIndex: 'languageCode',
      width: 100,
      hideInTable: true,
      hideInSearch: true,
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
      width: 120,
      hideInDescriptions: true,
      fixed: 'right',
      render: (_, record: any) => [
        <a key={'modify'} onClick={() => handleUpdateRecord(record, 'baseInfo')}>
          修改
        </a>,
        <Popconfirm
          title="确认删除该用户?"
          onConfirm={async () => {
            handleRemove(record.id);
          }}
          key="access"
        >
          <a key="access" style={{ color: 'red' }}>
            删除
          </a>
        </Popconfirm>,
      ],
    },
  ];

  const handleOk = async () => {
    if (operationType === 'baseInfo') {
      if (!currentRow?.score) {
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
      createOrderRequest({ uid: currentRow.id, amount: currentRow.amount }).then((res: any) => {
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
        headerTitle={`总用户：${total}，总充值：${totalUse} TON`}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => export2Excel('accountListIndex', '用户列表')}
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
          x: 1800,
          y: Math.max(470, document?.body?.clientHeight - 460),
        }}
        request={async (params: TableListPagination) => {
          const res: any = await rule({ ...params, pageNum: params.current });
          let data: any = [];
          data = res?.data?.rows;
          data.map((item: any) => {
            // item.is_check = judgeIsCheckIn(item.check_date)
            if (item.follow_anchor) {
              const arr = item.follow_anchor.split(',')
              item.follow_num = arr.length - 1
            } else {
              item.follow_num = 0
            }
            if (item.chat_anchor) {
              const arr = item.chat_anchor.split(',')
              item.chat_num = arr.length - 1
            } else {
              item.chat_num = 0
            }
          })
          setTotal(res?.data?.count);
          setTotalUse(res?.data?.total_use)
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
              <Form.Item label="昵称">
                <Input
                  value={currentRow?.username}
                  onChange={(e) => handleChange(e.target.value, 'username')}
                />
              </Form.Item>
              <Form.Item label="Coins">
                <Input
                  value={currentRow?.score}
                  onChange={(e) => handleChange(e.target.value, 'score')}
                />
              </Form.Item>
              <Form.Item label="累计充值（TON）">
                <Input
                  value={currentRow?.use_ton}
                  onChange={(e) => handleChange(e.target.value, 'use_ton')}
                />
              </Form.Item>
              <Form.Item label="上级ID">
                <Input
                  value={currentRow?.startParam}
                  onChange={(e) => handleChange(e.target.value, 'startParam')}
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
              <Form.Item label="昵称">
                <Input value={currentRow?.nick_name} readOnly />
              </Form.Item>
              <Form.Item label="数量">
                <Input
                  value={currentRow?.amount}
                  type="number"
                  onChange={(e) => handleChange(e.target.value, 'amount')}
                />
              </Form.Item>
            </>
          ) : operationType === 'addNewPropsProject' ? (
            <>
              <Form.Item label="昵称">
                <Input value={currentRow?.nick_name} readOnly />
              </Form.Item>
              <Form.Item label="关联道具">
                <Select
                  value={currentRow?.props_id}
                  placeholder="请选择"
                  onChange={(e) => handleChange(e, 'props_id')}
                >
                  {propsList.map((item: any) => {
                    return (
                      <Select.Option
                        value={item.id}
                        key={item.id}
                      >{`${item.name}——${item.usdt}U`}</Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>
              <Form.Item label="数量">
                <Input
                  value={currentRow?.amount}
                  type="number"
                  onChange={(e) => handleChange(e.target.value, 'amount')}
                />
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


function judgeIsCheckIn(time: any) {
  let flag = false
  try {
    if (time) {
      if (time == moment().utc().format('MM-DD')) {
        return true
      }
    }
  } catch (error) {
    console.error(error)
    flag = false
  }
  return flag
}

export default TableList;

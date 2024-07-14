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
  addNewProPS,
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
      title: '当前积分',
      dataIndex: 'score',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '账号奖励',
      dataIndex: 'account_age_score',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '时长(年)',
      dataIndex: 'year',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '会员奖励',
      dataIndex: 'telegram_premium',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '邀请奖励',
      dataIndex: 'invite_friends_score',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '推荐人ID',
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
    // {
    //   title: '下级会员',
    //   dataIndex: 'invite_amount',
    //   width: 110,
    //   hideInSearch: true,
    //   render: (_, record: any) => {
    //     return (
    //       <div style={{ color: 'blue', cursor: 'pointer' }} onClick={() => routeToChildren(record)}>
    //         查看
    //       </div>
    //     );
    //   },
    // },
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
          title="确认删除该会员?"
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
    if (operationType === 'addNewPropsProject') {
      const hide = message.loading(`正在${currentRow?.id ? '更新' : '新增'}`, 50);
      const propsInfo: any = propsList.filter((item: any) => {
        return item.id == currentRow.props_id;
      });
      const data = {
        uid: currentRow.id,
        props_amount: currentRow.amount,
        props_id: propsInfo[0].id,
        props_name: propsInfo[0].name,
        props_tod: propsInfo[0].tod,
        props_type: propsInfo[0].type,
        order_id: new Date().getTime() + Math.random() * 100000000,
        source: 'buy',
        props_price: propsInfo[0].usdt,
      };
      addNewProPS(data).then((res: any) => {
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
    newRow.score = newRow.account_age_score * 1 + newRow.invite_friends_score * 1 + newRow.telegram_premium * 1
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
              <Form.Item label="积分">
                <Input
                  value={currentRow?.score}
                  onChange={(e) => handleChange(e.target.value, 'score')}
                  readOnly
                />
              </Form.Item>
              <Form.Item label="账号奖励">
                <Input
                  value={currentRow?.account_age_score}
                  onChange={(e) => handleChange(e.target.value, 'account_age_score')}
                />
              </Form.Item>
              <Form.Item label="会员奖励">
                <Input
                  value={currentRow?.telegram_premium}
                  onChange={(e) => handleChange(e.target.value, 'telegram_premium')}
                />
              </Form.Item>
              <Form.Item label="邀请奖励">
                <Input
                  value={currentRow?.invite_friends_score}
                  onChange={(e) => handleChange(e.target.value, 'invite_friends_score')}
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

export default TableList;

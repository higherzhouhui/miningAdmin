import type { ProDescriptionsItemProps } from '@ant-design/pro-descriptions';
import ProDescriptions from '@ant-design/pro-descriptions';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, Drawer, Form, Image, Input, Modal, Popconfirm, Select, Tag, message } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import type { TableListItem, TableListPagination } from './data';
import { addRule, rule, removeRule, getPartnerProject, createOrderRequest } from './service';
import ProForm from '@ant-design/pro-form';
import style from './style.less';
import { history } from 'umi';
import * as XLSX from 'xlsx';
import {
  DeleteOutlined,
  EditOutlined,
  FormOutlined,
  PlusOutlined,
  TableOutlined,
} from '@ant-design/icons';
const TableList: React.FC = () => {
  /** 分布更新窗口的弹窗 */
  const [showDetail, setShowDetail] = useState(false);
  const [currentRow, setCurrentRow] = useState<any>();
  const [total, setTotal] = useState(0);
  const actionRef = useRef<ActionType>();
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  const formRef = useRef<any>();
  const [operationType, setOperationType] = useState('baseInfo');
  const [partnerList, setPartnerList] = useState([]);
  const [projectId, setprojectId] = useState('');
  const titleMap = {
    baseInfo: '修改基本资料',
    resetPassword: '修改密码',
    addNewProject: '添加项目',
  };
  const handleUpdateRecord = (record: TableListItem, type: string) => {
    setOperationType(type);
    setCurrentRow(record);
    handleModalVisible(true);
    formRef?.current?.resetFields();
  };
  const routeToChildren = (record: TableListItem) => {
    if (!record.inviteNum) {
      return;
    }
    localStorage.setItem(
      'childrenObj',
      JSON.stringify({ userId: record.userId, name: record.name }),
    );
    history.push(`/account/children?userId=${record.userId}&name=${record.name}`);
  };

  const handleRemove = async (userId: number) => {
    const hide = message.loading('正在删除...');
    const res = await removeRule({ id: userId });
    hide();
    if (res.code === 200) {
      message.success('删除成功,正在刷新!');
      actionRef?.current?.reloadAndRest?.();
    }
  };

  useEffect(() => {
  }, []);

  const columns: ProColumns<any>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 180,
      hideInSearch: true,
      hideInTable: true,
      render: (_, record) => {
        return (
          <div>
            {record.id}
          </div>
        );
      },
    },
    {
      title: '手机号',
      dataIndex: 'phone',
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
            src={record.photo || '/logo.png'}
            width={90}
            height={90}
            style={{ objectFit: 'contain' }}
          />
        );
      },
    },
    {
      title: '微信openId',
      dataIndex: 'openid',
      width: 160,
      hideInSearch: true,
    },
    {
      title: '推荐人ID',
      dataIndex: 'referrerId',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '邀请码',
      dataIndex: 'invitCode',
      width: 110,
      hideInSearch: true,
    },
 
    {
      title: '角色',
      dataIndex: 'role',
      width: 100,
      hideInSearch: true,
      render: (_, record) => {
        return (
          <>
            {record.role == 1 ? (
              <Tag color="success">普通用户</Tag>
            ) : record.role == 2 ? (
              <Tag color="volcano">商铺</Tag>
            ) : 
            <Tag color="orange">加盟商</Tag>}
          </>
        );
      },
    },
    {
      title: '会员有效期',
      dataIndex: 'memberIndate',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '会员状态',
      dataIndex: 'memberState',
      width: 100,
      hideInSearch: true,
      render: (_, record) => {
        return (
          <>
            {record.memberState ? (
              <Tag color="#87d068">可用</Tag>
            ) : (
              <Tag color="#f50">非会员</Tag>
            )}
          </>
        );
      },
    },
    {
      title: '注册时间',
      dataIndex: 'createTime',
      width: 150,
      hideInSearch: true,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: 100,
      hideInDescriptions: true,
      fixed: 'right',
      render: (_, record) => [
        <a
          style={{ color: '#4423da', display: 'none' }}
          key="baseInfo"
          onClick={() => handleUpdateRecord(record, 'baseInfo')}
        >
          <FormOutlined />
          资料
        </a>,
        <a
          style={{ color: '#13e436', display: 'none' }}
          key="resetPassword"
          onClick={() => handleUpdateRecord(record, 'resetPassword')}
        >
          <EditOutlined />
          密码
        </a>,
        <a
          style={{ color: '#cf2960', display: 'none' }}
          key="addProject"
          onClick={() => handleUpdateRecord(record, 'addNewProject')}
        >
          <PlusOutlined />
          添加项目
        </a>,
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

  const handleOk = async () => {
    let param: any = {
      id: currentRow?.userId,
    };
    if (operationType === 'baseInfo') {
      if (!currentRow?.name || !currentRow?.idCard || !currentRow?.mobilePhone) {
        message.warning('请输入完整信息!');
        return;
      }
      param = {
        ...param,
        name: currentRow?.name,
        idCard: currentRow?.idCard,
        mobilePhone: currentRow?.mobilePhone,
        referrerInviteCode: currentRow?.referrerInviteCode,
      };
    }
    if (operationType === 'resetPassword') {
      if (!currentRow?.newPassword) {
        message.warning('请输入新密码!');
        return;
      }
      param = {
        ...param,
        newPassword: currentRow?.newPassword,
      };
    }
    if (operationType === 'addNewProject') {
      const hide = message.loading(`正在${currentRow?.id ? '更新' : '新增'}`, 50);
      createOrderRequest({ id: projectId, phone: currentRow?.mobilePhone }).then((res: any) => {
        hide();
        if (res.code === 200) {
          handleModalVisible(false);
          message.success(`给用户${currentRow?.mobilePhone}用户添加项目成功`);
          actionRef.current?.reloadAndRest?.();
        }
      });
      return;
    }
    const hide = message.loading(`正在${currentRow?.id ? '更新' : '新增'}`, 50);
    try {
      const res = await addRule(param);
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
        rowKey="userId"
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
          x: 1400,
          y: Math.max(400, document?.body?.clientHeight - 490),
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
          data = res?.data?.list;
          setTotal(res?.data?.total);
          return {
            data: data,
            page: res?.data?.pageNum,
            success: true,
            total: res?.data?.total,
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
              <Form.Item label="手机号码">
                <Input
                  value={currentRow?.mobilePhone}
                  onChange={(e) => handleChange(e.target.value, 'mobilePhone')}
                />
              </Form.Item>
              <Form.Item label="姓名">
                <Input
                  value={currentRow?.name}
                  onChange={(e) => handleChange(e.target.value, 'name')}
                />
              </Form.Item>
              <Form.Item label="身份证号">
                <Input
                  value={currentRow?.idCard}
                  onChange={(e) => handleChange(e.target.value, 'idCard')}
                />
              </Form.Item>
              <Form.Item label="上级推荐码">
                <Input
                  value={currentRow?.referrerInviteCode}
                  onChange={(e) => handleChange(e.target.value, 'referrerInviteCode')}
                  placeholder="请输入上级推荐码"
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
              <Form.Item label="手机号">
                <Input value={currentRow?.mobilePhone} readOnly />
              </Form.Item>
              <Form.Item label="项目名">
                <Select value={projectId} onChange={(e) => setprojectId(e)}>
                  {partnerList.map((item: any) => {
                    return <Select.Option key={item.id}>{item.name}</Select.Option>;
                  })}
                </Select>
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
        {currentRow?.phone && (
          <ProDescriptions<API.RuleListItem>
            column={1}
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

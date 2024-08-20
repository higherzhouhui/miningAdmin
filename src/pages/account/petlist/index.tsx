import type { ProDescriptionsItemProps } from '@ant-design/pro-descriptions';
import ProDescriptions from '@ant-design/pro-descriptions';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, Drawer, Form, Image, Input, Modal, Popconfirm, Select, message } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import type { TableListItem, TableListPagination } from './data';
import { addRule, rule, removeRule, createOrderRequest } from './service';
import ProForm from '@ant-design/pro-form';
import style from './style.less';
import { useLocation } from 'umi';
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
  const partnerList = [];
  const [myParams, setMyparams] = useState<any>({});
  const localMy = useLocation();

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

  const handleRemove = async (userId: number) => {
    const hide = message.loading('正在删除...');
    const res = await removeRule({ id: userId });
    hide();
    if (res.code === 0) {
      message.success('删除成功,正在刷新!');
      actionRef?.current?.reloadAndRest?.();
    }
  };

  const columns: ProColumns<any>[] = [
    {
      title: '昵称',
      dataIndex: 'name',
      width: 100,
      fixed: 'left',
      hideInSearch: true,
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
      title: 'TokenId',
      dataIndex: 'claim_nft_id',
      width: 100,
      render: (_, record) => {
        return <div>{record.claim_nft_id ? `#${record.claim_nft_id}` : 'Not Claim'}</div>;
      },
    },
    {
      title: '拥有者',
      dataIndex: 'nick_name',
      width: 130,
    },
    {
      title: 'img',
      dataIndex: 'photo',
      width: 110,
      hideInSearch: true,
      render: (_, record) => {
        return (
          <Image
            src={`https://static.CAT.com/images/c/${record.img}` || '/logo.png'}
            width={90}
            height={90}
            style={{ objectFit: 'contain' }}
          />
        );
      },
    },
    {
      title: '经验值',
      dataIndex: 'exp',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '生日',
      dataIndex: 'birthday',
      width: 150,
      hideInSearch: true,
    },
    {
      title: '绑定钱包',
      dataIndex: 'wallet',
      width: 100,
      hideInSearch: true,
    },
    {
      title: 'tod',
      dataIndex: 'tod',
      width: 150,
      hideInSearch: true,
      render: (_, record) => {
        return <span>{moment(record.tod * 1000).format('YYYY-MM-DD HH:mm')}</span>;
      },
    },
    {
      title: '是否上链',
      dataIndex: 'isClaim',
      width: 120,
      hideInTable: true,
      valueEnum: {
        0: {
          text: '未上链',
          status: 'Error',
        },
        1: {
          text: '已上链',
          status: 'Success',
        },
      },
    },
    {
      title: '创建时间',
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
      if (!currentRow?.name || !currentRow?.exp || !currentRow?.tod) {
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
      createOrderRequest({ id: projectId, phone: currentRow?.mobilePhone }).then((res: any) => {
        hide();
        if (res.code === 0) {
          handleModalVisible(false);
          message.success(`给用户${currentRow?.mobilePhone}用户添加项目成功`);
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

  useEffect(() => {
    const newObj = localStorage.getItem('petListObj');
    if (newObj) {
      const obj = JSON.parse(newObj);
      let reFresh = false;
      if (myParams.uid && obj.uid && obj.uid != myParams.uid) {
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
        dateFormatter="string"
        id="accountListIndex"
        headerTitle={`总宠物数量：${total}`}
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
          x: 1600,
          y: Math.max(470, document?.body?.clientHeight - 460),
        }}
        request={async (params: TableListPagination) => {
          const res: any = await rule({
            ...params,
            pageNum: params.current,
          });
          setMyparams({});
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
              <Form.Item label="昵称">
                <Input
                  value={currentRow?.name}
                  onChange={(e) => handleChange(e.target.value, 'name')}
                />
              </Form.Item>
              <Form.Item label="经验值">
                <Input
                  value={currentRow?.exp}
                  onChange={(e) => handleChange(e.target.value, 'exp')}
                />
              </Form.Item>
              <Form.Item label="TOD">
                <Input
                  value={currentRow?.tod}
                  onChange={(e) => handleChange(e.target.value, 'tod')}
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

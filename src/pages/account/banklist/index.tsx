import type { ProDescriptionsItemProps } from '@ant-design/pro-descriptions';
import ProDescriptions from '@ant-design/pro-descriptions';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, Drawer, Form, Image, Input, Modal, Popconfirm, Tag, message } from 'antd';
import React, { useRef, useState } from 'react';
import type { TableListItem, TableListPagination } from './data';
import { addRule, rule, removeRule } from './service';
import ProForm from '@ant-design/pro-form';
import style from './style.less';
import { history } from 'umi';
import * as XLSX from 'xlsx';
import { FormOutlined, TableOutlined } from '@ant-design/icons';
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
    baseInfo: '修改银行卡信息',
    resetPassword: '修改密码',
    changeInvited: '修改上级邀请码',
  };
  const handleUpdateRecord = (record: TableListItem, type: string) => {
    setOperationType(type);
    setCurrentRow(record);
    handleModalVisible(true);
    formRef?.current?.resetFields();
  };
  const routeToChildren = (record: TableListItem) => {
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

  const columns: ProColumns<any>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      tip: '点击可查看下级会员',
      width: 180,
      hideInSearch: true,
      hideInTable: true,
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      width: 110,
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
      title: '姓名',
      dataIndex: 'name',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '银行名称',
      dataIndex: 'bankName',
      width: 160,
      hideInSearch: true,
    },
    {
      title: '银行卡号',
      dataIndex: 'bankCode',
      width: 160,
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
          style={{ color: '#4423da' }}
          key="baseInfo"
          onClick={() => handleUpdateRecord(record, 'baseInfo')}
        >
          <FormOutlined />
          修改
        </a>
      ],
    },
  ];
  const getChildrenCount = (node: any) => {
    if (!node || !node.children) {
      // 如果没有子节点，则直接返回
      return 0;
    }
    let childCount = node.children.length; // 子节点数量初始化为直接子节点数量
    for (let i = 0; i < childCount; i++) {
      // 递归获取每个直接子节点的子节点数量
      childCount += getChildrenCount(node.children[i]);
    }
    return childCount; // 返回总子节点数量
  };
  const buildTree = (data: any[], referrerId = 1) => {
    if (data.length === 1) {
      return data;
    }
    const result: any[] = [];
    for (let i = 0; i < data.length; i++) {
      if (data[i].referrerId === referrerId) {
        const node = {
          ...data[i],
          children: buildTree(data, data[i].id),
          totalChildren: 0,
        };
        if (node.children && node.children.length === 0) {
          delete node.children; // 删除空的 children 属性
        }
        if (node.children) {
          node.totalChildren = getChildrenCount(node);
        }
        result.push(node);
      }
    }
    return result;
  };

  const handleOk = async () => {
    let param: any = {
      id: currentRow?.id,
      phone: currentRow?.phone,
    };
    if (operationType === 'baseInfo') {
      param = {
        ...param,
        name: currentRow?.name,
        bankName: currentRow?.bankName,
        bankCode: currentRow?.bankCode,
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
    // if (operationType === 'changeInvited') {
    //   if (!currentRow?.referrerInviteCode) {
    //     message.warning('请输入新的上级推荐码!');
    //     return;
    //   }
    //   param = {
    //     ...param,
    //     referrerInviteCode: currentRow?.referrerInviteCode,
    //   }
    // }
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
        rowKey="id"
        dateFormatter="string"
        id="accountListIndex"
        size='small'
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
          setTotal(res?.data?.totalSize);
          return {
            data: data,
            page: res?.data?.pageNum,
            success: true,
            total: res?.data?.totalSize,
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
                  value={currentRow?.phone}
                  onChange={(e) => handleChange(e.target.value, 'phone')}
                  readOnly
                />
              </Form.Item>
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
                  placeholder="请输入上级推荐码"
                />
              </Form.Item>
              <Form.Item label="银行卡号">
                <Input
                  value={currentRow?.bankCode}
                  onChange={(e) => handleChange(e.target.value, 'bankCode')}
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
          ) : operationType === 'changeInvited' ? (
            <>
              <Form.Item label="上级推荐码">
                <Input
                  value={currentRow?.referrerInviteCode}
                  onChange={(e) => handleChange(e.target.value, 'referrerInviteCode')}
                  placeholder="请输入上级推荐码"
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
        {currentRow?.phone && (
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

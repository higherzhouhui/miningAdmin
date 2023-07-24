import { PlusOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, Form, Input, message, Modal, Popconfirm, Switch } from 'antd';
import React, { useRef, useState } from 'react';
import { Link } from 'umi';
import type { TableListItem, TableListPagination } from './data';
import { rule, updateRule, removeRule, administerUpdate } from './service';

/**
 * 更新节点
 *
 * @param fields
 */

const handleUpdate = async (fields: any, currentRow?: TableListItem) => {
  const hide = message.loading('正在修改...', 50);
  try {
    await administerUpdate({
      ...currentRow,
      ...fields,
    });
    hide();
    return true;
  } catch (error) {
    hide();
    message.error('修改失败请重试！');
    return false;
  }
};
/**
 * 删除节点
 *
 * @param selectedRows
 */

const AccountList: React.FC = () => {
  /** 分布更新窗口的弹窗 */
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<TableListItem>();
  const FormItem = Form.Item;
  const formRef = useRef<any>();
  const onchangeSwitch = async (e: any, id: string) => {
    const hide = message.loading('操作中...', 50);
    const res = await updateRule({
      id: id,
      disable: e
    })
    hide()
    if (res.code === 200) {
        message.success('操作成功!');
        actionRef?.current?.reload();
    }
  }
  const handleRemove = async (id: string) => {
    const hide = message.loading('正在删除...', 50);
    try {
      const res = await removeRule({id: id});
      hide();
      if (res.code === 200) {
        message.success('修改成功!');
        actionRef?.current?.reload();
      }
      return true;
    } catch (error) {
      hide();
      message.error('修改失败请重试！');
      return false;
    }
  }
  const columns: ProColumns<TableListItem>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      tip: '唯一的 key',
      hideInTable: true,
    },
    {
      title: '账号',
      dataIndex: 'accountName',
    },
    {
      title: '状态',
      dataIndex: 'disable',
      render: (_, record) => {
        return (
          <Switch checked={record.disable} onChange={(e) => {onchangeSwitch(e, record.id)}} />
        );
      },
    },
    {
      title: '类型',
      dataIndex: 'type',
    },
    {
      title: '备注',
      dataIndex: 'comments',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      hideInDescriptions: true,
      render: (_, record) => [
        <a
          key="update"
          onClick={() => {
            setCurrentRow(record);
            handleUpdateModalVisible(true);
          }}
        >
          修改
        </a>,
        <Popconfirm
          title="确认删除？"
          onConfirm={async () => {
            await handleRemove(record.id);
          }}
          key="delete"
        >
          <a style={{ color: 'red' }} key="delete">
            删除
          </a>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<TableListItem, TableListPagination>
        actionRef={actionRef}
        rowKey="id"
        search={false}
        dateFormatter="string"
        toolBarRender={() => [
          <Button type="primary" key="primary">
            <PlusOutlined />
            <Link
              to={{
                pathname: '/admins/add',
              }}
              style={{ color: '#fff' }}
            >
              新增管理员
            </Link>
          </Button>,
        ]}
        pagination={{
          pageSize: 10,
        }}
        request={async (params: TableListPagination) => {
          const res: any = await rule({ pageNum: params.current, pageSize: params.pageSize });
          (res?.data?.list || []).map((item:any) => {
            let disable = '启用'
            if (item.disable) {
              disable = '禁用'
            }
            let type = '普通管理员'
            if (item.type == 1) {
              type = '超级管理员'
            }
            let delFlag = '否'
            if (item.delFlag == 1) {
              delFlag = '是'
            }
            item.delFlag = delFlag
            item.type = type
            item.disable = disable
          })
          return {
            data: res?.data?.list || [],
            page: res?.data?.pageNum,
            success: true,
            total: res?.data?.totalSize,
          };
        }}
        columns={columns}
      />
      <Modal
        width={480}
        bodyStyle={{
          padding: '32px 40px 48px',
        }}
        title="更新用户信息"
        visible={updateModalVisible}
        onCancel={() => {
          handleUpdateModalVisible(false);
          setCurrentRow(undefined);
        }}
        onOk={async () => {
          if (formRef && formRef.current) {
            const accountName = formRef?.current?.getFieldValue('accountName');
            const password = formRef?.current?.getFieldValue('password');
            const comment = formRef?.current?.getFieldValue('comment');
            const value = { accountName, password, comment };
            const success = await handleUpdate(value, currentRow);

            if (success) {
              handleUpdateModalVisible(false);
              setCurrentRow(undefined);
              if (actionRef.current) {
                actionRef.current.reload();
              }
            }
          }
        }}
        getContainer={false}
      >
        <Form
          ref={formRef}
          name="updateuserinfo"
          initialValues={{ ...currentRow  }}
        >
          <FormItem
            name="accountName"
            label="账号"
            labelCol={{ span: 4 }}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input type="text" placeholder="请输入账号" />
          </FormItem>
          <FormItem
            name="password"
            label="密码"
            labelCol={{ span: 4 }}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input type="password" placeholder="请输密码" />
          </FormItem>
          <FormItem
            name="comments"
            label="备注"
            labelCol={{ span: 4 }}
          >
            <Input type="text" placeholder="请输入备注" />
          </FormItem>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default AccountList;

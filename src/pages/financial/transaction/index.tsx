import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, Form, Input, message, Modal, Image, Tag } from 'antd';
import React, { useRef, useState } from 'react';
import type { TableListItem, TableListPagination } from './data';
import { addRule, removeRule, rule, updateRule } from './service';
import ProForm, { ProFormUploadButton } from '@ant-design/pro-form';
import { request } from 'umi';
import { TableOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import type { ProDescriptionsItemProps } from '@ant-design/pro-descriptions';
import ProDescriptions from '@ant-design/pro-descriptions';
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
  const [showDetail, setShowDetail] = useState(false);
  const formRef = useRef<any>();
  const [loading, setLoading] = useState(false);
  const handleUpdateRecord = (record: TableListItem, type: number) => {
    if (loading) {
      return;
    }
    setLoading(true);
    const hide = message.loading('正在操作中...', 50);
    updateRule({
      id: record.id,
      auditStatus: type,
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
  const columns: ProColumns<TableListItem>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      tip: '唯一的 key',
      width: 180,
      hideInTable: true,
      hideInSearch: true,
    },
    {
      title: '交易单号',
      dataIndex: 'tradeNo',
      width: 200,
      hideInTable: true,
      hideInSearch: true,
    },
    {
      title: '项目名称',
      dataIndex: 'title',
      hideInSearch: true,
      width: 100,
      render: (_, record) => {
        return <Tag color="success">{record.title}</Tag>;
      },
    },
    {
      title: '价格',
      dataIndex: 'price',
      hideInSearch: true,
      width: 80,
    },
    {
      title: '项目图',
      dataIndex: 'voucher',
      hideInSearch: true,
      width: 120,
      render: (_, record) => {
        return (
          <Image src={record.image} width={50} style={{ objectFit: 'contain' }} />
        );
      },
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      width: 130,
    },
    {
      title: '状态',
      dataIndex: 'state',
      width: 100,
      valueEnum: {
        0: {
          text: '待支付',
          status: 'Processing',
        },
        1: {
          text: '已完成',
          status: 'Success',
        },
      },
    },
    {
      title: '支付方式',
      dataIndex: 'payType',
      width: 100,
      valueEnum: {
        1: {
          text: '微信',
          status: 'Processing',
        },
        2: {
          text: '支付宝',
          status: 'Success',
        },
        3: {
          text: '银行卡',
          status: 'Default',
        },
        4: {
          text: '挖矿金',
          status: 'Error',
        },
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 150,
      hideInSearch: true,
    }
  ];

  const handleChange = (value: any, attar: string) => {
    const newRow = currentRow;
    newRow[attar] = value;
    setCurrentRow(Object.assign({}, newRow));
  };
  const Upload = {
    //数量
    maxCount: 1,
    accept: 'image/*',
    customRequest: (options: any) => {
      const { onSuccess, onError, file } = options;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'images');
      formData.append('path', 'admin-transaction');
      // /upload为图片上传的地址，后台只需要一个图片的path
      // name，path，status是组件上传需要的格式需要自己去拼接
      request('/api/v1/common/uploadImage', { method: 'POST', data: formData })
        .then((data: any) => {
          const _response = {
            name: file.name,
            status: 'done',
            path: data.data.url + data.data.path,
          };
          handleChange(data.data.path, 'icon');
          //请求成功后把file赋值上去
          onSuccess(_response, file);
        })
        .catch(onError);
    },
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
        rowKey="createTime"
        pagination={{
          current: 1,
        }}
        search={{
          labelWidth: 90,
          //隐藏展开、收起
          collapsed: false,
          collapseRender: () => false,
        }}
        id="transactionIndex"
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => export2Excel('transactionIndex', '订单列表')}
          >
            <TableOutlined />
            导出Excel
          </Button>,
        ]}
        dateFormatter="string"
        scroll={{
          x: 1400,
          y: document?.body?.clientHeight - 470,
        }}
        request={async (params: any) => {
          const res: any = await rule({ ...params, pageNum: params.current });
          // (res?.data?.list || []).map((item: any) => {
          //   let status = '审核中'
          //   if (item.state == 1) {
          //     status = '通过'
          //   } else if (item.state == 2) {
          //     status = '驳回'
          //   }
          //   let payType = '银行卡'
          //   if (item.payType == 1) {
          //     payType = '微信'
          //   } else if (item.payType == 2) {
          //     payType = '支付宝'
          //   }
          //   item.payType = payType
          //   item.status = status
          // })
          let data: any = [];
          data = res?.data?.list;
          return {
            data: data,
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
        title={currentRow?.id ? '修改' : '新增'}
        visible={createModalVisible}
        onOk={() => handleUpdateRecord(currentRow, 1)}
        onCancel={() => handleModalVisible(false)}
        width={600}
      >
        <ProForm formRef={formRef} submitter={false}>
          <ProFormUploadButton
            label="选择图片"
            max={1}
            name="image"
            fieldProps={{
              ...Upload,
            }}
          />
          {currentRow?.icon ? (
            <Form.Item label="">
              <Input value={currentRow?.icon} readOnly />
            </Form.Item>
          ) : null}
          <Form.Item label="邀请人数">
            <Input
              type="number"
              value={currentRow?.inviteNum}
              onChange={(e) => handleChange(e.target.value, 'inviteNum')}
            />
          </Form.Item>
          <Form.Item label="奖励">
            <Input
              type="number"
              value={currentRow?.amount}
              onChange={(e) => handleChange(e.target.value, 'amount')}
            />
          </Form.Item>
        </ProForm>
      </Modal>
      <Modal
        width={600}
        visible={showDetail}
        title={'审核'}
        onOk={() => handleUpdateRecord(currentRow, 1)}
        okText="通过"
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
      </Modal>
    </PageContainer>
  );
};

export default TableList;

import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, Form, Input, message, Modal, Image, Tag, Table, Drawer } from 'antd';
import React, { useRef, useState } from 'react';
import type { TableListItem, TableListPagination } from './data';
import { getOrderCount, removeRule, rule, updateRule } from './service';
import ProForm, { ProFormUploadButton } from '@ant-design/pro-form';
import { request } from 'umi';
import { TableOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import type { ProDescriptionsItemProps } from '@ant-design/pro-descriptions';
import ProDescriptions from '@ant-design/pro-descriptions';
import moment from 'moment';
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
  const [stype, setStype] = useState(1);
  const [showDetail, setShowDetail] = useState(false);
  const formRef = useRef<any>();
  const [loading, setLoading] = useState(false);
  const [tongji, setTongji] = useState<any>({})
  const handleUpdateRecord = (record: TableListItem) => {
    if (loading) {
      return;
    }
    setLoading(true);
    const hide = message.loading('正在操作中...', 50);
    updateRule({
      id: record.id,
      auditStatus: stype,
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
  const handleShowDetail = (record: any, ctype: number) => {
    setCurrentRow(record);
    setStype(ctype);
    setShowDetail(true);
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
      title: '时间范围',
      dataIndex: 'time',
      width: 120,
      valueType: 'dateRange',
      hideInTable: true,
      hideInDescriptions: true,
    },
    {
      title: '交易单号',
      dataIndex: 'tradeNo',
      width: 130,
      render: (dom, entity) => {
        return (
          <div
            style={{color: 'blue', textDecoration: 'underLine'}}
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
      title: '项目名称',
      dataIndex: 'name',
      hideInSearch: true,
      width: 110,
      render: (_, record) => {
        return <Tag color="success">{record.name}</Tag>;
      },
    },
    {
      title: '价格',
      dataIndex: 'price',
      hideInSearch: true,
      width: 80,
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
        2: {
          text: '驳回',
          status: 'Error',
        },
      },
    },
    {
      title: '支付凭证',
      dataIndex: 'voucher',
      hideInSearch: true,
      hideInTable: true,
      hideInDescriptions: true,
      width: 130,
      render: (_, record) => {
        return (
          <>
            {record.payType === 3 ? (
              <Image
                src={record.voucher}
                width={120}
                height={120}
                style={{ objectFit: 'contain' }}
              />
            ) : null}
          </>
        );
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
        // 3: {
        //   text: '银行卡',
        //   status: 'Default',
        // },
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 150,
      hideInSearch: true,
    },
    {
      title: '支付时间',
      dataIndex: 'paymentTime',
      width: 150,
      hideInSearch: true,
      hideInTable: true,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: 120,
      fixed: 'right',
      hideInDescriptions: true,
      hideInTable: true,
      render: (_, record) => [
        record.state == 0 && record.payType === 3 ? (
          <a
            key="access"
            onClick={() => {
              handleShowDetail(record, 1);
            }}
          >
            通过
          </a>
        ) : null,
        record.state == 0 && record.payType === 3 ? (
          <a
            key="bohui"
            style={{ color: 'red' }}
            onClick={() => {
              handleShowDetail(record, 2);
            }}
          >
            驳回
          </a>
        ) : null,
      ],
    },
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
      request('/upload-service/upload/uploadImage', { method: 'POST', data: formData })
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
        rowKey="id"
        pagination={{
          current: 1,
          pageSizeOptions: [50, 200, 500, 1000, 2000]
        }}
        size='small'
        search={{
          labelWidth: 70,
          span: 8,
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
          x: 1000,
          y: 400,
        }}
        request={async (params: any) => {
          const requestParams = { ...params, pageNum: params.current }
          if (requestParams.time && requestParams.time.length) {
            requestParams.startDate = moment(requestParams.time[0]).format('YYYY-MM-DD HH:mm:ss')
            requestParams.endDate = moment(requestParams.time[1]).format('YYYY-MM-DD HH:mm:ss')
            delete requestParams.time
          }
          getOrderCount(requestParams).then(res => {
            if (res.code === 200) {
              setTongji(res.data)
            }
          })
          const res: any = await rule(requestParams);
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
        summary={() => <Table.Summary fixed>
          <Table.Summary.Row>
            <Table.Summary.Cell index={0}>合计</Table.Summary.Cell>
            <Table.Summary.Cell index={1}>
              <p style={{fontSize: '12px'}}>总订单</p>
              <p style={{fontSize: '12px', color: 'red'}}>{tongji?.orderNum}</p>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={2}>
              <p style={{fontSize: '12px'}}>已支付订单</p>
              <p style={{fontSize: '12px', color: 'red'}}>{tongji?.payOrderNum}</p>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={2}>
              <p style={{fontSize: '12px'}}>总金额</p>
              <p style={{fontSize: '12px', color: 'red'}}>{tongji?.sumOrderPrice}</p>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={2}>
              <p style={{fontSize: '12px'}}>已支付金额</p>
              <p style={{fontSize: '12px', color: 'red'}}>{tongji?.payOrderPrice}</p>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={2}>
              <p style={{fontSize: '12px'}}>平均单价</p>
              <p style={{fontSize: '12px', color: 'red'}}>{Math.round((tongji?.payOrderPrice || 0) / (tongji?.payOrderNum || 1))}</p>
            </Table.Summary.Cell>
          </Table.Summary.Row>
        </Table.Summary>}
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

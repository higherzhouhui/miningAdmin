import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, Form, Input, message, Modal,Drawer, Popconfirm } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import type { TableListItem, TableListPagination } from './data';
import { getOrderDetail, removeRule, rule, sendGoods, updateRule } from './service';
import ProForm, { ProFormUploadButton } from '@ant-design/pro-form';
import { TableOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import type { ProDescriptionsItemProps } from '@ant-design/pro-descriptions';
import ProDescriptions from '@ant-design/pro-descriptions';
import styles from  './style.less'
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


const handleSent = async (selectedRows: TableListItem[], actionRef?: any) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;
  selectedRows.forEach(async (row) => {
    try {
      const res = await sendGoods(row.id);
      hide();
      if (res.code === 200) {
        message.success('发货成功，即将刷新');
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
  const [query, setQuery] = useState<any>({})
  useEffect(() => {
    // getOrderDetail({id: '24022714061103012'})
  }, [])
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
      title: '交易单号',
      dataIndex: 'orderNo',
      width: 150,
      hideInSearch: true,
      render: (dom, entity) => {
        return (
          <div
            style={{ color: 'blue', textDecoration: 'underLine', cursor: 'pointer' }}
            onClick={async() => {
              setLoading(true)
              const res: any = await getOrderDetail({id: entity.id})
              setCurrentRow(res.data);
              setLoading(false)
              setShowDetail(true);
            }}
          >
            {dom}
          </div>
        );
      },
    },
    {
      title: '订单价格',
      dataIndex: 'orderPrice',
      hideInSearch: true,
      width: 80,
    },
    {
      title: '应付',
      dataIndex: 'payPrice',
      width: 80,
      hideInSearch: true,
    },
    {
      title: '订单状态',
      dataIndex: 'state',
      width: 130,
      valueEnum: {
        0: {
          text: '待支付',
          status: 'Error'
        },
        1: {
          text: '待发货',
          status: 'Error'
        },
        2: {
          text: '待收货',
          status: 'Error'
        },
        3: {
          text: '待评价',
          status: 'Error'
        },
        4: {
          text: '交易完成',
          status: 'Success'
        },
        5: {
          text: '订单失效',
          status: 'Error'
        },
      },
    },
    {
      title: '支付方式',
      dataIndex: 'payType',
      width: 100,
      hideInSearch: true,
      valueEnum: {
        1: {
          text: '微信支付',
          status: 'Success',
        },
        2: {
          text: '余额',
          status: 'Info',
        },
        3: {
          text: '信用额度',
          status: 'Error',
        },
      },
    },
    {
      title: '订单类型',
      dataIndex: 'orderType',
      width: 100,
      valueEnum: {
        2: {
          text: '会员订单',
        },
        1: {
          text: '产品订单',
        },
        3: {
          text: '商户进货订单',
        },
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
      dataIndex: 'payTime',
      width: 150,
      hideInSearch: true,
    },
    {
      title: '收货人姓名',
      dataIndex: 'receiverName',
      width: 150,
      hideInSearch: true,
      hideInTable: true,
    },
    {
      title: '收货人电话',
      dataIndex: 'phone',
      width: 150,
      render: (_, record: any) => {
        return <span>{`${record.receiverPhone}`}</span>
      }
    },
    {
      title: '收货地址',
      dataIndex: 'receiverName',
      width: 150,
      hideInSearch: true,
      hideInTable: true,
      render: (_, record: any) => {
        return <span>{`${record.receiverProvince}/${record.receiverCity}/${record.receiverRegion}${record.receiverDetailAddress}`}</span>
      }
    },
    {
      title: '商品列表',
      dataIndex: 'receiverName',
      width: 150,
      hideInSearch: true,
      hideInTable: true,
      render: (_, record: any) => {
        return  record.orderProductList ? <div className={styles.listWrapper}>
          {
            record.orderProductList.map((item: any) => {
              return <div key={item.id} className={styles.list}>
                <div className={styles.left}>
                  <img src={item.image} />
                  <div>{item.title}</div>
                </div>
                <div className={styles.price}>单价{item.price}</div>
                <div>数量{item.num}</div>
              </div>
            })
          }
        </div> : null
      }
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: 90,
      fixed: 'right',
      hideInDescriptions: true,
      render: (_, record) => [
        record.orderType == 3 && record.state == 1 ? <Popconfirm
        title="确认发货？"
        onConfirm={async () => {
          await handleSent([record], actionRef);
        }}
        key="fahuo"
      >
        <a style={{ color: 'blue' }} key="delete">
          发货
        </a>
      </Popconfirm> : null,
      <Popconfirm
      title="确认删除？"
      onConfirm={async () => {
        await handleRemove([record], actionRef);
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

  const staticWithUrl = (obj: any, url: string) => {
    let nUrl = url
    Object.keys(obj).map((item: any) => {
      if (obj[item] && !nUrl.includes('?')) {
        nUrl += `?${item}=${obj[item]}`
      } else if (obj[item]) {
        nUrl += `&${item}=${obj[item]}`
      }
    })
    return nUrl
  }

  const export2Excel = (id: string, name: string) => {
    const href = staticWithUrl(query, '/api/order/excelOrder')
    location.href = href
    return
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
          pageSizeOptions: [50, 200, 500, 1000, 2000],
        }}
        size="small"
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
      
        request={async (params: any) => {
          const requestParams = { ...params, pageNum: params.current };
          setQuery(requestParams)
          const res: any = await rule(requestParams);
          let data: any = [];
          data = res?.data?.list;
          return {
            data: data,
            page: res?.data?.pageNum,
            success: true,
            total: res?.data?.total,
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

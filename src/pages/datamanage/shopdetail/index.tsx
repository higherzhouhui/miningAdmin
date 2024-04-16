import { FooterToolbar, PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, Form, Input, message, Modal, Popconfirm, Image, Tag } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import type { TableListItem, TableListPagination } from './data';
import { removeRule, rule, updateRule } from './service';
import * as XLSX from 'xlsx';
import { TableOutlined } from '@ant-design/icons';
import type { ProDescriptionsItemProps } from '@ant-design/pro-descriptions';
import ProDescriptions from '@ant-design/pro-descriptions';
import { useLocation } from 'umi';
/**
 * 删除节点
 *
 * @param selectedRows
 */

const handleRemove = async (selectedRows: TableListItem[], actionRef?: any) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;
  selectedRows.map(async (item) => {
    try {
      const res = await removeRule({ id: item.id });
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
  return false;
};

const TableList: React.FC = () => {
  /** 新建窗口的弹窗 */
  /** 分布更新窗口的弹窗 */
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<TableListItem | any>();
  const [selectedRowsState, setSelectedRows] = useState<TableListItem[]>([]);
  const [showDetail, setShowDetail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState(1);
  const formRef = useRef<any>();
  const [myParams, setMyparams] = useState<any>({})
  const localMy = useLocation()
  const handleUpdateRecord = (record: TableListItem, ctype: number) => {
    if (loading) {
      return;
    }
    const hide = message.loading('正在操作中...', 50);
    setLoading(true);
    updateRule({
      id: record.id,
      stock: record.modifyStock,
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
  const showDetailModal = (row: any, t: number) => {
    setCurrentRow(JSON.parse(JSON.stringify(row)));
    setShowDetail(true);
    setType(t);
  };
  
  const columns: ProColumns<TableListItem>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      tip: '唯一的 key',
      width: 120,
      hideInSearch: true,
      hideInTable: true,
    },
    {
      title: '商品名称',
      dataIndex: 'title',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '商品图',
      dataIndex: 'Logo',
      width: 100,
      hideInSearch: true,
      render: (_, record: any) => {
        return <Image src={record.image} style={{ width: '80px', objectFit: 'contain' }} />;
      },
    },
    {
      title: '价格',
      dataIndex: 'price',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '会员价',
      dataIndex: 'memberPrice',
      width: 100,
      hideInSearch: true,
    },
  
    {
      title: '状态',
      dataIndex: 'putaway',
      width: 120,
      hideInSearch: true,
      render: (_, record: any) => {
        return <span>{record.putaway ? <Tag color='success'>已上架</Tag> : <Tag color='error'>未上架</Tag>}</span>;
      },
    },
    {
      title: '库存',
      dataIndex: 'stock',
      hideInSearch: true,
      width: 100,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: 80,
      fixed: 'right',
      hideInDescriptions: true,
      render: (_, record: any) => [
      <a style={{ color: 'blue' }} key="delete" onClick={() => showDetailModal(record, 2)}>
        修改
      </a>
      ],
    },
  ];
  const addNewNotice = () => {
    setCurrentRow(Object.assign({}, {}));
    handleModalVisible(true);
    formRef?.current?.resetFields();
  };


  const handleChange = (value: any, attar: string) => {
    const newRow = currentRow;
    newRow[attar] = value;
    setCurrentRow(Object.assign({}, newRow));
  };


  const export2Excel = (id: string, name: string) => {
    const exportFileContent = document.getElementById(id)!.cloneNode(true);
    const wb = XLSX.utils.table_to_book(exportFileContent, { sheet: 'sheet1' });
    XLSX.writeFile(wb, `${name}.xlsx`);
  };


  const getParams = (url: string) => {
    const urlObject = new URL(url);
    const params = {};
    for (const [key, value] of urlObject.searchParams.entries()) {
      params[key] = value;
    }
    console.log(params)
    return params;
  }

  useEffect(() => {
    const newObj = localStorage.getItem('shopdetail')
    if (newObj) {
      const obj = JSON.parse(newObj)
      let reFresh = false
      if (myParams.merchantId && obj.merchantId && obj.merchantId != myParams.merchantId) {
        reFresh = true
      }
      setMyparams(obj)
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
        headerTitle={`名称：${myParams.title}`}
        id="withdrawListIndex"
        size="small"
        search={false}
        pagination={{
          current: 1,
          pageSizeOptions: [100, 500, 1000, 2000],
        }}
        dateFormatter="string"

        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => export2Excel('withdrawListIndex', '店铺详情')}
          >
            <TableOutlined />
            导出Excel
          </Button>,
        ]}
        scroll={{
          y: Math.max(400, document?.body?.clientHeight - 390),
        }}
        request={async (params: TableListPagination) => {
          const res: any = await rule({ pageSize: 10, pageNum: params.current, merchantId: myParams.merchantId });
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
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              已选择{' '}
              <a
                style={{
                  fontWeight: 600,
                }}
              >
                {selectedRowsState.length}
              </a>{' '}
              项 &nbsp;&nbsp;
            </div>
          }
        >
          <Popconfirm
            title="确认删除？"
            onConfirm={async () => {
              await handleRemove(selectedRowsState);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
            onCancel={() => {
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          >
            <Button style={{ width: '100px' }}>
              {selectedRowsState.length > 1 ? '批量删除' : '删除'}
            </Button>
          </Popconfirm>
        </FooterToolbar>
      )}
      <Modal
        width={600}
        visible={showDetail}
        title={'详情'}
        onOk={() => handleUpdateRecord(currentRow, type)}
        okText={type === 1 ? '通过' : '确认'}
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
        {
          type == 2 ?  <Form.Item label="修改库存">
          <Input
            value={currentRow?.modifyStock}
            onChange={(e) => handleChange(e.target.value, 'modifyStock')}
            placeholder="请输入库存"
            type='number'
          />
        </Form.Item> : null
        }
      </Modal>
    </PageContainer>
  );
};

export default TableList;

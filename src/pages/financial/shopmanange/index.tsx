import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import type { TableListItem, TableListPagination } from './data';
import { rule, } from './service';
import { TableOutlined } from '@ant-design/icons';

const TableList: React.FC = () => {
  /** 新建窗口的弹窗 */
  /** 分布更新窗口的弹窗 */
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<TableListItem | any>();
  const [showDetail, setShowDetail] = useState(false);
  useEffect(() => {
    // getOrderDetail({id: '24022714061103012'})
  }, [])

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
      title: '日期',
      dataIndex: 'date',
      valueType: 'dateRange',
      hideInTable: true,
    },
    {
      title: '学校',
      dataIndex: 'schoolTitle',
      width: 120,
      hideInSearch: true,
    },
    {
      title: '店铺名称',
      dataIndex: 'merchantTitle',
      hideInSearch: true,
      width: 80,
    },
    {
      title: '店长手机号',
      dataIndex: 'phone',
      width: 120,
    },
    {
      title: '营业额',
      dataIndex: 'turnover',
      width: 80,
      hideInSearch: true,
    },
    {
      title: '店铺收益',
      dataIndex: 'merchantEarnings',
      width: 80,
      hideInSearch: true,
    },
    {
      title: '平台收益',
      dataIndex: 'platformEarnings',
      width: 80,
      hideInSearch: true,
    },
    {
      title: '日期',
      dataIndex: 'createTime',
      width: 150,
      hideInSearch: true,
    },
  ];


  const export2Excel = (id: string, name: string) => {
    // window.open('/api/turnover/excelTurnover')
    location.href = '/api/turnover/excelTurnover'
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
          if (params.date && params.date.length == 2) {
              params.startDate = params.date[0]
              params.endDate = params.date[1]
              delete params.date
          }
          const requestParams = { ...params, pageNum: params.current };
          const res: any = await rule(requestParams);
          let data: any = [];
          data = res?.data?.list;
          data.map((item: any, index: any) => {
            item.id = index
          })
          return {
            data: data,
            page: res?.data?.pageNum,
            success: true,
            total: res?.data?.total,
          };
        }}
        columns={columns}
      />
    </PageContainer>
  );
};

export default TableList;

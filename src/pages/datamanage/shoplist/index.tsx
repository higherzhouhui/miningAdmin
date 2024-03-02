import { FooterToolbar, PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, Form, Input, message, Modal, Popconfirm, Image, Tag } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import type { TableListItem, TableListPagination } from './data';
import { addRule, removeRule, rule, getConfig, updateConfig, updateRule } from './service';
import ProForm, { ProFormUploadButton } from '@ant-design/pro-form';
import { request } from 'umi';
import * as XLSX from 'xlsx';
import { TableOutlined } from '@ant-design/icons';
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
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  /** 分布更新窗口的弹窗 */
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<TableListItem | any>();
  const [selectedRowsState, setSelectedRows] = useState<TableListItem[]>([]);
  const [showDetail, setShowDetail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState(1);
  const formRef = useRef<any>();
  const [baseConfig, setBaseConfig] = useState<any>({});
  const handleUpdateRecord = (record: TableListItem, ctype: number) => {
    if (loading) {
      return;
    }
    const hide = message.loading('正在操作中...', 50);
    setLoading(true);
    updateRule({
      id: record.id,
      state: ctype,
      reason: record.reason,
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
    setCurrentRow(row);
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
      title: '学校名称',
      dataIndex: 'schoolTitle',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '用户ID',
      dataIndex: 'userId',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '推荐人ID',
      dataIndex: 'referrerId',
      hideInSearch: true,
      width: 150,
    },
    {
      title: '店铺名称',
      dataIndex: 'title',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '店铺logo',
      dataIndex: 'Logo',
      width: 100,
      hideInSearch: true,
      render: (_, record: any) => {
        return <Image src={record.logo} style={{ width: '80px', objectFit: 'contain' }} />;
      },
    },
    {
      title: '状态',
      dataIndex: 'state',
      width: 120,
      valueEnum: {
        0: {
          text: '审核中',
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
      title: '店铺类型',
      dataIndex: 'type',
      valueEnum: {
        1: {
          text: '商店',
        },
        2: {
          text: '加盟商',
        },
      },
    },
    {
      title: '申请人手机号',
      dataIndex: 'phone',
      width: 150,
      hideInSearch: true,
    },
    {
      title: '申请营业地址',
      dataIndex: 'phone',
      width: 150,
      hideInSearch: true,
      render: (_, record: any) => {
        return (
          <span>{`${record.province}/${record.city}/${record.region}${record.detailAddress}`}</span>
        );
      },
    },
    {
      title: '申请时间',
      dataIndex: 'createTime',
      width: 150,
      hideInSearch: true,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: 150,
      fixed: 'right',
      hideInDescriptions: true,
      render: (_, record: any) => [
        record.state == 0 ? (
          <a key="access" onClick={() => showDetailModal(record, 1)}>
            通过
          </a>
        ) : null,
        record.state == 0 ? (
          <a style={{ color: 'red' }} key="delete" onClick={() => showDetailModal(record, 2)}>
            驳回
          </a>
        ) : null,

        <Popconfirm
          key="bohui"
          title="确认删除？"
          onConfirm={async () => {
            await handleRemove([record]);
            setSelectedRows([]);
            actionRef.current?.reloadAndRest?.();
          }}
        >
          <a style={{ color: '#f9c' }}>删除</a>
        </Popconfirm>,
      ],
    },
  ];
  const addNewNotice = () => {
    setCurrentRow(Object.assign({}, {}));
    handleModalVisible(true);
    formRef?.current?.resetFields();
  };

  const handleOk = async () => {
    const hide = message.loading(`正在修改中...`, 50);
    updateConfig(baseConfig).then((res) => {
      hide();
      if (res.code === 200) {
        message.success('修改成功！');
        handleModalVisible(false);
      } else {
        message.error(res?.message || res?.msg);
      }
    });
  };
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
      formData.append('path', 'admin-withdraw');
      // /upload为图片上传的地址，后台只需要一个图片的path
      // name，path，status是组件上传需要的格式需要自己去拼接
      request('/api/v1/common/uploadImage', { method: 'POST', data: formData })
        .then((data) => {
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

  const handleChangeSwitch = (flag: boolean) => {
    updateConfig({ ...baseConfig, cashWithdraw: flag }).then((res) => {
      if (res.code === 200) {
        setBaseConfig({ ...baseConfig, cashWithdraw: flag });
      } else {
        message.error(res?.message || res?.msg);
      }
    });
  };

  const getBaseConfig = () => {};

  const handleShowConfig = () => {
    handleModalVisible(true);
  };

  const handleChangeConfig = (value: any, attar: string) => {
    const newRow = JSON.parse(JSON.stringify(baseConfig));
    newRow[attar] = value;
    setBaseConfig(newRow);
  };

  useEffect(() => {
    getBaseConfig();
  }, []);

  return (
    <PageContainer>
      <ProTable<TableListItem, TableListPagination>
        actionRef={actionRef}
        rowKey="createTime"
        id="withdrawListIndex"
        size="small"
        search={{
          labelWidth: 90,
          //隐藏展开、收起
          collapsed: false,
          collapseRender: () => false,
        }}
        pagination={{
          current: 1,
          pageSizeOptions: [100, 500, 1000, 2000],
        }}
        dateFormatter="string"
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => export2Excel('withdrawListIndex', '出款审核列表')}
          >
            <TableOutlined />
            导出Excel
          </Button>,
        ]}
        scroll={{
          x: 1400,
          y: Math.max(400, document?.body?.clientHeight - 490),
        }}
        request={async (params: TableListPagination) => {
          const res: any = await rule({ ...params, pageNum: params.current });
          // (res?.data?.list || []).map((item: any) => {
          //   let status = '审核中'
          //   if (item.auditStatus == 1) {
          //     status = '通过'
          //   } else if (item.auditStatus == 2) {
          //     status = '驳回'
          //   }
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
        title="提现税配置"
        visible={createModalVisible}
        onOk={() => handleOk()}
        onCancel={() => handleModalVisible(false)}
      >
        <ProForm formRef={formRef} submitter={false}>
          <Form.Item label="税额">
            <Input
              type="number"
              value={baseConfig?.payPrice}
              onChange={(e) => handleChangeConfig(e.target.value, 'payPrice')}
            />
          </Form.Item>
        </ProForm>
      </Modal>
      <Modal
        width={600}
        visible={showDetail}
        title={'详情'}
        onOk={() => handleUpdateRecord(currentRow, type)}
        okText={type === 1 ? '通过' : '驳回'}
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
        <Form.Item label="驳回理由">
          <Input
            value={currentRow?.reason}
            onChange={(e) => handleChange(e.target.value, 'reason')}
            placeholder="请输入驳回理由"
          />
        </Form.Item>
      </Modal>
    </PageContainer>
  );
};

export default TableList;

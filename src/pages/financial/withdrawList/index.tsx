import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, Form, Input, message, Modal, Popconfirm, Switch } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import type { TableListItem, TableListPagination } from './data';
import { addRule, removeRule, rule, updateRule, getConfig, updateConfig } from './service';
import ProForm, { ProFormUploadButton } from '@ant-design/pro-form';
import { request } from 'umi';
import * as XLSX from 'xlsx'
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
  const [showDetail, setShowDetail] = useState(false)
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState(1)
  const formRef = useRef<any>()
  const [baseConfig, setBaseConfig] = useState<any>({})
  const handleUpdateRecord = (record: TableListItem, ctype: number) => {
    if (loading) {
      return
    }
    const hide = message.loading('正在操作中...', 50);
    setLoading(true)
    updateRule({
      id: record.id,
      auditStatus: ctype
    }).then((res: any) => {
      hide();
      setLoading(false)
      if (res.code === 200) {
        setCurrentRow({})
        setShowDetail(false)
        message.success('操作完成，即将刷新');
        actionRef.current?.reloadAndRest?.();
      }
    }).catch(() => {
      hide();
    })
    // setCurrentRow(record);
    // handleModalVisible(true);
    // formRef?.current?.resetFields();
  }
  const showDetailModal = (row: any, t: number) => {
    setCurrentRow(row)
    setShowDetail(true)
    setType(t)
  }
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
      title: '姓名',
      dataIndex: 'name',
      width: 120,
      hideInSearch: true,
    },
    {
      title: '金额',
      dataIndex: 'amount',
      width: 100,
      hideInSearch: true,
    }, 
    {
      title: '手机号',
      dataIndex: 'phone',
      width: 150,
    },{
      title: '银行名称',
      dataIndex: 'bankName',
      width: 200,
      hideInSearch: true,
    }, {
      title: '银行卡号',
      dataIndex: 'bankCode',
      width: 180,
      hideInSearch: true,
    }, {
      title: '状态',
      dataIndex: 'auditStatus',
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
        }
      },
    }, {
      title: '手续费',
      dataIndex: 'serviceCharge',
      width: 80,
      hideInSearch: true,
    },
    {
      title: '资金来源',
      dataIndex: 'type',
      width: 150,
      hideInSearch: true,
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
      width: 120,
      fixed: 'right',
      hideInDescriptions: true,
      render: (_, record) => [
        record.auditStatus == 0 ? <a key="access" onClick={() => showDetailModal(record, 1)}>
        审核
        </a> : null,
        // eslint-disable-next-line react/jsx-key
        record.auditStatus == 0 ? <a style={{ color: 'red' }} key="delete" onClick={() => showDetailModal(record, 2)}>
        驳回
      </a> : null,
      ],
    },
  ];
  const addNewNotice = () => {
    setCurrentRow(Object.assign({}, {}));
    handleModalVisible(true);
    formRef?.current?.resetFields();
  };

  const handleOk = async () => {
    const hide = message.loading(`正在${currentRow?.id ? '更新' : '新增'}`);
    try {
      const res = await addRule(currentRow);
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
    const newRow = currentRow
    newRow[attar] = value
    setCurrentRow(Object.assign({}, newRow))
  }
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
      request('/upload-service/upload/uploadImage', { method: 'POST', data: formData })
        .then((data) => {
          const _response = { name: file.name, status: 'done', path: data.data.url + data.data.path };
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
    updateConfig({...baseConfig, cashWithdraw: flag}).then(res => {
      if (res.code === 200) {
        setBaseConfig({...baseConfig, cashWithdraw: flag})
      } else {
        message.error(res?.message || res?.msg)
      }
    })
  }

  const getBaseConfig = () => {
    getConfig().then(res => {
      if (res.code === 200) {
        setBaseConfig({id: res?.data?.id, cashWithdraw: res?.data?.cashWithdraw})
      }
    })
  }

  useEffect(() => {
    getBaseConfig()
  }, [])

  return (
    <PageContainer>
      <ProTable<TableListItem, TableListPagination>
        actionRef={actionRef}
        rowKey="createTime"
        id='withdrawListIndex'
        search={{
          labelWidth: 90,
          //隐藏展开、收起
          collapsed: false,
          collapseRender:()=>false,
        }}
        pagination={{
          current: 1
        }}
        dateFormatter="string"
        headerTitle={<div>现金钱包提现：<span style={{color: baseConfig?.cashWithdraw ? '#000' : 'blue'}}>关</span><Switch checked={baseConfig?.cashWithdraw} onChange={(e) => handleChangeSwitch(e)} /><span style={{color: baseConfig?.cashWithdraw ? 'blue' : '#000'}}>开</span></div>}
        toolBarRender={() => [
          <Button type="primary" key="primary" onClick={() => export2Excel('withdrawListIndex', '出款审核列表')}>
            <TableOutlined />
            导出Excel
          </Button>,
        ]}
        scroll={{
          x: 1400,
          y: document?.body?.clientHeight - 390,
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
          data = res?.data?.list
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
        onOk={() => handleOk()}
        onCancel={() => handleModalVisible(false)}
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
          {
            currentRow?.icon ? <Form.Item label="">
            <Input value={currentRow?.icon} readOnly />
          </Form.Item> : null
          }
          <Form.Item label="邀请人数">
            <Input type='number' value={currentRow?.inviteNum} onChange={(e) => handleChange(e.target.value, 'inviteNum')}/>
          </Form.Item>
          <Form.Item label="奖励">
            <Input type='number' value={currentRow?.amount} onChange={(e) => handleChange(e.target.value, 'amount')}/>
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
      </Modal>
    </PageContainer>
  );
};

export default TableList;

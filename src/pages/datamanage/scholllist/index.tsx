import { PlusOutlined } from '@ant-design/icons';
import type { ProDescriptionsItemProps } from '@ant-design/pro-descriptions';
import ProDescriptions from '@ant-design/pro-descriptions';
import { FooterToolbar, PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, Drawer, Form, Input, message, Modal, Popconfirm, Tooltip, Tree } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import type { TableListItem, TableListPagination } from './data';
import { addRule, getAreaList, removeRule, rule } from './service';
import ProForm from '@ant-design/pro-form';
import { request } from 'umi';

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
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<TableListItem | any>({});
  const [selectedRowsState, setSelectedRows] = useState<TableListItem[]>([]);
  const [image, setImage] = useState('');
  const [detail, setDetail] = useState('')
  const [areaList, setAreaList] = useState<any>([])
  const formRef = useRef<any>()

  const formatBookmarksTreeList = (list: []) => {
    list.map((item: any)=>{
      // 此行是重点
       item.key = item.id;
       if (item.children) {
           item.children = formatBookmarksTreeList(item.children);
       }
       return item;
   });
   return list;
  }

  useEffect(() => {
    getAreaList().then(res => {
      if (res.code == 200) {
        const list = formatBookmarksTreeList(res.data)
        setAreaList(list)
      }
    })
  }, [])
  
  
  const onSelect = (selectedKeys: any, info: any) => {
    console.log('selected', selectedKeys, info);
    const node = info.node
    if (node.children) {
      setDetail('')
    } else {
      const pos = node.pos
      const posArr = pos.split('-')
      const _location = {
        provinceId: areaList[posArr[1]].id,
        province: areaList[posArr[1]].name,
        cityId: areaList[posArr[1]].children[posArr[2]].id,
        city: areaList[posArr[1]].children[posArr[2]].name,
        regionId: areaList[posArr[1]].children[posArr[2]].children[posArr[3]].id,
        region: areaList[posArr[1]].children[posArr[2]].children[posArr[3]].name,
      }
      const _detail = `${_location.province}/${_location.city}/${_location.region}`
      setDetail(_detail)
      setCurrentRow({...currentRow, ..._location})
    }
  };

  const onCheck = (checkedKeys: any, info: any) => {
    console.log('onCheck', checkedKeys, info);
  };


  const handleUpdateRecord = (record: TableListItem) => {
    setCurrentRow(record);
    const _detail = `${record.province}/${record.city}/${record.region}`
    setDetail(_detail)
    handleModalVisible(true);
    formRef?.current?.resetFields();
  }
  const handleChangeCurrent = (key: string, value: any) => {
    const current = currentRow || {}
    current[key] = value
    setCurrentRow({...current})
  }
  const columns: ProColumns<TableListItem>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      tip: '唯一的 key',
      hideInTable: true,
    },
    {
      title: '学校',
      dataIndex: 'title',
      width: 200,
    },
    {
      title: '省份',
      dataIndex: 'province',
      width: 120,
    },
    {
      title: '城市',
      dataIndex: 'city',
      width: 120,
    },
    {
      title: '区',
      dataIndex: 'region',
      width: 120,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      fixed: 'right',
      width: 100,
      hideInDescriptions: true,
      render: (_, record) => [
        <a
          key="update"
          onClick={() => {
            handleUpdateRecord(record)
          }}
        >
          修改
        </a>,
        // eslint-disable-next-line react/jsx-key
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
  const addNewNotice = () => {
    setCurrentRow({});
    handleModalVisible(true);
    formRef?.current?.resetFields();
  };
  const MemoTooltip = Tooltip || React.memo(Tooltip);
  const handleOk = async () => {
    if (!detail || !currentRow.title) {
      message.warn('请选择地区和输入学校名称')
      return 
    }
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
      }
      return true;
    } catch (error) {
      hide();
      message.error('操作失败，请重试');
      return false;
    }
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
      formData.append('path', 'admin-banner');
      // /upload为图片上传的地址，后台只需要一个图片的path
      // name，path，status是组件上传需要的格式需要自己去拼接
      request('/api/v1/common/uploadImage', { method: 'POST', data: formData })
        .then((data: any) => {
          const _response = { name: file.name, status: 'done', path: data.data.fileUrl };
          setImage(data.data.fileUrl);
          //请求成功后把file赋值上去
          onSuccess(_response, file);
        })
        .catch(onError);
    },
  };

  return (
    <PageContainer>
      <ProTable<TableListItem, TableListPagination>
        actionRef={actionRef}
        rowKey="id"
        search={false}
        dateFormatter="string"
        pagination={{
          pageSize: 10,
        }}
        toolBarRender={() => [
          <Button type="primary" key="primary" onClick={() => addNewNotice()}>
            <PlusOutlined />
            新增
          </Button>,
        ]}
        request={async (params: TableListPagination) => {
          const res: any = await rule({ pageNum: params.current, pageSize: params.pageSize });
          return {
            data: res?.data?.list || [],
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
        title={currentRow?.id ? '修改' : '新增'}
        visible={createModalVisible}
        onOk={() => handleOk()}
        onCancel={() => handleModalVisible(false)}
      >
        <ProForm formRef={formRef} submitter={false}>
       
          <Form.Item label="请选择学校所在省市区">
            <Input value={detail} readOnly placeholder='请选择省市区' />
            <Tree
              treeData={areaList}
              height={300}
              titleRender={(item: any) => <MemoTooltip title={item.name as any}>{item.name as any}</MemoTooltip>}
              onSelect={onSelect}
              onCheck={onCheck}
            />
          </Form.Item>
          <Form.Item label="学校名称">
            <Input value={currentRow.title} onChange={(e) => handleChangeCurrent('title', e.target.value)} placeholder='请输入学校名称' />
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
          <ProDescriptions<TableListItem>
            column={2}
            title={currentRow?.id}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.id,
            }}
            columns={columns as ProDescriptionsItemProps<TableListItem>[]}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default TableList;

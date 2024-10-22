import type { ProDescriptionsItemProps } from '@ant-design/pro-descriptions';
import ProDescriptions from '@ant-design/pro-descriptions';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, Drawer, Form, Input, Modal, Popconfirm, Image, message } from 'antd';
import React, { useRef, useState } from 'react';
import type { TableListItem, TableListPagination } from './data';
import { addRule, rule, removeRule, sendRule } from './service';
import ProForm, { ProFormUploadButton } from '@ant-design/pro-form';
import style from './style.less';
import * as XLSX from 'xlsx';
import { DeleteOutlined, EditOutlined, PlusOutlined, SendOutlined, TableOutlined } from '@ant-design/icons';
import WangEditor from '@/components/Editor';
import { getFileUrl, removeHtmlTag } from '@/utils/common';
import { request } from 'umi';

const TableList: React.FC = () => {
  /** 分布更新窗口的弹窗 */
  const [showDetail, setShowDetail] = useState(false);
  const [currentRow, setCurrentRow] = useState<any>({});
  const actionRef = useRef<ActionType>();
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  const formRef = useRef<any>();
  const [operationType, setOperationType] = useState('baseInfo');
  const partnerList = [];

  const [projectId, setprojectId] = useState('');
  const titleMap: any = {
    baseInfo: '修改基本资料',
    resetPassword: '修改密码',
    addNewProject: '添加项目',
  };
  const handleUpdateRecord = (record: any, type: string) => {
    setOperationType(type);
    setCurrentRow(record);
    handleModalVisible(true);
    formRef?.current?.resetFields();
  };

  const handleRemove = async (userId: number) => {
    const hide = message.loading('正在删除...');
    const res = await removeRule({ id: userId });
    hide();
    if (res.code === 0) {
      message.success('删除成功,正在刷新!');
      actionRef?.current?.reloadAndRest?.();
    }
  };

  const handleSendRecord = async (id: number) => {
    const hide = message.loading('正在删除...');
    const res = await sendRule({ id: id });
    hide();
    if (res.code === 0) {
      message.success('发送成功,正在刷新!');
      actionRef?.current?.reloadAndRest?.();
    }
  };

  const columns: ProColumns<any>[] = [
    {
      title: '内容',
      dataIndex: 'content',
      width: 100,
      fixed: 'left',
      tooltip: '点击可查看详情',
      render: (dom, entity) => {
        return (
          <div
            className={style.link}
            onClick={() => {
              setCurrentRow(entity);
              setShowDetail(true);
            }}
          >
            {removeHtmlTag(entity.content)}
          </div>
        );
      },
    },
    {
      title: '发送时间',
      dataIndex: 'send_time',
      width: 130,
      hideInSearch: true,
    },
    {
      title: '按钮1',
      dataIndex: 'btn1',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '按钮1链接',
      dataIndex: 'btn1_url',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '按钮2',
      dataIndex: 'btn2',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '按钮2链接',
      dataIndex: 'btn2_url',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 150,
      hideInSearch: true,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      width: 150,
      hideInSearch: true,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: 160,
      hideInDescriptions: true,
      fixed: 'right',
      render: (_, record: any) => [
        <Popconfirm
          title="确认发送该消息?"
          onConfirm={async () => {
            handleSendRecord(record.id);
          }}
          key="send"
        >
          <a key="send" style={{ color: 'green' }}>
            <SendOutlined />
            发送
          </a>
        </Popconfirm>,
        <a key={'modify'} onClick={() => handleUpdateRecord(record, 'baseInfo')}>
          <EditOutlined />
          修改
        </a>,
        <Popconfirm
          title="确认删除该记录?"
          onConfirm={async () => {
            handleRemove(record.id);
          }}
          key="access"
        >
          <a key="access" style={{ color: 'red' }}>
            <DeleteOutlined />
            删除
          </a>
        </Popconfirm>,
      ],
    },
  ];

  const handleOk = async () => {
    if (operationType === 'baseInfo') {
      if (!currentRow?.content) {
        message.warning('请输入完整信息!');
        return;
      }
    }
    if (operationType === 'resetPassword') {
      if (!currentRow?.newPassword) {
        message.warning('请输入新密码!');
        return;
      }
    }
    if (operationType === 'addNewProject') {
      const hide = message.loading(`正在${currentRow?.id ? '更新' : '新增'}`, 50);
      addRule(currentRow).then((res: any) => {
        hide();
        if (res.code === 0) {
          handleModalVisible(false);
          message.success(`新增成功！`);
          actionRef.current?.reloadAndRest?.();
        }
      });
      return;
    }
    const hide = message.loading(`正在${currentRow?.id ? '更新' : '新增'}`, 50);
    try {
      const res = await addRule(currentRow);
      handleModalVisible(false);
      hide();
      if (res.code === 0) {
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


  const avatarUpload = {
    //数量
    maxCount: 1,
    accept: 'image/*',
    customRequest: (options: any) => {
      const { onSuccess, onError, file } = options;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'image');
      formData.append('path', 'notice');
      // /upload为图片上传的地址，后台只需要一个图片的path
      // name，path，status是组件上传需要的格式需要自己去拼接
      request('/dogAdmin/upload', { method: 'POST', data: formData })
        .then((data: any) => {
          const _response = { name: file.name, status: 'done', path: data.data.fileUrl };
          handleChange(data.data.fileUrl, 'cover')
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
        dateFormatter="string"
        id="accountListIndex"
        toolBarRender={() => [
          <Button
            type="primary"
            key="add"
            onClick={() => handleUpdateRecord({}, 'addNewProject')}
          >
            <PlusOutlined />
            新增
          </Button>,
          <Button
            type="primary"
            key="primary"
            onClick={() => export2Excel('accountListIndex', '风格列表')}
          >
            <TableOutlined />
            导出Excel
          </Button>,
        ]}
        size="small"
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
          x: 1300,
          y: Math.max(470, document?.body?.clientHeight - 460),
        }}
        request={async (params: TableListPagination) => {
          const res: any = await rule({
            ...params,
            pageNum: params.current,
          });
          let data: any = [];
          data = res?.data?.rows;
          return {
            data: data,
            success: true,
            total: res?.data?.count,
          };
        }}
        columns={columns}
      />
      <Modal
        title={titleMap[operationType]}
        visible={createModalVisible}
        onOk={() => handleOk()}
        onCancel={() => handleModalVisible(false)}
        width={800}
      >
        <ProForm formRef={formRef} submitter={false}>
          {operationType === 'baseInfo' ? (
            <>
              <div className='border'>
                <ProFormUploadButton
                  label="封面(非必填)"
                  max={1}
                  name="cover"
                  title="修改封面"
                  fieldProps={avatarUpload}
                />
                <Form.Item label="">
                  {
                    currentRow?.cover ? <Image src={getFileUrl(currentRow?.cover)} width={100} style={{ objectFit: 'contain' }} /> : null
                  }
                  <Input
                    value={getFileUrl(currentRow?.cover)}
                    placeholder='请上传封面或者输入链接'
                    onChange={(e) => handleChange(e.target.value, 'cover')}
                  />
                </Form.Item>
              </div>
              <Form.Item label="公告内容">
                <Input.TextArea
                  value={currentRow?.content}
                  placeholder='请输入公告内容'
                  rows={3}
                  onChange={(e) => handleChange(e.target.value, 'content')}
                />
              </Form.Item>
              <Form.Item label="底部按钮1(非必填)">
                <Input
                  value={currentRow?.btn1}
                  placeholder='请输入文本内容'
                  onChange={(e) => handleChange(e.target.value, 'btn1')}
                />
              </Form.Item>
              <Form.Item label="底部按钮1的跳转链接(非必填)">
                <Input
                  value={currentRow?.btn1_url}
                  placeholder='请输入跳转链接'
                  onChange={(e) => handleChange(e.target.value, 'btn1_url')}
                />
              </Form.Item>
              <Form.Item label="底部按钮2(非必填)">
                <Input
                  value={currentRow?.btn2}
                  placeholder='请输入文本内容'
                  onChange={(e) => handleChange(e.target.value, 'btn2')}
                />
              </Form.Item>
              <Form.Item label="底部按钮2的跳转链接(非必填)">
                <Input
                  value={currentRow?.btn2_url}
                  placeholder='请输入跳转链接'
                  onChange={(e) => handleChange(e.target.value, 'btn2_url')}
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
          ) : operationType === 'addNewProject' ? (
            <>
              <div className='border'>
                <ProFormUploadButton
                  label="封面(非必填)"
                  max={1}
                  name="cover"
                  title="修改封面"
                  fieldProps={avatarUpload}
                />
                <Form.Item label="">
                  {
                    currentRow?.cover ? <Image src={getFileUrl(currentRow?.cover)} width={100} style={{ objectFit: 'contain' }} /> : null
                  }
                  <Input
                    value={getFileUrl(currentRow?.cover)}
                    placeholder='请上传封面或者输入链接'
                    onChange={(e) => handleChange(e.target.value, 'cover')}
                  />
                </Form.Item>
              </div>
              <Form.Item label="公告内容">
                <Input.TextArea
                  value={currentRow?.content}
                  rows={3}
                  placeholder='请输入公告内容'
                  onChange={(e) => handleChange(e.target.value, 'content')}
                />
              </Form.Item>
              <Form.Item label="底部按钮1(非必填)">
                <Input
                  value={currentRow?.btn1}
                  placeholder='请输入文本内容'
                  onChange={(e) => handleChange(e.target.value, 'btn1')}
                />
              </Form.Item>
              <Form.Item label="底部按钮1的跳转链接(非必填)">
                <Input
                  value={currentRow?.btn1_url}
                  placeholder='请输入跳转链接'
                  onChange={(e) => handleChange(e.target.value, 'btn1_url')}
                />
              </Form.Item>
              <Form.Item label="底部按钮2(非必填)">
                <Input
                  value={currentRow?.btn2}
                  placeholder='请输入文本内容'
                  onChange={(e) => handleChange(e.target.value, 'btn2')}
                />
              </Form.Item>
              <Form.Item label="底部按钮2的跳转链接(非必填)">
                <Input
                  value={currentRow?.btn2_url}
                  placeholder='请输入跳转链接'
                  onChange={(e) => handleChange(e.target.value, 'btn2_url')}
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

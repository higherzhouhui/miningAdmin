import type { ProDescriptionsItemProps } from '@ant-design/pro-descriptions';
import ProDescriptions from '@ant-design/pro-descriptions';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, Drawer, Form, Image, Input, Modal, Popconfirm, Select, Switch, message } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import type { TableListItem, TableListPagination } from './data';
import {
  updateReq,
  listReq,
  removeRule,
  createOrderRequest,
  getCountryList,
  getStyleList,
  getGroupList,
  getLanguageList,
} from './service';
import ProForm, { ProFormUploadButton } from '@ant-design/pro-form';
import style from './style.less';
import { history, request } from 'umi';
import * as XLSX from 'xlsx';
import { PlusCircleOutlined, TableOutlined } from '@ant-design/icons';
import moment from 'moment';
import { getFileUrl } from '@/utils/common';
const TableList: React.FC = () => {
  /** 分布更新窗口的弹窗 */
  const [showDetail, setShowDetail] = useState(false);
  const [currentRow, setCurrentRow] = useState<any>();
  const [total, setTotal] = useState(0);
  const actionRef = useRef<ActionType>();
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  const formRef = useRef<any>();
  const [operationType, setOperationType] = useState('baseInfo');
  const [propsList, setPropsList] = useState([]);
  const [tableColumns, setTableColumns] = useState<any[]>([])
  const [config, setConfig] = useState<any>({})
  const [title, setTitle] = useState('')
  const [randomData, setRandomData] = useState({})
  const titleMap: any = {
    baseInfo: '修改资料',
    resetPassword: '修改密码',
    addNewProject: '添加宠物',
    addNewPropsProject: '添加道具',
  };

  const handleUpdateRecord = async (record: any, type: string) => {
    let data: any = {}
    if (type == 'baseInfo') {
      setTitle('修改资料')
      data = record
    }
    if (type == 'addNew' || type == 'addNewRandom') {
      setTitle('新增主播')
    }
    if (type == 'addNewRandom') {
      const _data: any = randomData
      delete _data.id
      delete _data.createdAt
      data = _data
    }
    setOperationType(type);
    setCurrentRow({ ...data, amount: 1 });
    handleModalVisible(true);
    formRef?.current?.resetFields();
  };
  const routeToChildren = (record: TableListItem) => {
    localStorage.setItem('childrenObj', JSON.stringify({ id: record.id, name: record.nick_name }));
    history.push(`/account/children?id=${record.id}&name=${record.nick_name}`);
  };
  const routeToPetList = (record: TableListItem) => {
    localStorage.setItem('petListObj', JSON.stringify({ uid: record.id, name: record.nick_name }));
    history.push(`/account/petlist?uid=${record.id}&name=${record.nick_name}`);
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



  const columns: ProColumns<any>[] = [
    {
      title: '昵称',
      dataIndex: 'name',
      width: 100,
      fixed: 'left',
      tooltip: '点击可查看该用户详情',
      render: (dom, entity) => {
        return (
          <div
            className={style.link}
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
      title: 'ID',
      dataIndex: 'id',
      width: 90,
    },
    {
      title: '排序',
      dataIndex: 'sort',
      width: 90,
      hideInSearch: true,
    },
    {
      title: '推荐',
      width: 100,
      dataIndex: 'isCommend',
      valueEnum: {
        true: {
          status: 'success',
          text: '是'
        },
        false: {
          status: 'error',
          text: '否'
        }
      }
    },
    {
      title: '首页封面',
      dataIndex: 'home_cover',
      width: 60,
      hideInSearch: true,
      render: (_, record) => {
        return <div><Image width={60} src={getFileUrl(record.home_cover)} /></div>;
      },
    },
    {
      title: '头像',
      dataIndex: 'avatar',
      width: 60,
      hideInSearch: true,
      render: (_, record) => {
        return <div><Image width={60} src={getFileUrl(record.avatar)} /></div>;
      },
    },
    {
      title: '封面',
      hideInSearch: true,
      hideInTable: true,
      render: (_, record) => {
        return <video src={getFileUrl(record.cover)} loop controls width={200} style={{ objectFit: 'contain' }} />
      },
    },
    {
      title: '视频',
      hideInTable: true,
      hideInSearch: true,
      render: (_, record) => {
        return <video src={getFileUrl(record.video)} loop controls width={200} style={{ objectFit: 'contain' }} />
      },
    },
    {
      title: '评分',
      dataIndex: 'star',
      width: 90,
      hideInSearch: true,
    },

    {
      title: '聊天时长',
      dataIndex: 'time',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '群组',
      dataIndex: 'channel',
      width: 120,
      hideInSearch: true,
      render: (_, record) => {
        return <a href={record.channel} target='_blank' rel="noreferrer">{record.channel}</a>;
      },
    },
    {
      title: '群组人数',
      dataIndex: 'fens',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '回头客',
      width: 100,
      dataIndex: 'return',
      hideInSearch: true,
    },
    {
      title: '点赞数',
      width: 100,
      dataIndex: 'heart',
      hideInSearch: true,
    },
    {
      title: '评论',
      width: 100,
      dataIndex: 'comments',
      hideInSearch: true,
    },
    {
      title: '注册时间',
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
      width: 120,
      hideInDescriptions: true,
      fixed: 'right',
      render: (_, record: any) => [
        <a key={'modify'} onClick={() => handleUpdateRecord(record, 'baseInfo')}>
          修改
        </a>,
        <Popconfirm
          title="确认删除?"
          onConfirm={async () => {
            handleRemove(record.id);
          }}
          key="access"
        >
          <a key="access" style={{ color: 'red' }}>
            删除
          </a>
        </Popconfirm>,
      ],
    },
  ];

  const initConfig = async () => {
    const resAll = await Promise.all([
      getCountryList(),
      getLanguageList(),
      getStyleList(),
      getGroupList(),
    ])
    const obj: any = {
      country: resAll[0].data.rows,
      language: resAll[1].data.rows,
      style: resAll[2].data.rows,
      group: resAll[3].data.rows,
    }
    Object.keys(obj).map((key: string) => {
      let title = ''
      if (key == 'country') {
        title = '国家'
      } else if (key == 'language') {
        title = '语言'
      } else if (key == 'style') {
        title = '风格'
      } else if (key == 'group') {
        title = '群组分类'
      }
      const column = {
        title: title,
        width: 120,
        dataIndex: key,
        valueEnum: {},
      }
      const valueEnum: any = {}
      obj[key].map((cItem: any) => {
        valueEnum[cItem.code] = {
          text: cItem.zh
        }
      })
      column.valueEnum = valueEnum
      columns.unshift(column)
    })
    setConfig(obj)
    setTableColumns(columns)
  }

  useEffect(() => {
    initConfig()
  }, [])
  const handleOk = async () => {
    if (operationType === 'baseInfo' || operationType === 'addNew' || operationType === 'addNewRandom') {
      if (!currentRow?.name || !currentRow?.group || !currentRow?.style || !currentRow?.language || !currentRow?.country || !currentRow?.avatar || !currentRow?.cover || !currentRow?.video || !currentRow?.star) {
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
      createOrderRequest({ uid: currentRow.id, amount: currentRow.amount }).then((res: any) => {
        hide();
        if (res.code === 0) {
          handleModalVisible(false);
          message.success(`添加成功`);
          actionRef.current?.reloadAndRest?.();
        }
      });
      return;
    }
    const hide = message.loading(`正在${currentRow?.id ? '更新' : '新增'}`, 50);
    try {
      const res = await updateReq(currentRow);
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
      formData.append('path', 'avatar');
      // /upload为图片上传的地址，后台只需要一个图片的path
      // name，path，status是组件上传需要的格式需要自己去拼接
      request('/dogAdmin/upload', { method: 'POST', data: formData })
        .then((data: any) => {
          const _response = { name: file.name, status: 'done', path: data.data.fileUrl };
          handleChange(data.data.fileUrl, 'avatar')
          //请求成功后把file赋值上去
          onSuccess(_response, file);
        })
        .catch(onError);
    },
  };

  const coverUpload = {
    //数量
    maxCount: 1,
    accept: 'video/*',
    customRequest: (options: any) => {
      const { onSuccess, onError, file } = options;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'video');
      formData.append('path', 'cover');
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

  const videoUpload = {
    //数量
    maxCount: 1,
    accept: 'video/*',
    customRequest: (options: any) => {
      const { onSuccess, onError, file } = options;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'video');
      formData.append('path', 'anchor');
      // /upload为图片上传的地址，后台只需要一个图片的path
      // name，path，status是组件上传需要的格式需要自己去拼接
      request('/dogAdmin/upload', { method: 'POST', data: formData })
        .then((data: any) => {
          const _response = { name: file.name, status: 'done', path: data.data.fileUrl };
          handleChange(data.data.fileUrl, 'video')
          handleChange(data.data.home_cover, 'home_cover')
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
            type="link"
            key="add"
            onClick={() => handleUpdateRecord({}, 'addNew')}
          >
            <PlusCircleOutlined />
            新增
          </Button>,
          <Button
            type="primary"
            key="addRandom"
            onClick={() => handleUpdateRecord({}, 'addNewRandom')}
          >
            <PlusCircleOutlined />
            新增（初始化随机数据）
          </Button>,
          <Button
            type="primary"
            key="primary"
            onClick={() => export2Excel('accountListIndex', '主播列表')}
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
          x: 1800,
          y: Math.max(470, document?.body?.clientHeight - 460),
        }}
        request={async (params: TableListPagination) => {
          const res: any = await listReq({ ...params, pageNum: params.current });
          let data: any = [];
          data = res?.data?.rows;
          setTotal(res?.data?.count);
          setRandomData(res?.data?.rows[0])
          return {
            data: data,
            success: true,
            total: res?.data?.count,
          };
        }}
        columns={tableColumns}
      />
      <Modal
        title={`${title}`}
        visible={createModalVisible}
        onOk={() => handleOk()}
        onCancel={() => handleModalVisible(false)}
        width={600}
      >
        <ProForm formRef={formRef} submitter={false} className='customTable'>
          {operationType === 'baseInfo' || operationType == 'addNew' || operationType == 'addNewRandom' ? (
            <>
              <Form.Item label="是否推荐">
                <Switch checked={currentRow?.isCommend} onChange={(value) => handleChange(value, 'isCommend')} />
              </Form.Item>
              <Form.Item label="排序(从大到小)">
                <Input
                  value={currentRow?.sort}
                  placeholder='请输入昵称'
                  type='number'
                  onChange={(e) => handleChange(e.target.value, 'sort')}
                />
              </Form.Item>
              <Form.Item label="昵称">
                <Input
                  value={currentRow?.name}
                  placeholder='请输入昵称'
                  onChange={(e) => handleChange(e.target.value, 'name')}
                />
              </Form.Item>
              <Form.Item label="群组分类">
                <Select
                  value={currentRow?.group}
                  placeholder="请选择"
                  onChange={(e) => handleChange(e, 'group')}
                >
                  {config?.group?.map((item: any) => {
                    return (
                      <Select.Option
                        value={item.code}
                        key={item.id}
                      >{item.zh}</Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>

              <Form.Item label="风格">
                <Select
                  value={currentRow?.style}
                  placeholder="请选择"
                  onChange={(e) => handleChange(e, 'style')}
                >
                  {config?.style?.map((item: any) => {
                    return (
                      <Select.Option
                        value={item.code}
                        key={item.id}
                      >{item.zh}</Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>


              <Form.Item label="语言">
                <Select
                  value={currentRow?.language}
                  placeholder="请选择"
                  onChange={(e) => handleChange(e, 'language')}
                >
                  {config?.language?.map((item: any) => {
                    return (
                      <Select.Option
                        value={item.code}
                        key={item.id}
                      >{item.zh}</Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>

              <Form.Item label="国家">
                <Select
                  value={currentRow?.country}
                  placeholder="请选择"
                  onChange={(e) => handleChange(e, 'country')}
                >
                  {config?.country?.map((item: any) => {
                    return (
                      <Select.Option
                        value={item.code}
                        key={item.id}
                      >{item.zh}</Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>
              <div className='border'>
                <ProFormUploadButton
                  label="头像"
                  max={1}
                  name="avatar"
                  title="修改头像"
                  fieldProps={avatarUpload}
                />
                <Form.Item label="">
                  {
                    currentRow?.avatar ? <Image src={getFileUrl(currentRow?.avatar)} width={100} style={{ objectFit: 'contain' }} /> : null
                  }
                  <Input
                    value={getFileUrl(currentRow?.avatar)}
                    placeholder='请上传头像或者输入链接'
                    onChange={(e) => handleChange(e.target.value, 'avatar')}
                  />
                </Form.Item>
              </div>

              <div className='border'>
                <ProFormUploadButton
                  label="封面"
                  max={1}
                  name="cover"
                  title="修改封面"
                  fieldProps={coverUpload}
                />
                <Form.Item label="">
                  {
                    currentRow?.cover ? <video src={getFileUrl(currentRow?.cover)} width={150} style={{ objectFit: 'contain' }} controls /> : null
                  }
                  <Input
                    value={getFileUrl(currentRow?.cover)}
                    placeholder='请上传或者输入链接'
                    onChange={(e) => handleChange(e.target.value, 'cover')}
                  />
                </Form.Item>
              </div>

              <div className='border'>
                <ProFormUploadButton
                  label="视频"
                  max={1}
                  name="video"
                  title="修改视频"
                  fieldProps={videoUpload}
                />
                <Form.Item label="">
                  {
                    currentRow?.video ? <video src={getFileUrl(currentRow?.video)} width={150} style={{ objectFit: 'contain' }} controls /> : null
                  }
                  <Input
                    value={getFileUrl(currentRow?.video)}
                    placeholder='请上传或者输入链接'
                    onChange={(e) => handleChange(e.target.value, 'video')}
                  />
                </Form.Item>
              </div>
              <Form.Item label="评分(5分为满分)">
                <Input
                  value={currentRow?.star}
                  placeholder='请输入评分'
                  max={5}
                  type='number'
                  onChange={(e) => handleChange(e.target.value, 'star')}
                />
              </Form.Item>
              <Form.Item label="聊天时长">
                <Input
                  value={currentRow?.time}
                  placeholder='请输入聊天时长'
                  type='number'
                  onChange={(e) => handleChange(e.target.value, 'time')}
                />
              </Form.Item>
              <Form.Item label="群组链接">
                <Input
                  value={currentRow?.channel}
                  placeholder='请输入群组链接'
                  onChange={(e) => handleChange(e.target.value, 'channel')}
                />
              </Form.Item>
              <Form.Item label="群组人数">
                <Input
                  value={currentRow?.fens}
                  placeholder='请输入群组人数'
                  type='number'
                  onChange={(e) => handleChange(e.target.value, 'fens')}
                />
              </Form.Item>
              <Form.Item label="回头客">
                <Input
                  value={currentRow?.return}
                  type='number'
                  placeholder='请输入回头客'
                  onChange={(e) => handleChange(e.target.value, 'return')}
                />
              </Form.Item>
              <Form.Item label="点赞数">
                <Input
                  value={currentRow?.heart}
                  type='number'
                  placeholder='请输入点赞数量'
                  onChange={(e) => handleChange(e.target.value, 'heart')}
                />
              </Form.Item>
              <Form.Item label="评论数">
                <Input
                  type='number'
                  placeholder='请输入评论数'
                  value={currentRow?.comments}
                  onChange={(e) => handleChange(e.target.value, 'comments')}
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
              <Form.Item label="昵称">
                <Input value={currentRow?.nick_name} readOnly />
              </Form.Item>
              <Form.Item label="数量">
                <Input
                  value={currentRow?.amount}
                  type="number"
                  onChange={(e) => handleChange(e.target.value, 'amount')}
                />
              </Form.Item>
            </>
          ) : operationType === 'addNewPropsProject' ? (
            <>
              <Form.Item label="昵称">
                <Input value={currentRow?.nick_name} readOnly />
              </Form.Item>
              <Form.Item label="关联道具">
                <Select
                  value={currentRow?.props_id}
                  placeholder="请选择"
                  onChange={(e) => handleChange(e, 'props_id')}
                >
                  {propsList.map((item: any) => {
                    return (
                      <Select.Option
                        value={item.id}
                        key={item.id}
                      >{`${item.name}——${item.usdt}U`}</Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>
              <Form.Item label="数量">
                <Input
                  value={currentRow?.amount}
                  type="number"
                  onChange={(e) => handleChange(e.target.value, 'amount')}
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


function judgeIsCheckIn(time: any) {
  let flag = false
  try {
    if (time) {
      if (time == moment().utc().format('MM-DD')) {
        return true
      }
    }
  } catch (error) {
    console.error(error)
    flag = false
  }
  return flag
}

export default TableList;

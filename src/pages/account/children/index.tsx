import type { ProDescriptionsItemProps } from '@ant-design/pro-descriptions';
import ProDescriptions from '@ant-design/pro-descriptions';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, Drawer, Form, Image, Input, Modal, Select, Tag, message } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import type { TableListItem, TableListPagination } from './data';
import { addRule, createOrderRequest, getPartnerProject, removeRule, rule } from './service';
import ProForm from '@ant-design/pro-form';
import style from './style.less'
import { history, useLocation } from 'umi';
import { isArray } from 'lodash';
import Popconfirm from 'antd/es/popconfirm';
import { DeleteOutlined, EditOutlined, FormOutlined, PlusOutlined } from '@ant-design/icons';

const TableList: React.FC = () => {
  /** 分布更新窗口的弹窗 */
  const [showDetail, setShowDetail] = useState(false)
  const [currentRow, setCurrentRow] = useState<any>()
  const [total, setTotal] = useState(0)
  const actionRef = useRef<ActionType>();
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  const formRef = useRef<any>()
  const location = useLocation()
  const [userId, setUserId] = useState([''])
  const [userName, setUserName] = useState([''])
  const [operationType, setOperationType] = useState('baseInfo');
  const [partnerList, setPartnerList] = useState([])
  const [projectId, setprojectId] = useState('')
  const titleMap = {
    baseInfo: '修改基本资料',
    resetPassword: '修改密码',
    addNewProject: '添加项目',
  };
  const handleUpdateRecord = (record: TableListItem, type: string) => {
    setOperationType(type);
    setCurrentRow(record);
    handleModalVisible(true);
    formRef?.current?.resetFields();
  };
  const getUserId = () => {
    let id = (location as any).query.userId
    let name = (location as any).query.name
    if (id && name) {
      if (typeof id === 'string') {
        setUserId([id])
        setUserName([name])
      } else if (isArray(id)) {
        setUserId(id)
        setUserName(name)
      }
    } else {
      const obj = JSON.parse(localStorage.getItem('childrenObj') || '{}')
      id = obj.userId
      name = obj.name
      setUserId([id])
      setUserName([name])
    }

    actionRef.current?.reloadAndRest?.();
  }

  const handleRemove = async (myuserId: number) => {
    const hide = message.loading('正在删除...');
    const res = await removeRule({ id: myuserId });
    hide();
    if (res.code === 200) {
      message.success('删除成功,正在刷新!');
      actionRef?.current?.reloadAndRest?.();
    }
  };

  useEffect(() => {
    getUserId()
    getPartnerProject().then(res => {
      if (res.code === 200) {
        const list = res.data.filter((item: any) => {
          return item.price !== 0
        })
        setPartnerList(list)
      }
    })
  }, [])

  const handleNextLevel = (record: any) => {
    const users = [...userId]
    const names = [...userName]
    users.push(record.userId)
    names.push(record.name)
    setUserId(users)
    setUserName(names)
    setTimeout(() => {
      actionRef?.current?.reloadAndRest?.();
    }, 100)
  }

  const handlePreLevel = () => {
    userId.pop()
    userName.pop()
    setUserId([...userId])
    setUserName([...userName])
    setTimeout(() => {
      actionRef?.current?.reloadAndRest?.();
    }, 100)
  }

  const routeToChildren = (id: string, name: string, type?: number) => {
    if (type === userId.length - 1) {
      return
    }
    if (type || type === 0) {
      const ids = userId.splice(0, type + 1)
      let path = location.pathname
      if (ids.length > 1) {
        ids.forEach((item, index) => {
          if (index === 0) {
            path += `?userId=${item}&name=${userName[index]}`
          } else {
            path += `&userId=${item}&name=${userName[index]}`
          }
        })
      } else {
        path += `?userId=${ids[0]}&name=${userName[0]}`
      }
      history.push(path)
      return
    } else {
      history.push(`${location.pathname}${location.search}&userId=${id}&name=${name}`)
    }
  }

  const columns: ProColumns<any>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      tip: '点击可查看下级会员',
      width: 180,
      hideInSearch: true,
      hideInTable: true,
    },
    {
      title: '手机号',
      dataIndex: 'mobilePhone',
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
      title: '姓名',
      dataIndex: 'name',
      width: 80,
    },
    {
      title: '头像',
      dataIndex: 'avatar',
      width: 110,
      hideInSearch: true,
      hideInTable: true,
      render: (_, record) => {
        return (
          <Image
            src={record.avatar || '/logo.png'}
            width={90}
            height={90}
            style={{ objectFit: 'contain' }}
          />
        );
      },
    },
    {
      title: '是否实名认证',
      dataIndex: 'authenticated',
      hideInSearch: true,
      width: 120,
      render: (_, record) => {
        return (
          <>
            {record.authenticated ? (
              <Tag color="#87d068">已实名</Tag>
            ) : (
              <Tag color="#f50">未实名</Tag>
            )}
          </>
        );
      },
    },
    {
      title: '下级会员',
      dataIndex: 'totalChildren',
      width: 90,
      tooltip: '点击可查看下级会员',
      hideInSearch: true,
      render: (_, record) => {
        return (
          <div className={style.link} onClick={() => handleNextLevel(record)}>
            {record.inviteNum}
          </div>
        );
      },
    },
    {
      title: '身份证号',
      dataIndex: 'idCard',
      width: 160,
    },
    {
      title: '邀请码',
      dataIndex: 'inviteCode',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '推荐人手机号',
      dataIndex: 'referrerMobilePhone',
      width: 110,
      hideInSearch: true,
    },
    {
      title: '推荐人邀请码',
      dataIndex: 'referrerInviteCode',
      width: 110,
      hideInSearch: true,
    },
    {
      title: '注册类型',
      dataIndex: 'registerType',
      width: 100,
      hideInSearch: true,
      render: (_, record) => {
        return (
          <>
            {record.registerType == 1 ? (
              <Tag color="warning">APP注册</Tag>
            ) : (
              <Tag color="success">链接注册</Tag>
            )}
          </>
        );
      },
    },
    {
      title: '会员级别',
      dataIndex: 'userLevel',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '今日是否签到',
      dataIndex: 'signInStatus',
      width: 100,
      hideInSearch: true,
      render: (_, record) => {
        return (
          <>
            {record.signInStatus ? (
              <Tag color="#87d068">已签到</Tag>
            ) : (
              <Tag color="#f50">未签到</Tag>
            )}
          </>
        );
      },
    },
    {
      title: '注册时间',
      dataIndex: 'createTime',
      width: 150,
      hideInSearch: true,
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      width: 150,
      hideInSearch: true,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: 220,
      hideInDescriptions: true,
      fixed: 'right',
      render: (_, record) => [
        <a
          style={{ color: '#4423da' }}
          key="baseInfo"
          onClick={() => handleUpdateRecord(record, 'baseInfo')}
        >
          <FormOutlined />
          资料
        </a>,
        <a
          style={{ color: '#13e436' }}
          key="resetPassword"
          onClick={() => handleUpdateRecord(record, 'resetPassword')}
        >
          <EditOutlined />
          密码
        </a>,
        <a
          style={{ color: '#cf2960' }}
          key="addProject"
          onClick={() => handleUpdateRecord(record, 'addNewProject')}
        >
          <PlusOutlined />
          添加项目
        </a>,
        <Popconfirm
          title="确认删除该会员?"
          onConfirm={async () => {
            handleRemove(record.userId);
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
    let param: any = {
      id: currentRow?.userId,
    };
    if (operationType === 'baseInfo') {
      if (!currentRow?.name || !currentRow?.idCard || !currentRow?.mobilePhone) {
        message.warning('请输入完整信息!');
        return;
      }
      param = {
        ...param,
        name: currentRow?.name,
        idCard: currentRow?.idCard,
        mobilePhone: currentRow?.mobilePhone,
        referrerInviteCode: currentRow?.referrerInviteCode,
      };
    }
    if (operationType === 'resetPassword') {
      if (!currentRow?.newPassword) {
        message.warning('请输入新密码!');
        return;
      }
      param = {
        ...param,
        newPassword: currentRow?.newPassword,
      };
    }
    if (operationType === 'addNewProject') {
      const hide = message.loading(`正在${currentRow?.id ? '更新' : '新增'}`, 50);
      createOrderRequest({id: projectId, phone: currentRow?.mobilePhone}).then((res: any) => {
        hide()
        if (res.code === 200) {
          handleModalVisible(false);
          message.success(`给用户${currentRow?.mobilePhone}用户添加项目成功`);
          actionRef.current?.reloadAndRest?.();
          
        }
      })
      return
    }
    const hide = message.loading(`正在${currentRow?.id ? '更新' : '新增'}`, 50);
    try {
      const res = await addRule(param);
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
    const newRow = Object.assign({}, currentRow)
    newRow[attar] = value
    setCurrentRow(newRow)
  }

  const element = <div>
    {
      userId.map((item, index) => {
        return <><span key={item} className={style.link}>{userName[index] || userId[index]}</span><span>{userId.length - 1 === index ? `的下一级会员:${total}` : '—>'}</span></>
      })
    }
  </div>

  return (
    <PageContainer subTitle={<div className={style.link} onClick={() => history.push('/account/list')}>返回会员列表</div>}>
      <ProTable<TableListItem, TableListPagination>
        actionRef={actionRef}
        rowKey="mobilePhone"
        dateFormatter="string"
        headerTitle={element}
        search={false}
        pagination={false}
        size='small'
        scroll={{
          x: 2100,
          y: Math.max(400, document?.body?.clientHeight - 350),
        }}
        request={async (params: TableListPagination) => {
          const res: any = await rule({...params, pageNum: params.current, userId: userId[userId.length - 1]});
          let data: any = []
          data = res?.data
          setTotal(res?.data?.length)
          return {
            data: data,
            page: res?.data?.pageNum,
            success: true,
            total: res?.data?.totalSize,
          };
        }}
        columns={columns}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            size='small'
            style={{display: userId.length > 1 ? 'block' : 'none'}}
            onClick={() => handlePreLevel()}
          >
            返回上一级
          </Button>,
        ]}
      />
      <Modal
        title={titleMap[operationType]}
        visible={createModalVisible}
        onOk={() => handleOk()}
        onCancel={() => handleModalVisible(false)}
        width={500}
      >
        <ProForm formRef={formRef} submitter={false}>
          {operationType === 'baseInfo' ? (
            <>
              <Form.Item label="手机号码">
                <Input
                  value={currentRow?.mobilePhone}
                  onChange={(e) => handleChange(e.target.value, 'mobilePhone')}
                />
              </Form.Item>
              <Form.Item label="姓名">
                <Input
                  value={currentRow?.name}
                  onChange={(e) => handleChange(e.target.value, 'name')}
                />
              </Form.Item>
              <Form.Item label="身份证号">
                <Input
                  value={currentRow?.idCard}
                  onChange={(e) => handleChange(e.target.value, 'idCard')}
                />
              </Form.Item>
              <Form.Item label="上级推荐码">
                <Input
                  value={currentRow?.referrerInviteCode}
                  onChange={(e) => handleChange(e.target.value, 'referrerInviteCode')}
                  placeholder='请输入上级推荐码'
                />
              </Form.Item>
            </>
          ) : operationType === 'resetPassword' ? (
            <>
              <Form.Item label="新密码">
                <Input
                  value={currentRow?.newPassword}
                  onChange={(e) => handleChange(e.target.value, 'newPassword')}
                  placeholder='请输入新密码'
                />
              </Form.Item>
            </>
          ) : operationType === 'addNewProject' ? (
            <>
              <Form.Item label="手机号">
                <Input
                  value={currentRow?.mobilePhone}
                  readOnly
                />
              </Form.Item>
              <Form.Item label="项目名">
                <Select value={projectId} onChange={(e) => setprojectId(e)}>
                  {
                    partnerList.map((item: any) => {
                      return <Select.Option key={item.id}>{item.name}</Select.Option>
                    })
                  }
                </Select>
              </Form.Item>
            </>
          ): null}
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
        {currentRow?.mobilePhone && (
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

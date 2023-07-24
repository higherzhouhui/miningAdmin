import { PageContainer } from '@ant-design/pro-layout';
import { Button, Radio, Table } from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { ITongji, TableListItem } from './data';
import { rule } from './service';
import style from './style.less';
import * as XLSX from 'xlsx';
import { RedoOutlined, TableOutlined } from '@ant-design/icons';
import MyChartBox from '@/components/Mychart';

const TableList: React.FC = () => {
  const [day, setDay] = useState(7);
  const [dataSource, setDataSource] = useState<TableListItem | any>({});
  const [loading, setLoading] = useState(1);
  const [tongji, setTongji] = useState<ITongji[]>([
      { title: '今日新增用户', num: 0 },
      { title: '今日销售额', num: 0 },
      { title: '用户总数', num: 0 },
      { title: '消费总用户', num: 0 },
      { title: '出款总额', num: 0 },
      { title: '销售总额', num: 0 },
  ]);
  const [options, setOptions] = useState({})
  const [useroptions, setUserOptions] = useState({})
  const itemRef = useRef<any>();
  const columns = [
    {
      title: '日期',
      dataIndex: 'date',
    },
    {
      title: '人数',
      dataIndex: 'num',
    },
  ];
  const priceColumns = [
    {
      title: '日期',
      dataIndex: 'date',
    },
    {
      title: '金额',
      dataIndex: 'num',
    },
  ];
  const projectNumColumns = [
    {
      title: '日期',
      dataIndex: 'date',
    },
    {
      title: '个数',
      dataIndex: 'num',
    },
  ];
  const config = {
    height: 400,
    xField: 'date',
    yField: 'num',
    xAxis: {
      visible: true,
      position: 'bottom',
      label: {
        style: {
          fontSize: 12,
          fill: '#999',
        },
        formatter: (text: string) => text.replace('2023-', ''), // 使用 formatter 函数自定义刻度文本格式
      },
      line: {
        style: {
          stroke: '#EEE',
          lineWidth: 2,
        },
      },
    },
    point: {
      size: 5,
      shape: 'diamond',
    },
  };

  const getSummaryRow = (data: any[]) => {
    const ctotal = data.reduce((total, current) => {
      return total + Number(current.num);
    }, 0);
    // 自定义表格汇总行的内容
    const totalRow = (
      <Table.Summary fixed>
        <Table.Summary.Row>
          <Table.Summary.Cell index={0}>合计</Table.Summary.Cell>
          <Table.Summary.Cell index={1} className={style.ctotal}>
            {ctotal}
          </Table.Summary.Cell>
        </Table.Summary.Row>
      </Table.Summary>
    );

    return totalRow;
  };
  const userListRow = useMemo(() => getSummaryRow(dataSource?.userList || []), [dataSource]);
  const buyProjectPriceListRow = useMemo(
    () => getSummaryRow(dataSource?.buyProjectPriceList || []),
    [dataSource],
  );
  const buyProjectNumListRow = useMemo(
    () => getSummaryRow(dataSource?.buyProjectNumList || []),
    [dataSource],
  );
  const withdrawPriceListRow = useMemo(
    () => getSummaryRow(dataSource?.withdrawPriceList || []),
    [dataSource],
  );

  const export2Excel = (id: string, name: string) => {
    const exportFileContent = document.getElementById(id)!.cloneNode(true);
    const wb = XLSX.utils.table_to_book(exportFileContent, { sheet: 'sheet1' });
    XLSX.writeFile(wb, `${name}.xlsx`);
  };

  const initData = () => {
    setLoading(1);
    rule({ day: day })
      .then((res: any) => {
        if (res.code === 200) {
          const data = res.data;
          const arr = [
            { title: '今日新增用户', num: data?.todayUserNum },
            { title: '今日销售额', num: data?.todayBuyProjectSumPrice || 0 },
            { title: '用户总数', num: data?.sumUserNum },
            { title: '消费总用户', num: data?.buyProjectNumUser },
            { title: '出款总额', num: data?.withdrawSumPrice },
            { title: '销售总额', num: data?.buyProjectSumPrice },
          ];
          setTongji(arr);
         
          try {
            const allObj: any = {
              xAxis: [],
              legendData: [ '日销售量', '日销售额', '日出款额'],
              yAxis: [[], [], []],
              user: [],
            };
            (data?.userList || []).map((item: any) => {
              item.num = parseInt(item.num);
              allObj.xAxis.push(item.date.replace('2023-', ''))
              allObj.user.push(item.num)
            });
         
            (data?.buyProjectNumList || []).map((item: any) => {
              item.num = parseInt(item.num);
              allObj.yAxis[0].push(item.num)
  
            });
            (data?.buyProjectPriceList || []).map((item: any) => {
              item.num = parseInt(item.num);
              allObj.yAxis[1].push(item.num)
            });
            (data?.withdrawPriceList || []).map((item: any) => {
              item.num = parseInt(item.num);
              allObj.yAxis[2].push(item.num)
            });
            const option2 = {
              tooltip: {
                trigger: 'axis',
                axisPointer: {
                  type: 'cross',
                  crossStyle: {
                    color: '#999'
                  }
                }
              },
              title: {
                text: '',
                left: 'center',
              },
              legend: {
                data: allObj.legendData,
              },
              xAxis: {
                type: 'category',
                data: allObj.xAxis,
              },
              yAxis: {
                type: 'value',
              },
              series: [
                {
                  name: allObj.legendData[0],
                  type: 'bar',
                  data: allObj.yAxis[0],
                  markPoint: {
                    data: [
                      { type: 'max', name: 'Max' },
                      { type: 'min', name: 'Min' },
                    ],
                    label: {
                      color: '#333',
                    },
                  },
                },
                {
                  name: allObj.legendData[1],
                  type: 'bar',
                  data: allObj.yAxis[1],
                  markPoint: {
                    data: [
                      { type: 'max', name: 'Max' },
                      { type: 'min', name: 'Min' },
                    ],
                    label: {
                      color: '#333',
                    },
                  },
                },
                {
                  name: allObj.legendData[2],
                  type: 'bar',
                  data: allObj.yAxis[2],
                  markPoint: {
                    data: [
                      { type: 'max', name: 'Max' },
                      { type: 'min', name: 'Min' },
                    ],
                    label: {
                      color: '#333',
                    },
                  },
                }
              ],
            };
            setOptions(Object.assign({}, option2))
            const option1 = {
              tooltip: {
                trigger: 'axis',
                axisPointer: {
                  type: 'cross',
                  crossStyle: {
                    color: '#999'
                  }
                }
              },
              title: {
                text: '日新增用户',
                left: 'center',
              },
              xAxis: {
                type: 'category',
                data: allObj.xAxis,
              },
              yAxis: {
                type: 'value',
              },
              series: [
                {
                  name: '新增用户',
                  type: 'bar',
                  data: allObj.user,
                  barWidth: allObj.xAxis.length < 8 ? 50 : 'auto',
                  markPoint: {
                    data: [
                      { type: 'max', name: 'Max' },
                      { type: 'min', name: 'Min' },
                    ],
                    label: {
                      color: '#fff',
                    },
                  },
                }
              ],
            };
            setUserOptions(Object.assign({}, option1))

          } catch (error) {
            console.error(error)
          }
          setDataSource(res.data);
        }
        setLoading(0);
      })
      .catch(() => {
        setLoading(0);
      });
  };

  const handleChangeRadio = (e: any) => {
    const value = e.target.value;
    if (value) {
      setDay(value);
    }
  };

  useEffect(() => {
    initData();
  }, [day]);
  return (
    <PageContainer>
      <div className={style.tongji}>
        {tongji.map((item: ITongji) => {
          return (
            <div className={style.item} key={item.title}>
              <div className={style.ttitle}>{item.title}</div>
              <div className={style.num}>{item.num}</div>
            </div>
          );
        })}
      </div>
      <Radio.Group
        defaultValue={7}
        size="large"
        onChange={(e) => handleChangeRadio(e)}
        buttonStyle="solid"
      >
        <Radio.Button value={7}>近一周</Radio.Button>
        <Radio.Button value={15}>近半月</Radio.Button>
        <Radio.Button value={30}>近一个月</Radio.Button>
      </Radio.Group>
      <Button size="large" type="default" onClick={() => initData()}>
        <RedoOutlined /> 刷新
      </Button>
      <div className={style.userChart}>
        <MyChartBox id="homeUserChart" loading={loading} options={useroptions}/>
      </div>
      <div className={style.moneyChart}>
        <MyChartBox id="homeMoneyChart" loading={loading} options={options}/>
      </div>

      {/* <div className={style.main}>
        <div className={style.item} ref={itemRef}>
          <div className={style.topContent}>
            <div className={style.title}>实名会员统计</div>
            <Button size='middle' type='primary' onClick={() => export2Excel('userList', '实名会员统计')}><TableOutlined />导出Excel</Button>
          </div>
          {
            itemRef?.current ? <Line {...config} responsive {...{data: dataSource?.userList, width: itemRef?.current?.clientWidth || 500}} /> : null
          }
          <Table 
            columns={columns} 
            dataSource={dataSource?.userList || []} 
            pagination={false} 
            scroll={{ y: 240 }} 
            loading={loading} 
            rowKey={'date'} 
            bordered 
            id='userList'
            summary={() => (
              userListRow
            )}
            />
        </div>
        <div className={style.item}>
          <div className={style.topContent}>
            <div className={style.title}>购买项目金额统计</div>
            <Button size='middle' type='primary' onClick={() => export2Excel('buyProjectPriceList', '购买项目金额统计')}><TableOutlined />导出Excel</Button>
          </div>
          {
            itemRef?.current ? <Line {...config} smooth {...{data: dataSource?.buyProjectPriceList, width: itemRef?.current?.clientWidth || 500}} /> : null
          }
          <Table 
            columns={priceColumns} 
            dataSource={dataSource?.buyProjectPriceList || []} 
            pagination={false} 
            scroll={{ y: 240 }} 
            loading={loading} 
            rowKey={'date'} 
            bordered 
            id='buyProjectPriceList'
            summary={() => (
              buyProjectPriceListRow
            )}
            />
        </div>
        <div className={style.item}>
          <div className={style.topContent}>
            <div className={style.title}>购买项目数量统计</div>
            <Button size='middle' type='primary' onClick={() => export2Excel('buyProjectNumList', '购买项目数量统计')}><TableOutlined />导出Excel</Button>
          </div>
          {
            itemRef?.current ? <Line {...config} smooth {...{data: dataSource?.buyProjectNumList, width: itemRef?.current?.clientWidth || 500}} /> : null
          }
          <Table 
            columns={projectNumColumns} 
            dataSource={dataSource?.buyProjectNumList || []} 
            pagination={false} 
            scroll={{ y: 240 }} 
            loading={loading} 
            rowKey={'date'} 
            bordered 
            id='buyProjectNumList'
            summary={() => (
              buyProjectNumListRow
            )}
            />
        </div>
        <div className={style.item}>
          <div className={style.topContent}>
            <div className={style.title}>提现金额统计</div>
            <Button size='middle' type='primary' onClick={() => export2Excel('withdrawPriceList', '提现金额统计')}><TableOutlined />导出Excel</Button>
          </div>
          {
            itemRef?.current ? <Line {...config} smooth {...{data: dataSource?.withdrawPriceList, width: itemRef?.current?.clientWidth || 500}} /> : null
          }
          <Table 
            columns={priceColumns} 
            dataSource={dataSource?.withdrawPriceList || []} 
            pagination={false} 
            scroll={{ y: 240 }} 
            loading={loading} 
            rowKey={'date'} 
            bordered 
            id='withdrawPriceList'
            summary={() => (
              withdrawPriceListRow
            )}
            />
        </div>
      </div> */}
    </PageContainer>
  );
};

export default TableList;

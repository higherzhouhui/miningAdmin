import { PageContainer } from '@ant-design/pro-layout';
import { Button, Divider, Radio, Table } from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { ITongji, TableListItem } from './data';
import { rule } from './service';
import style from './style.less';
import { RedoOutlined } from '@ant-design/icons';
import MyChartBox from '@/components/Mychart';

const TableList: React.FC = () => {
  const [day, setDay] = useState(7);
  const [loading, setLoading] = useState(1);
  const [tongji, setTongji] = useState<ITongji[]>([]);
  const [options, setOptions] = useState({})
  const [useroptions, setUserOptions] = useState({})

  const [originData, setData] = useState<any>({})


  const initData = () => {
    setLoading(1);
    rule({ day: day })
      .then((res: any) => {
        if (res.code === 0) {
          const data = res.data;
          const arr = [
            { title: '用户总数', num: data?.totalUser },
            { title: 'TG会员总数', num: data?.totalHuiYuan },
            { title: 'Farming奖励总积分', num: data?.totalFarmScore },
            { title: '游戏奖励总积分', num: data?.totalGameScore },
            { title: '总积分', num: data?.totalScore },
            { title: '今日注册用户', num: data?.todayRegister || 0 },
            { title: '今日签到用户', num: data?.todayCheckIn || 0 },
            { title: '今日游戏总得分', num: data?.todayGameScore || 0 },
            { title: '今日新增总积分', num: data?.todayScore || 0 },
          ];
          setTongji(arr);
          setData(data)
          try {
            const allObj: any = {
              xAxis: [],
              legendData: ['日注册', '日访问'],
              yAxis: [[], [], []],
              user: [],
            };
            (data?.rechargeList || []).map((item: any) => {
              allObj.xAxis.push(item.date.replace('2024-', ''))
              allObj.user.push(item.num)
            });
            (data?.userList || []).map((item: any) => {
              item.num = parseInt(item.num);
              allObj.yAxis[0].push(item.num)
            });
            (data?.visitList || []).map((item: any) => {
              item.num = parseInt(item.num);
              allObj.yAxis[1].push(item.num)
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
                text: '每日充值',
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
                  name: '充值',
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
      {/* <div className={style.tongji}>
        {tongji.map((item: ITongji) => {
          return (
            <div className={style.item} key={item.title}>
              <div className={style.ttitle}>{item.title}</div>
              <div className={style.num}>{item.num}</div>
            </div>
          );
        })}
      </div> */}
      <div className={style.cardList}>
        <div className={style.card}>
          <div className={style.title}>总用户</div>
          <div className={style.label}>
            <div>{originData?.totalUser}</div>
            <div>总会员：{originData?.totalHuiYuan}</div>
            </div>
          <div className={style.divider} />
          <div className={style.today}>
            <span>今日注册</span>
            <span>&nbsp;&nbsp;{originData?.todayRegister}</span>
          </div>
        </div>
        <div className={style.card}>
          <div className={style.title}>总访问量</div>
          <div className={style.label}>{originData?.totalVisit}</div>
          <div className={style.divider} />
          <div className={style.today}>
            <span>今日访问</span>
            <span>&nbsp;&nbsp;{originData?.todayVisit}</span>
          </div>
        </div>
        <div className={style.card}>
          <div className={style.title}>消费Coins</div>
          <div className={style.label}>{Math.abs(originData?.totalUse)}</div>
          <div className={style.divider} />
          <div className={style.today}>
            <span>今日消费</span>
            <span>&nbsp;&nbsp;{originData?.todayUse}</span>
          </div>
        </div>
        <div className={style.card}>
          <div className={style.title}>总Coins</div>
          <div className={style.label}>{originData?.totalScore}</div>
          <div className={style.divider} />
          <div className={style.today}>
            <span>今日新增</span>
            <span>&nbsp;&nbsp;{originData?.todayScore}</span>
          </div>
        </div>
        <div className={style.card}>
          <div className={style.title}>总充值(TON)</div>
          <div className={style.label}>{originData?.totalTon}</div>
          <div className={style.divider} />
          <div className={style.today}>
            <span>今日充值(TON)</span>
            <span>&nbsp;&nbsp;{originData?.todayTon}</span>
          </div>
        </div>
      </div>
      <Radio.Group
        defaultValue={7}
        onChange={(e) => handleChangeRadio(e)}
        buttonStyle="solid"
      >
        <Radio.Button value={7}>本周</Radio.Button>
        <Radio.Button value={30}>本月</Radio.Button>
        <Radio.Button value={90}>近三个月</Radio.Button>
        <Radio.Button value={180}>近六个月</Radio.Button>
      </Radio.Group>
      <Button type="link" onClick={() => initData()}>
        <RedoOutlined /> 刷新
      </Button>
      <div className={style.userChart}>
        <MyChartBox id="homeUserChart" loading={loading} options={useroptions} />
      </div>
      <div className={style.moneyChart}>
        <MyChartBox id="homeMoneyChart" loading={loading} options={options} />
      </div>
    </PageContainer>
  );
};

export default TableList;

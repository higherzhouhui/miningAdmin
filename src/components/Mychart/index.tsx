import * as echarts from 'echarts';
import type { FC} from 'react';
import { memo, useEffect, useRef } from 'react';
import { merge as _merge, cloneDeep as _cloneDeep } from 'lodash';
import styles from './style.less';

interface Iprops {
  id: string;
  options: any;
  loading?: number;
  style?: React.CSSProperties;
}
const baseOptions = {
  grid: {
    containLabel: true,
    left: 20,
    right: 20,
    bottom: 20,
  },
  toolbox: {
    feature: {
      dataView: { show: true, readOnly: false },
      restore: { show: true },
      saveAsImage: { show: true }
    }
  },
  tooltip: {
    transitionDuration: 0, //加上这个可以防止抖动
  },
  xAxis: {
    axisLabel: {
      color: '#2b1111',
    },
    axisTick: {
      lineStyle: {
        color: '#616675',
      },
    },
  },
  yAxis: {
    nameTextStyle: {
      color: '#310f0f',
      fontSize: 14,
    },
    splitLine: {
      lineStyle: {
        type: 'dashed',
        color: '#5e636e',
      },
    },
    axisLabel: {
      color: '#310f0f',
    },
  },
};

const loadingOption = {
  graphic: {
    elements: [
      {
        type: 'group',
        left: 'center',
        top: 'center',
        children: new Array(7).fill(0).map((val, i) => ({
          type: 'rect',
          x: i * 20,
          shape: {
            x: 0,
            y: -40,
            width: 10,
            height: 80,
          },
          style: {
            fill: '#5470c6',
          },
          keyframeAnimation: {
            duration: 1000,
            delay: i * 200,
            loop: true,
            keyframes: [
              {
                percent: 0.5,
                scaleY: 0.3,
                easing: 'cubicIn',
              },
              {
                percent: 1,
                scaleY: 1,
                easing: 'cubicOut',
              },
            ],
          },
        })),
      },
    ],
  },
};

const noDate = {
  graphic: {
    elements: [
      {
        type: 'text',
        left: 'center',
        top: 'center',
        style: {
          text: '暂无数据',
          fontSize: 24,
          lineDash: [0, 200],
          lineDashOffset: 0,
          fill: 'transparent',
          stroke: '#f1d0d0',
          lineWidth: 1,
        },
        keyframeAnimation: {
          duration: 1000,
          loop: false,
          keyframes: [
            {
              percent: 0.7,
              style: {
                fill: 'transparent',
                lineDashOffset: 200,
                lineDash: [200, 0],
              },
            },
            {
              // Stop for a while.
              percent: 0.8,
              style: {
                fill: 'transparent',
              },
            },
            {
              percent: 1,
              style: {
                fill: 'transparent',
              },
            },
          ],
        },
      },
    ],
  },
};

const MyChartBox: FC<Iprops> = memo((props) => {
  const { id = 'chart', options, loading, style } = props;
  const timer = useRef<any>();
  const myEchart = useRef<any>(null);
  const isLoaded = useRef<any>(null);
  const domRef = useRef<any>(null);
  const initializeAndMonitor = () => {
    const dom = domRef?.current;
    if (myEchart.current != null && myEchart.current != "" && myEchart.current != undefined){
      myEchart.current.dispose();
    }
    myEchart.current = echarts.init(dom);
    if (loading) {
      myEchart.current?.setOption(loadingOption);
    } else {
      if (typeof options !== 'object' || !options) {
        timer.current = setTimeout(() => {
          myEchart.current?.setOption(noDate);
          clearTimeout(timer.current);
        }, 200);
      } else {
        myEchart.current?.setOption(_merge(_cloneDeep(baseOptions), options));
      }
    }
    if (!isLoaded.current) {
      isLoaded.current = true;
      const reSizeFn = () => {
        myEchart.current?.resize();
      };
      window.addEventListener('resize', reSizeFn);
      return () => {
        window.removeEventListener('resize', reSizeFn);
      };
    }
    return null
  };

  useEffect(() => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    initializeAndMonitor();
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, [options, loading]);

  return (
      <div ref={domRef} className={`${styles.myChart} ${id}`} {...props} id={id} />
  );
});

MyChartBox.displayName = 'MyChartBox';

export default MyChartBox;

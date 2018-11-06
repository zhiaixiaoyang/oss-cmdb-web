import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-micro-service',
  templateUrl: './micro-service.component.html',
  styleUrls: ['./micro-service.component.scss']
})
export class MicroServiceComponent implements OnInit, OnDestroy {
  timer: any;

  microserviceData: any[];
  chartOptionMicroservice: any;
  updateOptionMicroservice: any;

  httpData: any[];
  chartOptionHttp: any;
  updateOptionHttp: any;

  // 计算随机数用变量
  now = new Date().getTime();
  newData: any;

  constructor() { }

  ngOnInit() {
    // 数据格式参考 this.microserviceData = [ {  value: ['2018-06-28 12:01', 100] } ];
    this.microserviceData = [];
    this.httpData = [];
    // 初始化随机数据
    // this.initRandomDate();
    //  创建面积图
    this.chartOptionMicroservice = this.createChart(this.microserviceData, '近24小时服务调用量（微服务统计 次/分钟）'
      , '#dbeefc', '#55aef0');
    this.chartOptionHttp = this.createChart(this.httpData, '近24小时HTTP入口的访问量（次/分钟）'
      , '#e3f4ee', '#8ed4bc');

    // 定时器1分钟执行一次
    // this.timer = setInterval(() => {
    //   this.newData = this.randomData(new Date(+this.now + 60000));
    //   // 微服务数据
    //   this.microserviceData.shift();
    //   this.microserviceData.push(this.newData);
    //   this.updateOptionMicroservice = {
    //     series: [{
    //       data: this.microserviceData
    //     }]
    //   };
    //   // console.log(this.microserviceData);
    //
    //   // http数据
    //   this.httpData.shift();
    //   this.httpData.push(this.newData);
    //   this.updateOptionHttp = {
    //     series: [{
    //       data: this.httpData
    //     }]
    //   };
    // }, 60000);
  }

  ngOnDestroy() {
    clearInterval(this.timer);
  }
  // 创建面积图
  private createChart(data: any[], title, areaColor, lineColor) {
    return {
      title: {
        text: title,
        textStyle: {
          color: '#404040',
          fontSize: 14,
          fontWeight: 'normal'
        },
        x: 'center'
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params) => {
          params = params[0];
          return params.value[0] + '\n 调用量 : ' + params.value[1];
        },

        axisPointer: {
          lineStyle: { color: '#e6e6e6' },
          animation: false
        }
      },

      xAxis: {
        type: 'time',
        splitLine: {
          show: false
        },
        axisLabel: {
          color: '#404040'
        },
        axisLine: {
          color: '#404040',
          lineStyle: {
            color: '#e6e6e6'
          }
        }
      },
      yAxis: {
        type: 'value',
        boundaryGap: [0, '100%'],
        splitLine: {
          show: false
        },
        axisLabel: {
          color: '#404040'
        },
        axisLine: {

          lineStyle: {
            color: '#e6e6e6'
          }
        }
      },
      series: [{
        name: '服务调用量',
        type: 'line',
        smooth: true,
        areaStyle: {
          normal: {
            color: areaColor
          }
        },
        itemStyle: {
          normal: {
            lineStyle: {
              color: lineColor
            }
          }
        },
        showSymbol: false,
        hoverAnimation: false,
        data: data
      }]
    };
  }
  /**
    * 模拟生成微服务和HTTP随机数据
    */
  randomData(time) {
    const now = time;
    const value = 200 + Math.random() * 100 - 10;
    return {
      value: [
        [now.getFullYear(), this.formatDate(now.getMonth() + 1), this.formatDate(now.getDate())].join('-') +
        ' ' +
        [this.formatDate(now.getHours()), this.formatDate(now.getMinutes())].join(':'),
        Math.round(value)
      ]
    };
  }
  formatDate(time) {
    if (time < 10) {
      return '0' + time;
    } else {
      return time;
    }
  }
  /**
   * 模拟生成微服务和HTTP初始随机数据
   */
  initRandomDate() {
    let timeDifference = 3600000;
    for (let i = 0; i < 60; i++) {
      timeDifference = timeDifference - 60 * 1000;
      const before24 = new Date(this.now - timeDifference);
      // console.log(this.randomData(before24));
      this.microserviceData.push(this.randomData(before24));
      this.httpData.push(this.randomData(before24));
    }
  }
}

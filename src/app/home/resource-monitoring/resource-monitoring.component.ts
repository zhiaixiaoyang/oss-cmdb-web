import { Component, OnInit, OnDestroy } from '@angular/core';
import {HomeService} from '../home.service';
import {ApplicationParamService} from '../../shared';

@Component({
  selector: 'app-resource-monitoring',
  templateUrl: './resource-monitoring.component.html',
  styleUrls: ['./resource-monitoring.component.scss']
})
export class ResourceMonitoringComponent implements OnInit, OnDestroy {
  timer: any;

  resourcemonitoringData: any[];
  chartOptionResourceMonitoring: any;
  updateOptionResourceMonitoring: any;

  httpData: any[];
  chartOptionHttp: any;
  updateOptionHttp: any;
  environment;

  // 计算随机数用变量
  now = new Date().getTime();
  newData: any;
  preStartDate  = Math.round((this.now - 24 * 60 * 60 * 1000) / 1000).toString();
  nowTenEndTime = Math.round(this.now / 1000).toString();
  step = 60 * 5;

  constructor(private homeService: HomeService ,  private applicationParamService: ApplicationParamService) { }

  ngOnInit() {
    // this.resourcemonitoringData = [];
    // this.httpData = [];
    // this.applicationParamService.getParams().then(datas => {
    //   if (datas && datas.monitoring) {
    //     let url = '';
    //     if (datas.monitoring.isRelative) {
    //       url = datas.monitoring.domin;
    //     } else {
    //       url = datas.monitoring.url;
    //     }
    //     this.homeService.getQueryRangeData(url , 'sum' +
    //       '(rate (container_cpu_usage_seconds_total{id="/",kubernetes_io_hostname=~".*"}[5m]))',
    //       this.preStartDate, this.nowTenEndTime , this.step
    //     ).subscribe(respose => {
    //       let values = respose.data.result[0].values;
    //       let valuesLeng =  values.length;
    //       for (let i = 0; i < valuesLeng; i++) {
    //         let timeItem = this.timestampToTime(values[i][0]);
    //         let value = this.numberNum(values[i][1]);
    //         this.resourcemonitoringData.push({
    //           value: [
    //             timeItem,
    //             value
    //           ]
    //         });
    //       }
    //       this.chartOptionResourceMonitoring = this.createChart(this.resourcemonitoringData, '近24小时CPU使用率统计'
    //         , '#dbeefc', '#55aef0');
    //     });
    //
    //     this.homeService.getQueryRangeData(url, 'sum (container_memory_working_set_bytes{id="/",kubernetes_io_hostname=~".*"})' ,
    //       this.preStartDate, this.nowTenEndTime , this.step).subscribe(respose => {
    //       let values = respose.data.result[0].values;
    //       let valuesLeng =  values.length;
    //       for (let i = 0; i < valuesLeng; i++) {
    //         let timeItem = this.timestampToTime(values[i][0]);
    //         let value = this.numberTowNum(values[i][1] , 1024 * 1024 * 1024);
    //         this.httpData.push({
    //           value: [
    //             timeItem,
    //             value
    //           ]
    //         });
    //       }
    //       this.chartOptionHttp = this.createChart(this.httpData, '近24小时内存使用率统计'
    //         , '#e3f4ee', '#8ed4bc');
    //     });
    //   }
    // });
  }

  ngOnDestroy() {
  }

  numberNum (num) {
    return (Math.round(num * 100) / 100.00);
  }

  numberTowNum (num , num2) {
    return (Math.round(num / num2 * 100) / 100.00);
  }

  timestampToTime(timestamp) {
    let date = new Date(timestamp * 1000); // 时间戳为10位需*1000，时间戳为13位的话不需乘1000
    return [date.getFullYear(), this.formatDate(date.getMonth() + 1), this.formatDate(date.getDate())].join('-') +
    ' ' + [this.formatDate(date.getHours()), this.formatDate(date.getMinutes())].join(':');
  }

  formatDate(time) {
    if (time < 10) {
      return '0' + time;
    } else {
      return time;
    }
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
          return params.value[0] + '\n 使用 : ' + params.value[1];
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
}

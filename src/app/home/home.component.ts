import { Component, OnInit } from '@angular/core';
import {ApplicationParamService, UserService} from '../shared';
import { HomeService } from './home.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  // 资源统计数据
  resource = {
    'cpu': null,
    'cpuUsed' : null,
    'ram': null,
    'ramUsed' : null,
    'storage': null,
    'storageUsed' : null
  };
  // 应用服务统计数据
  appService = {
    'node': {
      'total': null,
      'activenum': null,
      'activepersent': null,
      'inactivenum': null,
      'inactivepersent': null

    },
    'cache': {
      'total': null,
      'usednum': null,
      'usedpersent': null,
      'usenum': null,
      'usepersent': null

    },
    'workload': {
      'total': null,
      'usednum': null,
      'usedpersent': null,
      'usenum': null,
      'usepersent': null
    },
    'app': {
      'total': null,
      'usenum': null,
      'usepersent': null,
      'usednum': null,
      'usedpersent': null

    },

    'service': {
      'total': null,
      'healthynum': null,
      'healthypersent': null,
      'unhealthynum': null,
      'unhealthypersent': null

    },

    'pod': {
      'total': null,
      'healthynum': null,
      'healthypersent': null,
      'unhealthynum': null,
      'unhealthypersent': null

    }
  };
  charOptionNode: any;
  chartOptionApp: any;
  chartOptionService: any;
  chartOptionPod: any;
  charOptionCache: any;
  charOptionWorkload: any;
  isAdmin;
  userNameSpace = '';
  userName = '';
  resourcemonitoringData: any[];
  chartOptionResourceMonitoring: any;
  updateOptionResourceMonitoring: any;
  httpData: any[];
  chartOptionHttp: any;
  updateOptionHttp: any;
  environment;
  // environmentTem;

  // 计算随机数用变量
  now = new Date().getTime();
  newData: any;
  preStartDate  = Math.round((this.now - 24 * 60 * 60 * 1000) / 1000).toString();
  nowTenEndTime = Math.round(this.now / 1000).toString();
  step = (60 * 5).toString();


  constructor(private userService: UserService,
              private applicationParamService: ApplicationParamService,
              private homeService: HomeService) {  }

  changeEnvironment(): void {
    if (null != this.environment && '' !== this.environment) {
      // 节点
      this.homeService.getQueryData('query', this.environment, {'query' : 'sum(kube_node_info)'}).subscribe(response => {
        if (null != response.data.result && null != response.data.result[0]) {
          this.appService.node.total = response.data.result[0].value[1] ;
          this.homeService.getQueryData('query', this.environment, {'query' : 'sum' +
            '(kube_node_status_condition{condition="Ready",status="true"})'}).subscribe(resp => {
            if (null != resp.data.result && null != resp.data.result[0]) {
              this.appService.node.activenum = resp.data.result[0].value[1];
            } else {
              this.appService.node.activenum = 0;
            }
            this.appService.node.inactivenum  = this.subtr(this.appService.node.total, this.appService.node.activenum);
            this.appService.node.activepersent = this.percentNum(this.appService.node.activenum , this.appService.node.total);
            this.appService.node.inactivepersent = this.subtr(100, this.appService.node.activepersent);
            this.charOptionNode = this.createChart([
              { name: '健康', value: this.appService.node.activepersent },
              { name: '不健康', value: this.appService.node.inactivepersent }
            ],  this.appService.node.activepersent , '健康', ['#89cd10', '#da1b2e']);
          });
        }
      });

      // 存储
      this.homeService.getQueryData('query', this.environment, {'query' : 'sum' +
        '(container_fs_limit_bytes{device=~"/dev/mapper/docker-root",id="/",' +
        'kubernetes_io_hostname=~".*"} or container_fs_limit_bytes{device=~"/dev/vda1",id="/",' +
        'kubernetes_io_hostname=~".*"})'}).subscribe(response => {
        if (null != response.data.result && null != response.data.result[0]) {
          this.appService.cache.total = this.numberNum(response.data.result[0].value[1] , (1024 * 1024 * 1024));
          this.homeService.getQueryData('query', this.environment, {'query' : 'sum' +
            '(container_fs_usage_bytes{device=~"/dev/mapper/docker-root",id="/",' +
            'kubernetes_io_hostname=~".*"} or container_fs_usage_bytes{device=~"/dev/vda1",id="/",' +
            'kubernetes_io_hostname=~".*"})'}).subscribe(resp => {
            if (null != resp.data.result && null != resp.data.result[0]) {
              this.appService.cache.usednum = this.numberNum(resp.data.result[0].value[1], (1024 * 1024 * 1024));
            } else {
              this.appService.cache.usednum = 0;
            }
            this.appService.cache.usenum  = Number(this.subtr(this.appService.cache.total , this.appService.cache.usednum));
            this.appService.cache.usedpersent = this.percentNum(this.appService.cache.usednum , this.appService.cache.total);
            this.appService.cache.usepersent = this.subtr(100 , this.appService.cache.usedpersent);
            this.charOptionCache = this.createChart([
              { name: '已用', value: this.appService.cache.usedpersent },
              { name: '可用', value: this.appService.cache.usepersent }
            ],  this.appService.cache.usedpersent , '已用', ['#0462b7' , '#7dffdb']);
          });
        }
      });

      // this.homeService.getQuerySimpleData( 'sum' +
      //   '(container_fs_limit_bytes{device=~"/dev/mapper/docker-root",id="/",' +
      //   'kubernetes_io_hostname=~".*"} or container_fs_limit_bytes{device=~"/dev/vda1",id="/",' +
      //   'kubernetes_io_hostname=~".*"})').subscribe(response => {
      //   if (null != response.data.result[0]) {
      //     this.appService.cache.total = this.numberNum(response.data.result[0].value[1] , (1024 * 1024 * 1024));
      //     this.homeService.getQuerySimpleData( 'sum' +
      //       '(container_fs_usage_bytes{device=~"/dev/mapper/docker-root",id="/",' +
      //       'kubernetes_io_hostname=~".*"} or container_fs_usage_bytes{device=~"/dev/vda1",id="/",' +
      //       'kubernetes_io_hostname=~".*"})').subscribe(resp => {
      //       if (null != resp.data.result[0]) {
      //         this.appService.cache.usednum = this.numberNum(resp.data.result[0].value[1], (1024 * 1024 * 1024));
      //       } else {
      //         this.appService.cache.usednum = 0;
      //       }
      //       this.appService.cache.usenum  = Number(this.subtr(this.appService.cache.total , this.appService.cache.usednum));
      //       this.appService.cache.usedpersent = this.percentNum(this.appService.cache.usednum , this.appService.cache.total);
      //       this.appService.cache.usepersent = this.subtr(100 , this.appService.cache.usedpersent);
      //       this.charOptionCache = this.createChart([
      //         { name: '已用', value: this.appService.cache.usedpersent },
      //         { name: '可用', value: this.appService.cache.usepersent }
      //       ],  this.appService.cache.usedpersent , '已用', ['#0462b7' , '#7dffdb']);
      //     });
      //   }
      // });

      // 工作负载
      this.homeService.getQueryData('query', this.environment, {'query' : 'sum(kube_deployment_status_replicas)'}).subscribe(response => {
        if (null != response.data.result && null != response.data.result[0]) {
          this.appService.workload.total = response.data.result[0].value[1] ;
          this.homeService.getQueryData('query', this.environment, {'query' : 'sum(kube_deployment_status_replicas_available)'}).subscribe(resp => {
            if (null != resp.data.result && null != resp.data.result[0]) {
              this.appService.workload.usenum = resp.data.result[0].value[1];
            } else {
              this.appService.workload.usenum = 0;
            }
            this.appService.workload.usednum  = this.subtr(this.appService.workload.total, this.appService.workload.usenum);
            this.appService.workload.usedpersent = this.percentNum(this.appService.workload.usednum , this.appService.workload.total);
            this.appService.workload.usepersent = this.subtr(100, this.appService.workload.usedpersent);
            this.charOptionWorkload = this.createChart([
              { name: '不可用', value: this.appService.workload.usedpersent },
              { name: '可用', value: this.appService.workload.usepersent }
            ],  this.appService.workload.usepersent , '可用', ['#0462b7' , '#7dffdb']);
          });
        }
      });

      // cpu
      this.resourcemonitoringData = [];
      this.homeService.getQueryData('query_range', this.environment, {'query' : 'sum' +
        '(rate (container_cpu_usage_seconds_total{id="/",kubernetes_io_hostname=~".*"}[5m]))',
        'start' : this.preStartDate, 'end' : this.nowTenEndTime , 'step' : this.step}
      ).subscribe(respose => {
        const values = respose.data.result[0].values;
        if (null != respose.data.result && null != respose.data.result[0] && null != values) {
          const valuesLeng =  values.length;
          for (let i = 0; i < valuesLeng; i++) {
            const timeItem = this.timestampToTime(values[i][0]);
            const value = this.numberNum(values[i][1], 1);
            this.resourcemonitoringData.push({
              value: [
                timeItem,
                value
              ]
            });
          }
        }
        this.chartOptionResourceMonitoring = this.createLineChart(this.resourcemonitoringData, '近24小时CPU使用情况'
          , '#dbeefc', '#55aef0', '核');
      });

      // 内存
      this.httpData = [];
      this.homeService.getQueryData('query_range', this.environment,
        {'query' : 'sum' + '(container_memory_working_set_bytes{id="/",kubernetes_io_hostname=~".*"})',
          start : this.preStartDate, end : this.nowTenEndTime , step : this.step }).subscribe(respose => {
        const values = respose.data.result[0].values;
        if (null != respose.data.result && null != respose.data.result[0] && null != values) {
          const valuesLeng =  values.length;
          for (let i = 0; i < valuesLeng; i++) {
            const timeItem = this.timestampToTime(values[i][0]);
            const value = this.numberTowNum(values[i][1] , 1024 * 1024 * 1024);
            this.httpData.push({
              value: [
                timeItem,
                value
              ]
            });
          }
        }
        this.chartOptionHttp = this.createLineChart(this.httpData, '近24小时内存使用情况'
          , '#e3f4ee', '#8ed4bc', 'Gi');
      });
    }
  }

  numberTowNum (num , num2) {
    return (Math.round(num / num2 * 100) / 100.00);
  }

  timestampToTime(timestamp) {
    const date = new Date(timestamp * 1000); // 时间戳为10位需*1000，时间戳为13位的话不需乘1000
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

  accMul(arg1, arg2): Number {
    let m = 0;
    const s1 = arg1.toString();
    const s2 = arg2.toString();
    if (s1.indexOf('.') >= 0) {
      m += s1.split('.')[1].length;
    }
    if (s2.indexOf('.') >= 0) {
      m += s2.split('.')[1].length;
    }
    return Number(s1.replace('.', '')) * Number(s2.replace('.', '')) / Math.pow(10, m);
  }

  accDiv(arg1, arg2): Number {
    let t1 = 0, t2 = 0, r1, r2;
    if (arg1.toString().indexOf('.') >= 0) {
      t1 = arg1.toString().split('.')[1].length;
    }
    if (arg2.toString().indexOf('.') >= 0) {
      t2 = arg2.toString().split('.')[1].length;
    }
    r1 = Number(arg1.toString().replace('.', ''));
    r2 = Number(arg2.toString().replace('.', ''));
    return (r1 / r2) * Math.pow(10, t2 - t1);
  }

  percentNum (num , num2) {
    return (Math.round(num / num2 * 10000) / 100.00);
  }

  numberNum (num , num2) {
    return (Math.round(num / num2 * 100) / 100.00);
  }

  subtr(arg1, arg2) {
    let r1 = 0, r2 = 0, m, n;
    if (arg1.toString().indexOf('.') >= 0) {
      r1 = arg1.toString().split('.')[1].length;
    }
    if (arg2.toString().indexOf('.') >= 0) {
      r2 = arg2.toString().split('.')[1].length;
    }
    m = Math.pow(10, Math.max(r1, r2));
    n = (r1 >= r2) ? r1 : r2;
    return ((arg1 * m - arg2 * m) / m).toFixed(n);
  }

  ngOnInit() {
    this.isAdmin = this.userService.isAdmin();
    this.userName = this.userService.getUserInfo().userName;
  }

  // 环形图
  private createChart(data: any[], healthypersent , text , colors) {
    return {
      backgroundColor: '#fff',
      title: {
        text: healthypersent + '%',
        subtext: text,
        left: 'center',
        top: '26%',
        fontFamily: 'Microsoft YaHei',
        textStyle: {
          color: '#999999',
          fontSize: 16,
          align: 'center',
          lineHeight: 24,
          fontWeight: 'normal'
        },
        subtextStyle: {
          color: '#999999',
          fontSize: 12,
          align: 'center'
        }
      },
      tooltip: {
        show: false,
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      color: colors,
      series: [
        {
          name: '',
          type: 'pie',
          radius: ['83%', '100%'],
          avoidLabelOverlap: false,
          hoverAnimation: false,
          labelLine: {
            normal: {
              show: false
            }
          },
          itemStyle: {
            borderWidth: 2, // 设置border的宽度有多大
            borderColor: '#fff',
          },
          data: data
        }
      ]
    };
  }

  // 创建面积图
  private createLineChart(data: any[], title, areaColor, lineColor, unit) {
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
          color: '#404040',
          formatter: '{value} ' + unit
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

import {Component, OnChanges, OnInit, ViewChild} from '@angular/core';
import {BuildManagementService} from '../build-management.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-apply-build-history',
  templateUrl: './build-history.component.html',
  styleUrls: ['./build-history.component.css']
})

export class BuildHistoryComponent implements OnInit, OnChanges {
  constructor(private buildManagementService: BuildManagementService,
              private activatedRoute: ActivatedRoute,
              private router: Router) {
  }

  data = [];
  loading = false;
  id;
  stage = {
    'id': '10',
    'name': 'build',
    'execNode': '',
    'status': 'NIL',
    'startTimeMillis': 0,
    'durationMillis': 0,
    'pauseDurationMillis': 0,
    'type': null
  }; // 未运行stage节点
  noData = [];
  stageTime = []; // 每个节点平均时间
  timePercent = []; // 百分比

  // 获得pipeline数据
  getBuildData(id) {
    this.loading = true;
    this.buildManagementService.getHistoryById(id).subscribe(data => {
      this.loading = false;
      let dataKey = [], dataValue = [];
      const dataInit = [];
      // 处理后台数据
      for (let property in data) {
        dataValue.push(data[property]);
        dataKey.push(property);
      }
      for (let i = 0; i < dataKey.length; i++) {
        let stringLength = dataKey[i].split('#')[dataKey[i].split('#').length - 1].toString().length;
        dataKey[i] = dataKey[i].toString().slice(0, dataKey[i].toString().length - stringLength - 1);
        if (dataValue[i].Stages.length > 0) {
          dataInit.push({'name': dataKey[i], 'content': dataValue[i]});
        }
      }
      // 时间处理
      Date.prototype.toDateString = function () {
        return this.getHours() + ':' + this.getMinutes();
      };
      const timeTotal = [];
      for (let i = 0; i < dataInit.length; i++) {
        this.noData[i] = 1;
        let totalAverage = 0;
        // 每次执行的时间
        if (dataInit[i].content.History) {
          if (dataInit[i].content.History.length > 0) {
            for (let m = 0; m < dataInit[i].content.History.length; m++) {
              // 为执行历史不够长的stage填充数据
              if (dataInit[i].content.History[m].stages.length < dataInit[i].content.Stages.length) {
                const lackNumber = dataInit[i].content.Stages.length - dataInit[i].content.History[m].stages.length;
                for (let j = 0; j < lackNumber; j++) {
                  dataInit[i].content.History[m].stages.push(this.stage);
                }
              }
              // 每条记录节点时间处理
              const date = new Date(dataInit[i].content.History[m].startTimeMillis);
              dataInit[i].content.History[m].startTimeMillis = date.toString().slice(3, 10);
              dataInit[i].content.History[m]['startTimeMillis2'] = date.toDateString();
              timeTotal[m] = 0;  // 总的时间
              for (let j = 0; j < dataInit[i].content.History[m].stages.length; j++) {
                timeTotal[m] += dataInit[i].content.History[m].stages[j].durationMillis;
                // 每个节点的时间赤露
              }
              totalAverage += timeTotal[m];
            }
            // 总平均时间
            let timeAverage = 0;
            timeAverage = totalAverage / dataInit[i].content.History.length;
            const stageTotal = [];   // 每个节点的平均时间
            for (let m = 0; m < dataInit[i].content.Stages.length; m++) {
              stageTotal[m] = 0;
              this.stageTime[m] = 0;
              for (let j = 0; j < dataInit[i].content.History.length; j++) {
                stageTotal[m] += dataInit[i].content.History[j].stages[m].durationMillis;
                dataInit[i].content.History[j].stages[m].durationMillis = this.timeFormat(dataInit[i].content.History[j].stages[m].durationMillis);
              }
              this.stageTime[m] = stageTotal[m] / dataInit[i].content.History.length;
            }
            // 每个节点占比
            for (let m = 0; m < dataInit[i].content.Stages.length; m++) {
              this.timePercent[m] = (this.stageTime[m] / timeAverage) * 100;
              this.stageTime[m] = this.timeFormat(this.stageTime[m]);
              dataInit[i].content.Stages[m]['averageTime'] = this.stageTime[m];
              dataInit[i].content.Stages[m]['timePercent'] = this.timePercent[m];
            }
          } else {
            this.noData[i] = 0;
          }
        } else {
          this.noData[i] = 0;
        }
      }
      this.data = dataInit;
    });
  }

  // 时间格式转换
  timeFormat(time) {
    const ss = Math.round(time / 1000);
    const minute = Math.floor(ss / 60);
    const hour = Math.floor(minute / 60);
    const day = Math.floor(hour / 24);
    let durationTime = '';
    if (day > 0) {
      return durationTime = durationTime + day + 'd';
    }
    if (hour > 0) {
      return durationTime = durationTime + hour + 'h';
    }
    if (minute > 0) {
      return durationTime = durationTime + minute + 'min';
    }
    if (ss > 0) {
      return durationTime = durationTime + ss + 's';
    } else if (time > 0) {
      return durationTime = time + 'ms';
    } else {
      return time;
    }
  }

  // 返回
  historyBack() {
    setTimeout(() => {
      this.router.navigateByUrl('/app-apply-build-management');
    });
  }

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.params['id'];
    this.getBuildData(this.id);
  }

  ngOnChanges() {
  }
}

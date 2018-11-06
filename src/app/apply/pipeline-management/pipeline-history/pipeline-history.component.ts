import {Component, OnChanges, OnInit, ViewChild} from '@angular/core';
import {PipelineManagementService} from '../pipeline-management.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-apply-pipeline-history',
  templateUrl: './pipeline-history.component.html',
  styleUrls: ['./pipeline-history.component.css']
})

export class PipelineHistoryComponent implements OnInit, OnChanges {
  constructor(private pipelineManagementService: PipelineManagementService,
              private activatedRoute: ActivatedRoute,
              private router: Router) {
  }

  data = [];
  stageName = [];
  loading = false;
  id;
  dms = [];
  stage = {
    'id': '10',
    'name': 'build',
    'execNode': '',
    'status': 'NIL',
    'startTimeMillis': 0,
    'durationMillis': 0,
    'pauseDurationMillis': 0
  }; // 未运行stage节点
  noData = false;
  stageTime = []; // 每个节点平均时间
  timePercent = []; // 百分比

  // 获得pipeline数据
  getPipeLineData(id) {
    this.loading = true;
    this.pipelineManagementService.getHistoryById(id).subscribe(datas => {
      this.loading = false;
      if (datas) {
        this.data = datas;
        for (let i = 0; i < this.data.length; i++) {
          if (this.data[i].stages.length < this.stageName.length) {
            const lackNumber = this.stageName.length - this.data[i].stages.length;
            for (let j = 0; j < lackNumber; j++) {
              this.data[i].stages.push(this.stage);
            }
          }
        }
        // 每次执行的时间
        const timeTotal = [];
        let totalAverage = 0;
        for (let i = 0; i < this.data.length; i++) {
          timeTotal[i] = 0;
          for (let j = 0; j < this.data[i].stages.length; j++) {
            timeTotal[i] += this.data[i].stages[j].durationMillis;
          }
          totalAverage += timeTotal[i];
        }
        // 总平均时间
        const timeAverage = totalAverage / this.data.length;
        // 每个节点的平均时间
        const stageTotal = [];
        for (let i = 0; i < this.stageName.length; i++) {
          stageTotal[i] = 0;
          this.stageTime[i] = 0;
          for (let j = 0; j < this.data.length; j++) {
            stageTotal[i] += this.data[j].stages[i].durationMillis;
          }
          this.stageTime[i] = stageTotal[i] / this.data.length;
        }
        // 每个节点占比
        for (let i = 0; i < this.stageName.length; i++) {
          this.timePercent[i] = (this.stageTime[i] / timeAverage) * 100;
          this.stageTime[i] = this.timeFormat( this.stageTime[i]);
        }
        console.log(this.timePercent);
        Date.prototype.toDateString = function () {
          return this.getHours() + ':' + this.getMinutes();
        };
        for (let i = 0; i < this.data.length; i++) {
          const date = new Date(this.data[i].startTimeMillis);
          console.log(date);
          this.data[i].startTimeMillis = date.toString().slice(3, 10);
          this.dms[i] = date.toDateString();
          for (let j = 0; j < this.data[i].stages.length; j++) {
            this.data[i].stages[j].durationMillis = this.timeFormat(this.data[i].stages[j].durationMillis);
          }
        }
      } else {
        this.noData = true;
      }
    });
  }

  // 获得build数据
  getPipeLineDataById(id) {
    this.pipelineManagementService.getPipelineById(id).subscribe(datas => {
      if (this.stageName) {
        this.stageName = datas.stages;
        setTimeout(() => {
          this.getPipeLineData(this.id);
        });
      }
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
      this.router.navigateByUrl('/app-apply-pipeline-management');
    });
  }

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.params['id'];
    this.getPipeLineDataById(this.id);
  }

  ngOnChanges() {
  }
}

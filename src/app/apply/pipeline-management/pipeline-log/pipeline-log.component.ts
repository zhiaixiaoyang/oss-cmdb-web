import {Component, OnChanges, OnInit, ViewChild, OnDestroy} from '@angular/core';
import {PipelineManagementService} from '../pipeline-management.service';
import {ActivatedRoute, Router} from '@angular/router';
import 'codemirror/mode/javascript/javascript';

@Component({
  selector: 'app-apply-pipeline-log',
  templateUrl: './pipeline-log.component.html',
  styleUrls: ['./pipeline-log.component.css']
})

export class PipelineLogComponent implements OnInit, OnChanges, OnDestroy {
  constructor(private pipelineManagementService: PipelineManagementService,
              private activatedRoute: ActivatedRoute,
              private router: Router) {
  }

  log;
  code = '';
  config = {
    lineNumbers: true,
    mode: 'application/json',
    theme: 'log',
    addModeClass: true,
  };
  loading = false;
  spinLoading = false;
  id;
  pipeline_id;
  history;
  isEnd: true;
  fresh = false; // 刷新与否

  // 查看执log
  lookLog(id, name) {
    this.loading = true;
    this.pipelineManagementService.getLogById(id, name).subscribe(datas => {
      this.loading = false;
      this.code = datas.log;
    });
  }

  // 停止刷新
  stopRefresh() {
    this.fresh = true;
    window.clearInterval(this.log);
  }

  // 开始刷新
  startRefresh() {
    this.fresh = false;
    this.refreshLog(this.pipeline_id, this.id);
    this.timeoutLog();
  }

  // 刷新log
  refreshLog(id, name){
    this.spinLoading = true;
    this.pipelineManagementService.getLogById(id, name).subscribe(datas => {
      this.spinLoading = false;
      this.code = datas.log;
    });
  }

  // 返回
  historyBack() {
    setTimeout(() => {
      if (this.history === 'home') {
        this.router.navigateByUrl('/app-apply-pipeline-management');
      } else if (this.history === 'history') {
        this.router.navigateByUrl('app-apply-pipeline-management/history/' + this.pipeline_id);
      }
    });
  }

  // 5s刷新一次页面
  timeoutLog() {
    this.log = window.setInterval(
      () => {
        this.refreshLog(this.pipeline_id, this.id);
      }, 5000);
  }


  ngOnInit() {
    this.id = this.activatedRoute.snapshot.params['id'];
    this.pipeline_id = this.activatedRoute.snapshot.params['pipeline_id'];
    this.history = this.activatedRoute.snapshot.params['history'];
    this.lookLog(this.pipeline_id, this.id);
    this.timeoutLog();
  }

  ngOnDestroy() {
    window.clearInterval(this.log);
  }

  ngOnChanges() {
  }
}

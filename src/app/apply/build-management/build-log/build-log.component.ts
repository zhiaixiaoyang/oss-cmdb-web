import {Component, OnChanges, OnInit, ViewChild, OnDestroy} from '@angular/core';
import {BuildManagementService} from '../build-management.service';
import {ActivatedRoute, Router} from '@angular/router';
import 'codemirror/mode/javascript/javascript';

@Component({
  selector: 'app-apply-build-log',
  templateUrl: './build-log.component.html',
  styleUrls: ['./build-log.component.css']
})

export class BuildLogComponent implements OnInit, OnChanges, OnDestroy {
  constructor(private buildManagementService: BuildManagementService,
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
  buildId; // 进入log的id
  history; // 构建历史或者流水线历史
  backId; // 返回历史页面id
  isEnd: true; // 是否滚动到底部
  fresh = false; // 刷新与否

  // 查看执log
  lookLog(id, name) {
    this.loading = true;
    if(this.history === 'pipelineHistory') {
      this.buildManagementService.getPipelineLogById(id,name).subscribe(datas => {
        this.loading = false;
        this.code = datas.log;
      });
    } else {
      this.buildManagementService.getBuildLogById(id,name).subscribe(datas => {
        this.loading = false;
        this.code = datas.log;
      });
    }
  }

  // 停止刷新
  stopRefresh() {
    this.fresh = true;
    window.clearInterval(this.log);
  }

  // 开始刷新
  startRefresh() {
    this.fresh = false;
    if (this.history === 'home') {
      this.refreshLog(this.id ,-1);
    } else {
      this.refreshLog(this.id,this.buildId)
    }
    this.timeoutLog();
  }

  // 不断刷新log
  refreshLog(id, name){
    this.spinLoading = true;
    if(this.history === 'pipelineHistory') {
      this.buildManagementService.getPipelineLogById(id,name).subscribe(datas => {
        this.spinLoading = false;
        this.code = datas.log;
      });
    } else {
      this.buildManagementService.getBuildLogById(id,name).subscribe(datas => {
        this.spinLoading = false;
        this.code = datas.log;
      });
    }
  }

  // 刷新log
  changeLog() {
    if (this.history === 'home') {
      this.lookLog(this.id ,-1);
    } else {
      this.lookLog(this.id,this.buildId)
    }
  }

  // 返回
  historyBack() {
    setTimeout(() => {
      if (this.history === 'home') {
        this.router.navigateByUrl('/app-apply-build-management');
      }else {
        this.router.navigateByUrl('app-apply-build-management/history/' + this.backId);
      }
    });
  }

  // 5s刷新一次页面
  timeoutLog() {
    this.log = window.setInterval(
      () => {
        if (this.history === 'home') {
          this.refreshLog(this.id ,-1);
        } else {
          this.refreshLog(this.id,this.buildId)
        }
      }, 5000);
  }

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.params['id'];
    this.history = this.activatedRoute.snapshot.params['history'];
    this.buildId = this.activatedRoute.snapshot.params['buildId'];
    this.backId = this.activatedRoute.snapshot.params['backId'];
    this.changeLog();
    this.timeoutLog();
  }

  ngOnDestroy() {
    window.clearInterval(this.log);
  }

  ngOnChanges() {
  }
}

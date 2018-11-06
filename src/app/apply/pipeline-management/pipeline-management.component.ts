import {Component, OnChanges, Output, TemplateRef, EventEmitter, OnInit, ViewChild, OnDestroy} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {NzMessageService, NzNotificationService} from 'ng-zorro-antd';
import {PipelineManagementService} from './pipeline-management.service';
import {UserService} from '@trident/shared';
import {NziModalService} from 'ng-zorro-iop';

@Component({
  selector: 'app-apply-pipeline-management',
  templateUrl: './pipeline-management.component.html',
  styleUrls: ['./pipeline-management.component.css']
})

export class PipelineManagementComponent implements OnInit, OnChanges, OnDestroy {
  @Output() del = new EventEmitter();
  @ViewChild('FormEnvironmentComponent') FormEnvironmentComponent;
  @ViewChild('environmentInfo') environmentInfo: TemplateRef<any>;

  constructor(private fb: FormBuilder,
              private userService: UserService,
              private  nzNotificationService: NzNotificationService,
              private pipelineManagementService: PipelineManagementService,
              private modalService: NziModalService,
              private nzMessageService: NzMessageService) {
  }

  pipeline;
  validateForm: FormGroup;
  validateStageForm: FormGroup;
  validateFormEnvironment: FormGroup;
  type = '';
  indexCount = 0;
  maxCount = []; // 计数来防止状态长时间显示进行中
  node: any[] = [[]];      //  装填节点数据
  data = []; // 页面显示数据
  dataSearch = [];
  dataSum = [];
  loading = true;
  icon = -1;
  list = -1;
  m = 1;
  stageSum = [];
  mergeInformation = [];
  pushInformation = [];
  arrowRight = -1;
  checkIcon = -1;
  handId = -1;
  searchPipelineName;
  handOrNot = []; // 手动执行标记
  handOrNotId = []; // 手动执行记下id
  stageOrNot = []; // 标记是否自定义节点
  pipelinePageIndex = 1;
  noResult; // when the table has no data
  environment;
  storageClass;
  storageClassData = [];
  mergeLoading; // merge information table data

  getEnvironment(value) {
    this.environment = value;
    if(value) {
      this.storageClassData = [];
      this.pipelineManagementService.getStorageClassData(value).subscribe(respose => {
        for (let i = 0; i < respose.items.length; i++) {
          if (respose.items[i].metadata.hasOwnProperty('labels')) {
            if (respose.items[i].metadata.labels.hasOwnProperty('displayName')) {
              this.storageClassData.push({
                value: respose.items[i].metadata.name,
                key: respose.items[i].metadata.labels.displayName
              });
              this.storageClass = this.storageClassData[0].value;
            }
          }
          else {
            this.storageClassData.push({
              key: respose.items[i].metadata.name,
              value: respose.items[i].metadata.name
            });
            this.storageClass = this.storageClassData[0].value;
          }
        }
      });
    }
  }

  // 判断是否有Jenkins
  getJenkins() {
    this.pipelineManagementService.getJenkins().subscribe(data => {
      if (data.available === true) {
        if (JSON.parse(sessionStorage.getItem('data')) && JSON.parse(sessionStorage.getItem('data')) !== []) {
          this.data = JSON.parse(sessionStorage.getItem('data')) || [];
          if (this.data.length > 0) {
            this.loading = false;
          }
          sessionStorage.removeItem('data');
        }
        this.getPipeLineData();
        this.timeoutPipeline();
      } else if (data.available === false && data.isInstall === false) {
        this.loading = false;
        if (this.userService.isAdmin()) {
          this.noResult = '请选择环境并创建Jenkins！';
          this.modalService.create({
            nzTitle: '选择集群安装Jenkins',
            nzContent: this.environmentInfo,
            nzOkText: '安装',
            nzMaskClosable: false,
            nzOnOk: () => {
              let data = {};
              data['storageClassName'] = this.storageClass;
              this.pipelineManagementService.installJenkins(this.environment,data).subscribe(data => {
                this.nzMessageService.success('正在安装Jenkins，请稍等片刻！');
              })
            },
            nzOnCancel: () => {
              this.FormEnvironmentComponent.resetForm();
            }
          });
        } else {
          this.noResult = '请先联系管理员创建Jenkins！';
          this.nzNotificationService.info('提示信息', '请先联系管理员创建Jenkins！');
        }
      } else if(data.available === false && data.isInstall === true){
        this.loading = false;
        this.nzNotificationService.info('提示信息', data.message
        );
        this.noResult = data.message;
      }
    })
  }

  //  判断前端数据输入
  getFormControl(name: number) {
    return this.validateForm.controls[name];
  }

  //  获得pipeline数据
  getPipeLineData() {
    this.pipelineManagementService.getPipeline().subscribe(datas => {
      this.stageSum = [];
      this.dataSum = [];
      if (datas) {
        this.loading = false;
        this.dataSum = datas;
        for (let i = 0; i < this.dataSum.length - 1; i++) {
          for (let j = 0; j < this.dataSum.length - 1 - i; j++) {
            if (parseInt(this.dataSum [j + 1].startTimeMillis) > parseInt(this.dataSum [j].startTimeMillis)) {
              let m = this.dataSum [j];
              this.dataSum [j] = this.dataSum [j + 1];
              this.dataSum [j + 1] = m;
            }
          }
        }
        for (let l = 0; l < this.dataSum.length; l++) {
          if (this.handOrNot[l] !== 1) {
            this.maxCount[l] = 0;
          }
          if (this.dataSum[l].stages) {
            if (this.dataSum[l].status !== 'IN_PROGRESS' && this.dataSum[l].status !== 'PAUSED_PENDING_INPUT') {
              let index = this.handOrNotId.indexOf(this.dataSum[l].pipelineId);
              if (index > -1) {
                this.handOrNot[l] = 1;
              } else {
                this.handOrNot[l] = 0;
              }
            }
            if (this.dataSum[l].status === 'IN_PROGRESS' || this.dataSum[l].status === 'PAUSED_PENDING_INPUT') {
              this.handOrNot[l] = 0;
              this.handId = -1;
              for (let m = 0; m < this.handOrNotId.length; m++) {
                if (this.dataSum[l].pipelineId === this.handOrNotId[m]) {
                  this.handOrNotId.splice(m, 1);
                }
              }
            }
            if (this.dataSum[l].status === 'IN_PROGRESS' && this.dataSum[l].stages[0].status === 'Unbuild') {
              this.stageOrNot[l] = 1;
            } else if (this.dataSum[l].status === 'IN_PROGRESS' && this.dataSum[l].stages[0].status !== 'Unbuild') {
              this.stageOrNot[l] = 0;
            }
          }
          // 长时间显示为1 自动变成0
          if (this.handOrNot[l] === 1 && this.maxCount[l] >= 0 && this.dataSum[l].status !== 'IN_PROGRESS') {
            this.maxCount[l]++;
            if (this.maxCount[l] > 3) {
              this.handOrNot[l] = 0;
            }
          } else if (this.handOrNot[l] === 1 && this.maxCount[l] !== 0 && this.dataSum[l].status !== 'IN_PROGRESS') {
            this.maxCount[l] = 0;
          }
        }
        // console.log(this.handOrNot);
        // console.log(this.handOrNotId);
        for (let i = 0; i < this.dataSum.length; i++) {
          this.indexCount = i;
          //  开始时间转化
          Date.prototype.toLocaleString = function () {
            let Month = this.getMonth();
            let Date = this.getDate();
            Month = Month + 1;
            if (Month < 10) {
              Month = '0' + Month;
            }
            if (Date < 10) {
              Date = '0' + Date;
            }
            return this.getFullYear() + '/' + Month + '/' + Date;
          };
          Date.prototype.toDateString = function () {
            let Hour = this.getHours();
            let Minute = this.getMinutes();
            let Second = this.getSeconds();
            if (Hour < 10) {
              Hour = '0' + Hour;
            }
            if (Minute < 10) {
              Minute = '0' + Minute;
            }
            if (Second < 10) {
              Second = '0' + Second;
            }
            return Hour + ':' + Minute + ':' + Second;
          };
          const date = new Date(this.dataSum[i].startTimeMillis);
          if (this.dataSum[i].startTimeMillis !== 0) {
            this.dataSum[i].startTimeMillis = date.toLocaleString();
            this.dataSum[i]['startTimeMillis2'] = date.toDateString();
          } else {
            this.dataSum[i].startTimeMillis = '未执行';
            this.dataSum[i]['startTimeMillis2'] = '';
          }
          //  如果有stages
          if (this.dataSum[i].stages && this.stageOrNot[i] !== 1 && this.handOrNot[i] !== 1) {
            if (this.dataSum[i].stages.length > 0) {
              for (let s = 0; s < this.dataSum[i].stages.length; s++) {
                //  时间转化
                this.dataSum[i].stages[s].durationMillis = this.timeFormat(this.dataSum[i].stages[s].durationMillis);
              }
              for (let s = 0; s < this.dataSum[i].stages.length - 1; s++) {
                // 箭头颜色深浅处理
                if (this.dataSum[i].stages[s].status === 'SUCCESS' && (this.dataSum[i].stages[s + 1].status === 'SUCCESS' ||
                    this.dataSum[i].stages[s].status === 'IN_PROGRESS')) {
                  this.dataSum[i].stages[s]['arrow'] = true;
                } else {
                  this.dataSum[i].stages[s]['arrow'] = false;
                }
              }
              this.dataSum[i].stages[this.dataSum[i].stages.length - 1]['arrow'] = false;
              let l = 1, judge = 0;
              //  把节点赋值给二维数组，以便循环排列
              for (let j = 0; j < this.dataSum[i].stages.length; j++) {
                judge++;
                if (judge > 5) {
                  judge = 1;
                  l++;
                }
              }
              const stageNumber = [[]];
              for (let n = 0; n < l; n++) {
                stageNumber[n] = this.dataSum[i].stages.slice(n * 5, 5 * (n + 1));
              }
              if (stageNumber.length > 0) {
                this.stageSum[i] = stageNumber;
              }
            }
          } else if (this.dataSum[i].stages && (this.stageOrNot[i] === 1 || this.handOrNot[i] === 1)) {
            if (this.dataSum[i].stages.length > 0) {
              //  时间转化
              for (let s = 0; s < this.dataSum[i].stages.length; s++) {
                this.dataSum[i].stages[s].durationMillis = this.timeFormat(this.dataSum[i].stages[s].durationMillis);
                this.dataSum[i].stages[s].status = 'Unbuild';
                this.dataSum[i].stages[s]['arrow'] = false;
              }
              this.dataSum[i].stages[0].status = 'IN_PROGRESS';
              let l = 1, judge = 0;
              //  把节点赋值给二维数组，以便循环排列
              for (let j = 0; j < this.dataSum[i].stages.length; j++) {
                judge++;
                if (judge > 5) {
                  judge = 1;
                  l++;
                }
              }
              const stageNumber = [[]];
              for (let n = 0; n < l; n++) {
                stageNumber[n] = this.dataSum[i].stages.slice(n * 5, 5 * (n + 1));
              }
              if (stageNumber.length > 0) {
                this.stageSum[i] = stageNumber;
              }
            }
          }
        }
        for (let i = 0; i < this.dataSum.length; i++) {
          this.dataSum[i].stages = this.stageSum[i];
        }
        this.data = this.dataSum;
        this.dataSearch = this.data;
        if (this.searchPipelineName) {
          this.dataSearch = this.data;
          this.data = [];
          for (const element of this.dataSearch) {
            const eName: string = element.pipelineName;
            if (eName.indexOf(this.searchPipelineName) > -1) {
              this.data.push(element);
            }
          }
        }
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
      return durationTime = durationTime + minute + 'm';
    }
    if (ss > 0) {
      return durationTime = durationTime + ss + 's';
    } else {
      return durationTime = time + 'ms';
    }
  }

  // 显示增删改
  showIcon(i, n, m) {
    this.icon = i;
    this.list = n;
    this.checkIcon = m;
    this.arrowRight = (i + 1) * (n + 5);
  }

  hideIcon(i, n) {
    this.icon = -1;
    this.checkIcon = -1;
    this.arrowRight = -1;
    this.list = -1;
  }

  // 删除pipeline
  deletePipeline(id, m, value) {
    const _this = this;
    this.modalService.confirm({
      nzTitle: '删除',
      nzContentTitle: '确定删除<em> “' +value+ '” </em>吗？',
      nzContent: '删除数据不可恢复与访问，请谨慎操作！',
      nzOkText: '确定',
      nzOnOk: () => {
        const isValid = _this.deletePipe(id, m);
        if (isValid) {
          _this.del.emit();
        }
      },
      nzOnCancel: () => {
      }
    });
  }

  // 删除pipeline
  deletePipe(id, m): void {
    const mid = this.nzMessageService.loading('正在删除中', {nzDuration: 0}).messageId;
    this.pipelineManagementService.delete(id).subscribe(respose => {
      //  this.refreshData(this.ownerId);
      this.nzMessageService.success('删除成功！');
      this.nzMessageService.remove(mid);
      this.handOrNot[m] = 0;
      this.getPipeLineData();
      return true;
    });
  }

  // 更新pipeline
  update(id: string, data) {
    const mid = this.nzMessageService.loading('正在更新中', {nzDuration: 0}).messageId;
    this.pipelineManagementService.update(id, data).subscribe(respose => {
      //  this.refreshData(this.ownerId);
      this.nzMessageService.success('更新成功！');
      this.nzMessageService.remove(mid);
      this.getPipeLineData();
    });
  }

  // 创建pipeline
  create(data) {
    const mid = this.nzMessageService.loading('正在创建中', {nzDuration: 0}).messageId;
    this.pipelineManagementService.create(data).subscribe(respose => {
      //  this.refreshData(this.ownerId);
      this.nzMessageService.success('创建成功！');
      this.nzMessageService.remove(mid);
      this.getPipeLineData();
      this.loading = true;
    });
  }

  // 定时加载页面
  timeoutPipeline() {
    this.pipeline = window.setInterval(
      () => {
        this.getPipeLineData();
      }, 60000);
  }

  // 手动执行即刻改变节点状态
  changeOneStage(m) {
    if (this.dataSum[m].hasOwnProperty('stages')) {
      for (let s = 0; s < this.dataSum[m].stages.length; s++) {
        for (let i = 0; i < this.dataSum[m].stages[s].length; i++) {
          this.dataSum[m].stages[s][i].status = 'Unbuild';
          this.dataSum[m].stages[s][i]['arrow'] = false;
        }
      }
      this.dataSum[m].stages[0][0].status = 'IN_PROGRESS';
      if (this.searchPipelineName) {
        this.dataSearch = this.dataSum;
        this.data = [];
        for (const element of this.dataSearch) {
          const eName: string = element.pipelineName;
          if (eName.indexOf(this.searchPipelineName) > -1) {
            this.data.push(element);
          }
        }
      } else {
        this.data = this.dataSum;
      }
    }
  }

  // 手动执行
  handPipeline(m, id) {
    const mid = this.nzMessageService.loading('执行启动中', {nzDuration: 0}).messageId;
    this.pipelineManagementService.handPipeline(id).subscribe(respose => {
      this.nzMessageService.success('开始执行！');
      this.handId = m;
      this.handOrNotId.push(id);
      this.nzMessageService.remove(mid);
      this.changeOneStage(m);
      this.getPipeLineData();
    });
  }

  // 停止手动执行
  stopPipeline(m, id) {
    const mid = this.nzMessageService.loading('执行关闭中', {nzDuration: 0}).messageId;
    this.pipelineManagementService.stopPipeline(id).subscribe(respose => {
      this.nzMessageService.success('停止成功,请等待片刻！');
      this.nzMessageService.remove(mid);
      this.handOrNot[m] = 0;
      for (let i = 0; i < this.handOrNotId.length; i++) {
        if (this.handOrNotId[i] === id) {
          this.handOrNotId.splice(i, 1);
        }
      }
      this.getPipeLineData();
    });
  }

  // 审查
  stageCheck(content,pipelineId, id) {
    this.getMergeList(pipelineId,id);
    const _this = this;
    const modal = this.modalService.create({
      nzContent: content,
      nzTitle: '你是否审查通过该节点？',
      nzWidth:600,
      nzFooter: [
        {
          label: '取消',
          shape: 'default',
          onClick: () => modal.destroy()
        },
        {
          label: '否',
          type: 'dashed',
          onClick: () => {
            _this.checkFailed(pipelineId, id);
            modal.destroy();
          }
        },
        {
          label: '是',
          type: 'primary',
          onClick: () => {
            _this.checkSuccess(pipelineId, id);
            modal.destroy();
          }
        }
      ]
    });

  }

  // 人工测试
  stageTest(content,pipelineId, id) {
    const _this = this;
    this.getMergeList(pipelineId,id);
    const modal = this.modalService.create({
      nzTitle: '你是否测试通过该节点？',
      nzContent: content,
      nzWidth:600,
      nzFooter: [
        {
          label: '取消',
          shape: 'default',
          onClick: () => modal.destroy()
        },
        {
          label: '否',
          type: 'dashed',
          onClick: () => {
            _this.checkTestFailed(pipelineId, id);
            modal.destroy();
          }
        },
        {
          label: '是',
          type: 'primary',
          onClick: () => {
            _this.checkTestSuccess(pipelineId, id);
            modal.destroy();
          }
        }
      ]
    });

  }

  // get merge information by pipelineId
  getMergeList(id,buildNum) {
    this.mergeInformation = [];
    this.pushInformation = [];
    this.mergeLoading = true;
    this.pipelineManagementService.getMergeById(id,buildNum).subscribe(data => {
      this.mergeLoading = false;
      this.mergeInformation = data.MergeRequest;
      for (let i = 0; i < data.MergeRequest.length; i++) {
        this.mergeInformation[i]['expand'] = false;
      }
      this.pushInformation = data.Push;
    })
  }


  // 审查成功
  checkSuccess(pipelineId, id): void {
    const mid = this.nzMessageService.loading('审查启动中', {nzDuration: 0}).messageId;
    this.pipelineManagementService.checkSuccess(pipelineId, id).subscribe(respose => {
      this.nzMessageService.success('审核成功，即将进入下一个节点！');
      this.nzMessageService.remove(mid);
      this.getPipeLineData();
    });
  }

  // 人工测试成功
  checkTestSuccess(pipelineId, id): void {
    const mid = this.nzMessageService.loading('人工测试启动中', {nzDuration: 0}).messageId;
    this.pipelineManagementService.checkSuccess(pipelineId, id).subscribe(respose => {
      this.nzMessageService.success('人工测试成功，即将进入下一个节点！');
      this.nzMessageService.remove(mid);
      this.getPipeLineData();
    });
  }

  // 审查不成功
  checkFailed(pipelineId, id): void {
    const mid = this.nzMessageService.loading('审查关闭中', {nzDuration: 0}).messageId;
    this.pipelineManagementService.checkFailed(pipelineId, id).subscribe(respose => {
      this.nzMessageService.success('审核取消成功！');
      this.nzMessageService.remove(mid);
      this.getPipeLineData();
    });
  }

  // 人工测试不成功
  checkTestFailed(pipelineId, id): void {
    const mid = this.nzMessageService.loading('人工测试关闭中', {nzDuration: 0}).messageId;
    this.pipelineManagementService.checkFailed(pipelineId, id).subscribe(respose => {
      this.nzMessageService.success('人工测试取消成功！');
      this.nzMessageService.remove(mid);
      this.getPipeLineData();
    });
  }


  // 没有执行log提示
  noLog() {
    this.nzMessageService.warning('请先执行再查看log');
  }

  // 没有执行历史提示
  noHistory() {
    this.nzMessageService.warning('请先执行再查看执行历史');
  }

  // 去掉首尾空格
  trim(str): string {
    return str.replace(/(^\s*)|(\s*$)/g, '');
  }

  // 模糊查询
  search(): void {
    this.loading = true;
    if (this.searchPipelineName == null || this.searchPipelineName === '') {
      this.loading = false;
    } else {
      this.searchPipelineName = this.trim(this.searchPipelineName);
      this.data = [];
      for (const element of this.dataSearch) {
        const eName: string = element.pipelineName;
        if (eName.indexOf(this.searchPipelineName) > -1) {
          this.data.push(element);
        }
      }
      this.loading = false;
    }
  }

  // 重置搜索
  renovate(): void {
    this.searchPipelineName = '';
    this.data = this.dataSearch;
  }

  ngOnInit() {
    this.validateStageForm = this.fb.group({
      name: [null, Validators.required],
      type: [null, Validators.required],
      timeout: [null],
      imageTag: [null]
    });
    this.validateForm = this.fb.group({
      name: [null, Validators.required],
      constructId: [null, Validators.required],
    });
    if (JSON.parse(sessionStorage.getItem('pipelinePageIndex'))) {
      this.pipelinePageIndex = JSON.parse(sessionStorage.getItem('pipelinePageIndex'));
    }
    if (sessionStorage.getItem('searchPipelineName') && sessionStorage.getItem('searchPipelineName') !== 'undefined') {
      this.searchPipelineName = sessionStorage.getItem('searchPipelineName');
    }
    if (JSON.parse(sessionStorage.getItem('hand'))) {
      this.handOrNot = JSON.parse(sessionStorage.getItem('hand')) || [];
      this.handOrNotId = JSON.parse(sessionStorage.getItem('handId')) || [];
      sessionStorage.removeItem('hand');
      sessionStorage.removeItem('handId');
    }
    this.validateFormEnvironment = this.fb.group({
      environment: [null],
      storageClass: [null]
    });
    this.getJenkins();
  }

  ngOnDestroy() {
    window.clearInterval(this.pipeline);
    sessionStorage.setItem('data', JSON.stringify(this.data)); // 流水线列表数据
    sessionStorage.setItem('searchPipelineName', this.searchPipelineName); // 搜索框数据
    sessionStorage.setItem('hand', JSON.stringify(this.handOrNot)); // 手动执行标记
    sessionStorage.setItem('handId', JSON.stringify(this.handOrNotId)); // 手动执行对应Id堆栈存储
    sessionStorage.setItem('pipelinePageIndex', JSON.stringify(this.pipelinePageIndex)); //记录当前页
  }

  ngOnChanges() {
  }
}

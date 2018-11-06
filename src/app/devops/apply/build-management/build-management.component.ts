import {Component, OnChanges, Output, TemplateRef, EventEmitter, OnInit, OnDestroy, ViewChild} from '@angular/core';
import {NzMessageService, NzNotificationService} from 'ng-zorro-antd';
import {BuildManagementService} from './build-management.service';
import {NziModalService} from 'ng-zorro-iop';
import {FormBuilder, FormControl, FormGroup, FormArray, Validators} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {UserService} from '@trident/shared';

@Component({
  selector: 'app-apply-build-management',
  templateUrl: './build-management.component.html',
  styleUrls: ['./build-management.component.css']
})
export class BuildManagementComponent implements OnInit, OnChanges, OnDestroy {
  @Output() del = new EventEmitter();
  @ViewChild('FormTagComponent') FormTagComponent;
  @ViewChild('FormEnvironmentComponent') FormEnvironmentComponent;
  @ViewChild('environmentInfo') environmentInfo: TemplateRef<any>;


  constructor(private buildManagementService: BuildManagementService,
              private modalService: NziModalService,
              private nzNotificationService: NzNotificationService,
              private nzMessageService: NzMessageService,
              private fb: FormBuilder,
              private userService: UserService,
              private activatedRoute: ActivatedRoute) {
  }

  data = [];
  buildPageIndex = 1;
  dataSearch = [];
  loading = true;
  build;
  validateForm: FormGroup;
  validateFormEnvironment: FormGroup;
  tag;
  buildOrNot = []; // 独立构建标记
  handId = -1;
  buildOrNotId = []; // 手动执行记下id
  maxCount = []; // 规避长时间离开页面再返回构建状态的错误
  searchName;
  id;
  selectedValue = 'name';
  pipelineList = [];
  codeQualityList = [];
  noResult; // when the table has no data
  environment; // k8s environment
  storageClass;
  storageClassData = [];

  getEnvironment(value) {
    this.environment = value;
    if (value) {
      this.storageClassData = [];
      this.buildManagementService.getStorageClassData(value).subscribe(respose => {
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
    this.buildManagementService.getJenkins().subscribe(data => {
      if (data.available === true) {
        if (JSON.parse(sessionStorage.getItem('buildData'))) {
          this.data = JSON.parse(sessionStorage.getItem('buildData')) || [];
          if (this.data.length > 0) {
            this.loading = false;
          }
          sessionStorage.removeItem('buildData');
        }
        if (this.data.length > 0) {
          this.getDatas();
        } else {
          this.getLocaltionData();
        }
        this.timeoutBuild();
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
              this.buildManagementService.installJenkins(this.environment, data).subscribe(data => {
                this.nzMessageService.success('正在安装Jenkins，请稍等片刻！');
              });
            },
            nzOnCancel: () => {
              this.FormEnvironmentComponent.resetForm();
            }
          });
        } else {
          this.noResult = '请先联系管理员创建Jenkins！';
          this.nzNotificationService.info('提示信息', '请先联系管理员创建Jenkins！');
        }
      } else if (data.available === false && data.isInstall === true) {
        this.loading = false;
        this.nzNotificationService.info('提示信息', data.message
        );
        this.noResult = data.message;
      }
    });
  }

  // 从本地数据库获取构建信息
  getLocaltionData() {
    this.buildManagementService.getBuilds().subscribe(datas => {
      this.loading = false;
      if (datas) {
        let dataInit = datas || [];
        for (let i = 0; i < dataInit.length - 1; i++) {
          for (let j = 0; j < dataInit.length - 1 - i; j++) {
            if (parseInt(dataInit[j + 1].lastBuildTime) > parseInt(dataInit[j].lastBuildTime)) {
              let m = dataInit[j];
              dataInit[j] = dataInit[j + 1];
              dataInit[j + 1] = m;
            }
          }
        }
        this.data = dataInit;
        this.dataSearch = this.data;
        for (let i = 0; i <= dataInit.length - 1; i++) {
          this.data[i]['index'] = i;
          if (this.data[i].independentBuildStatus === 'IN_PROGRESS') {
            this.buildOrNot[i] = 0;
          }
          // 处理构建时间
          this.data[i].lastBuildTime = new Date(this.data[i].lastBuildTime);
          // 处理构建状态
          this.data[i].lastBuildStatus = 'LOADING';
          // 处理触发类型
          if (dataInit[i].triggerManual === '1') {
            this.data[i].triggerManual = '手动检查';
          } else if (dataInit[i].triggerPoll != null && dataInit[i].triggerPoll !== '') {
            this.data[i].triggerManual = dataInit[i].triggerPoll;
          } else if (this.data[i].triggerGitevent !== '00000') {
            this.data[i].triggerManual = 'gitevent';
          } else {
            this.data[i].triggerManual = '手动触发';
          }
          // 处理构建类型
          if (this.data[i].buildType === 'b2i') {
            this.data[i].buildType = '从程序包构建镜像';
          } else if (this.data[i].buildType === 's2i') {
            this.data[i].buildType = '从源代码构建镜像';
          } else if (this.data[i].buildType === 's2b') {
            this.data[i].buildType = '从源代码构建程序包';
          }
        }
        if (this.searchName) {
          this.dataSearch = this.data;
          this.data = [];
          let eName;
          for (const element of this.dataSearch) {
            if (this.selectedValue === 'name') {
              eName = element.name;
            } else if (this.selectedValue === 'projectUrl') {
              eName = element.projectUrl;
            } else if (this.selectedValue === 'pkgName') {
              eName = element.pkgName;
            }
            if (eName.indexOf(this.searchName) > -1) {
              this.data.push(element);
            }
          }
        }
        this.getDatas();
      }
    });
  }

  // 从Jenkins获得页面绑定数据(第一次加载时候）
  getDatas(): void {
    this.buildManagementService.getApps().subscribe(datas => {
      if (datas) {
        let dataInit = datas || [];
        for (let i = 0; i < dataInit.length - 1; i++) {
          for (let j = 0; j < dataInit.length - 1 - i; j++) {
            if (parseInt(dataInit[j + 1].lastBuildTime) > parseInt(dataInit[j].lastBuildTime)) {
              let m = dataInit[j];
              dataInit[j] = dataInit[j + 1];
              dataInit[j + 1] = m;
            }
          }
        }
        this.data = dataInit;
        this.dataSearch = this.data;
        for (let i = 0; i <= dataInit.length - 1; i++) {
          if (this.buildOrNot[i] !== 1) {
            this.maxCount[i] = 0;
          }
          this.data[i]['index'] = i;
          if (this.data[i].independentBuildStatus !== 'IN_PROGRESS') {
            let index = this.buildOrNotId.indexOf(this.data[i].Id);
            if (index > -1) {
              this.buildOrNot[i] = 1;
            } else {
              this.buildOrNot[i] = 0;
            }
          }
          if (this.data[i].independentBuildStatus === 'IN_PROGRESS') {
            this.buildOrNot[i] = 0;
            this.maxCount[i] = 0;
            this.handId = -1;
            for (let m = 0; m < this.buildOrNotId.length; m++) {
              if (this.data[i].Id === this.buildOrNotId[m]) {
                this.buildOrNotId.splice(m, 1);
              }
            }
          }
          // 长时间显示为1 自动变成0
          if (this.buildOrNot[i] === 1 && this.maxCount[i] >= 0 && this.data[i].independentBuildStatus !== 'IN_PROGRESS') {
            this.maxCount[i]++;
            if (this.maxCount[i] > 3) {
              this.buildOrNot[i] = 0;
            }
          } else if (this.buildOrNot[i] === 1 && this.maxCount[i] !== 0 && this.data[i].independentBuildStatus !== 'IN_PROGRESS') {
            this.maxCount[i] = 0;
          }
          if (this.buildOrNot[i] === 1) {
            this.data[i].lastBuildStatus = 'IN_PROGRESS';
            this.data[i].independentBuildStatus = 'IN_PROGRESS';
          }
          // 处理构建时间
          this.data[i].lastBuildTime = new Date(this.data[i].lastBuildTime);
          // 处理触发类型
          if (dataInit[i].triggerManual === '1') {
            this.data[i].triggerManual = '手动检查';
          } else if (dataInit[i].triggerPoll != null && dataInit[i].triggerPoll !== '') {
            this.data[i].triggerManual = dataInit[i].triggerPoll;
          } else if (this.data[i].triggerGitevent !== '00000') {
            this.data[i].triggerManual = 'gitevent';
          } else {
            this.data[i].triggerManual = '手动触发';
          }
          // 处理构建类型
          if (this.data[i].buildType === 'b2i') {
            this.data[i].buildType = '从程序包构建镜像';
          } else if (this.data[i].buildType === 's2i') {
            this.data[i].buildType = '从源代码构建镜像';
          } else if (this.data[i].buildType === 's2b') {
            this.data[i].buildType = '从源代码构建程序包';
          }
        }
        if (this.searchName) {
          this.dataSearch = this.data;
          this.data = [];
          let eName;
          for (const element of this.dataSearch) {
            if (this.selectedValue === 'name') {
              eName = element.name;
            } else if (this.selectedValue === 'projectUrl') {
              eName = element.projectUrl;
            } else if (this.selectedValue === 'pkgName') {
              eName = element.pkgName;
            }
            if (eName.indexOf(this.searchName) > -1) {
              this.data.push(element);
            }
          }
        }
      }
    });
  }

  // 一分钟刷新一次
  getData(): void {
    this.buildManagementService.getApps().subscribe(datas => {
      if (datas) {
        const dataInit = datas || [];
        for (let i = 0; i < dataInit.length - 1; i++) {
          for (let j = 0; j < dataInit.length - 1 - i; j++) {
            if (parseInt(dataInit[j + 1].lastBuildTime) > parseInt(dataInit[j].lastBuildTime)) {
              let m = dataInit[j];
              dataInit[j] = dataInit[j + 1];
              dataInit[j + 1] = m;
            }
          }
        }
        this.data = dataInit;

        for (let i = 0; i <= dataInit.length - 1; i++) {
          if (this.buildOrNot[i] !== 1) {
            this.maxCount[i] = 0;
          }
          this.data[i]['index'] = i;
          if (this.data[i].independentBuildStatus !== 'IN_PROGRESS') {
            let index = this.buildOrNotId.indexOf(this.data[i].Id);
            if (index > -1) {
              this.buildOrNot[i] = 1;
            } else {
              this.buildOrNot[i] = 0;
            }
          }
          if (this.data[i].independentBuildStatus === 'IN_PROGRESS') {
            this.buildOrNot[i] = 0;
            this.maxCount[i] = 0;
            this.handId = -1;
            for (let m = 0; m < this.buildOrNotId.length; m++) {
              if (this.data[i].Id === this.buildOrNotId[m]) {
                this.buildOrNotId.splice(m, 1);
              }
            }
          }
          // 长时间显示为1 自动变成0
          if (this.buildOrNot[i] === 1 && this.maxCount[i] >= 0 && this.data[i].independentBuildStatus !== 'IN_PROGRESS') {
            this.maxCount[i]++;
            if (this.maxCount[i] > 3) {
              this.buildOrNot[i] = 0;
            }
          } else if (this.buildOrNot[i] === 1 && this.maxCount[i] !== 0 && this.data[i].independentBuildStatus !== 'IN_PROGRESS') {
            this.maxCount[i] = 0;
          }
          if (this.buildOrNot[i] === 1) {
            this.data[i].lastBuildStatus = 'IN_PROGRESS';
            this.data[i].independentBuildStatus = 'IN_PROGRESS';
          }
          // 处理构建时间
          this.data[i].lastBuildTime = new Date(this.data[i].lastBuildTime);
          // 处理触发类型
          if (dataInit[i].triggerManual === '1') {
            this.data[i].triggerManual = '手动检查';
          } else if (dataInit[i].triggerPoll != null && dataInit[i].triggerPoll !== '') {
            this.data[i].triggerManual = dataInit[i].triggerPoll;
          } else if (this.data[i].triggerGitevent !== '00000') {
            this.data[i].triggerManual = 'gitevent';
          } else {
            this.data[i].triggerManual = '手动触发';
          }
          // 处理构建类型
          if (this.data[i].buildType === 'b2i') {
            this.data[i].buildType = '从程序包构建镜像';
          } else if (this.data[i].buildType === 's2i') {
            this.data[i].buildType = '从源代码构建镜像';
          } else if (this.data[i].buildType === 's2b') {
            this.data[i].buildType = '从源代码构建程序包';
          }
        }
        if (this.searchName) {
          this.dataSearch = this.data;
          this.data = [];
          let eName;
          for (const element of this.dataSearch) {
            if (this.selectedValue === 'name') {
              eName = element.name;
            } else if (this.selectedValue === 'projectUrl') {
              eName = element.projectUrl;
            } else if (this.selectedValue === 'pkgName') {
              eName = element.pkgName;
            }
            if (eName.indexOf(this.searchName) > -1) {
              this.data.push(element);
            }
          }
        }
      }
    });
  }

  // get image tag
  getImageTag(name) {
    this.buildManagementService.getImageTag(name).subscribe(data => {
      console.log(data);
    });
  }

  // 删除数据
  deleteForm(id): void {
    const mid = this.nzMessageService.loading('正在删除中', {nzDuration: 0}).messageId;
    this.buildManagementService.delete(id).subscribe(respose => {
      //  this.refreshData(this.ownerId);
      this.nzMessageService.success('删除成功！');
      this.nzMessageService.remove(mid);
      this.getDatas();
    });
  }

  // 删除操作
  showConfirm(id, value, content) {
    this.buildManagementService.getConstructRelevance(id).subscribe(data => {
      this.pipelineList = [];
      this.codeQualityList = [];
      if (data.PipelineName.length > 0) {
        this.pipelineList = data.PipelineName;
      }
      if (data.CodeQualityName.length > 0) {
        this.codeQualityList = data.CodeQualityName;
      }
      if (data.ResultNum !== 0) {
        this.modalService.error({
          nzTitle: '请先删除以下信息',
          nzContent: content,
        });
      } else {
        this.modalService.confirm({
          nzTitle: '删除',
          nzContentTitle: '确定删除<em> “' +value+ '” </em>吗？',
          nzContent: '删除数据不可恢复与访问，请谨慎操作！',
          nzOkText: '确定',
          nzOnOk: () => {
            const isValid = this.deleteForm(id);
            if (isValid) {
              this.del.emit();
            }
          },
          nzCancelText: '取消',
          nzOnCancel: () => {}
        });
      }
    });
  }

  // 镜像tag校验
  tagValidator = (control: FormControl): { [s: string]: any } => {
    const EMAIL_REGEXP = /^[_A-Za-z0-9]([._\-A-Za-z0-9]*)?$/;
    if (!EMAIL_REGEXP.test(control.value)) {
      return {expose: {message: '只能输入字母、数字、点、下划线及中横线，不能以点、中横线开头!'}};
    }
  };

  // 独立构建弹框
  showBuildModel(contentTpl, id, index, imageName) {
    this.getImageTag(imageName);
    this.modalService.create({
      nzTitle: '独立构建',
      nzContent: contentTpl,
      nzMaskClosable: false,
      nzOnOk: () => {
        return this.handleOk(id, index);
      },
      nzOnCancel: () => {
        return this.handleCancel();
      }
    });
  }

  // 输入部分数据校验
  getInvalidMessage(name) {
    return this.FormTagComponent.getInvalidMessage(name);
  }

  // 提交应用构建
  handleOk(id, index): boolean {
    const isSuccess: boolean = this.independentBuild(id, index);
    return isSuccess;
  }

  // 取消独立构建
  handleCancel(): void {
    this.FormTagComponent.resetForm();
  }

  // 独立构建
  independentBuild(id, index) {
    let data: any;
    if (this.FormTagComponent.validForm()) {
      data = this.FormTagComponent.getFormData();
      // 提交数据{name,tag,desc}
      this.buildManagementService.independentBuild(id, data['tag']).subscribe(respose => {
        this.nzMessageService.success('开始独立构建！');
        this.handId = index;
        this.buildOrNotId.push(id);
        this.changeOneBuild(index);
        this.getDatas();
      });
      this.FormTagComponent.resetForm();
      return true;
    } else {
      return false;
    }
  }

  // 独立构建即刻改变构建状态
  changeOneBuild(m) {
    this.data[m].independentBuildStatus = 'IN_PROGRESS';
    this.data[m].lastBuildStatus = 'IN_PROGRESS';
    if (this.searchName) {
      this.dataSearch = this.data;
      this.data = [];
      let eName;
      for (const element of this.dataSearch) {
        if (this.selectedValue === 'name') {
          eName = element.name;
        } else if (this.selectedValue === 'projectUrl') {
          eName = element.projectUrl;
        } else if (this.selectedValue === 'pkgName') {
          eName = element.pkgName;
        }
        if (eName.indexOf(this.searchName) > -1) {
          this.data.push(element);
        }
      }
    } else {
      this.data = this.data;
    }
  }

  // 定时加载页面
  timeoutBuild() {
    this.build = setInterval(
      () => {
        this.getData();
      }
      , 60000);
  }

  // 停止独立构建
  stopBuild(id, index) {
    this.buildManagementService.stopBuild(id).subscribe(response => {
      this.nzMessageService.success('正在停止独立构建，请稍等片刻！');
      this.buildOrNot[index] = 0;
      for (let i = 0; i < this.buildOrNotId.length; i++) {
        if (this.buildOrNotId[i] === id) {
          this.buildOrNotId.splice(i, 1);
        }
      }
      this.data[index].independentBuildStatus = 'ABORTED';
      this.getDatas();
    });
  }

  // 去掉首尾空格
  trim(str): string {
    return str.replace(/(^\s*)|(\s*$)/g, '');
  }

  // 模糊查询
  search(): void {
    this.loading = true;
    if (this.searchName == null || this.searchName === '') {
      this.data = this.dataSearch;
      this.loading = false;
    } else {
      this.searchName = this.trim(this.searchName);
      this.data = [];
      let eName;
      for (const element of this.dataSearch) {
        if (this.selectedValue === 'name') {
          eName = element.name;
        } else if (this.selectedValue === 'projectUrl') {
          eName = element.projectUrl;
        } else if (this.selectedValue === 'pkgName') {
          eName = element.pkgName;
        }
        if (eName.indexOf(this.searchName) > -1) {
          this.data.push(element);
        }
      }
      this.loading = false;
    }
  }

  // 重置搜索
  renovate(): void {
    this.searchName = '';
    this.data = this.dataSearch;
  }

  ngOnInit() {
    if (sessionStorage.getItem('searchName') && sessionStorage.getItem('selectedValue') && sessionStorage.getItem('searchName') !== 'undefined') {
      this.searchName = sessionStorage.getItem('searchName');
      this.selectedValue = sessionStorage.getItem('selectedValue');
      sessionStorage.removeItem('searchName');
      sessionStorage.removeItem('selectedValue');
    }
    if (JSON.parse(sessionStorage.getItem('buildPageIndex'))) {
      this.buildPageIndex = JSON.parse(sessionStorage.getItem('buildPageIndex'));
    }
    if (JSON.parse(sessionStorage.getItem('buildOrNot'))) {
      this.buildOrNot = JSON.parse(sessionStorage.getItem('buildOrNot')) || [];
      this.buildOrNotId = JSON.parse(sessionStorage.getItem('buildOrNotId')) || [];
      sessionStorage.removeItem('buildOrNot');
      sessionStorage.removeItem('buildOrNotId');
    }
    this.validateFormEnvironment = this.fb.group({
      environment: [null],
      storageClass: [null]
    });
    this.getJenkins();

    this.validateForm = this.fb.group({
      tag: [null, [Validators.required, this.tagValidator, Validators.minLength(2), Validators.maxLength(20)]]
    });
  }

  ngOnDestroy() {
    clearInterval(this.build);
    sessionStorage.setItem('buildData', JSON.stringify(this.data)); // 记录构建列表总数居
    sessionStorage.setItem('searchName', this.searchName); // 记录搜索框数据
    sessionStorage.setItem('selectedValue', this.selectedValue); // 记录搜索框当前选中
    sessionStorage.setItem('buildPageIndex', JSON.stringify(this.buildPageIndex));
    sessionStorage.setItem('buildOrNot', JSON.stringify(this.buildOrNot)); // 执行标记
    sessionStorage.setItem('buildOrNotId', JSON.stringify(this.buildOrNotId)); // 执行对应Id堆栈存储
  }

  ngOnChanges() {
  }
}

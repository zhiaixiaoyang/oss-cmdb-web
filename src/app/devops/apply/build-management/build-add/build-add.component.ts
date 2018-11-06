import {Component, OnChanges, Output, EventEmitter, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators, FormArray, AbstractControl} from '@angular/forms';
import {NzModalService, NzMessageService, NzNotificationService} from 'ng-zorro-antd';
import {FileItem, FileUploader} from 'ng2-file-upload';
import {ParsedResponseHeaders} from 'ng2-file-upload/file-upload/file-uploader.class';
import {BuildManagementService} from '../build-management.service';
import {Router, ActivatedRoute} from '@angular/router';
import {CuValidators,NziModalService} from 'ng-zorro-iop';

@Component({
  selector: 'app-build-add',
  templateUrl: './build-add.component.html',
  styleUrls: ['./build-add.component.css']
})
export class BuildAddComponent implements OnInit, OnChanges {
  @Output() del = new EventEmitter();
  @ViewChild('NziFormComponent') NziFormComponent;

  constructor(private fb: FormBuilder,
              private buildManagementService: BuildManagementService,
              private nzNotificationService: NzNotificationService,
              private modalService: NziModalService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private nzMessageService: NzMessageService) {
  }

  dataName = [];
  editName; // the name when editing for excluding examine myself
  buildType = 's2i';
  data = [];
  lanuch = false;
  loading = false;
  launchParm = false;
  check = false;
  buildId;
  type = ''; // to judge what page enter into this page
  validateForm: FormGroup;
  typeOptions;
  scmList = [
    {id: 'GitLab', name: 'GitLab'},
    {id: 'GitHub', name: 'GitHub'}
  ];
  languageOptions;
  languageList = [
    {id: 'java8', name: 'java8'},
    {id: 'java7', name: 'java7'},
    {id: 'Go', name: 'Go'},
    {id: 'Nodejs8', name: 'Nodejs8'}
  ];
  imageOptions;
  uploader: FileUploader = new FileUploader({});
  fileName;
  fileItem: FileItem = null;
  uploadMid;
  titleContent = '生成gitlab API token的操作步骤:<br>1、使用具有源码项目访问权限和创建webhook权限的用户登录gitlab<br>2、进入User Settings Access Tokens功能<br>3、输入token的name并在Scopes中选择 api Access the authenticated user\'s API选项<br>4、点击Create personal access token按钮创建 API token<br>5、复制生成的API token字符串';
  isUploadEnd: boolean;
  pkgOptions; // 软件包名称
  pkgTypeOptions; // 软件包上传方式
  versionOptions; // 软件包版本
  pkgTypeList = [
    {id: '0', name: '新建软件包'},
    {id: '1', name: '选择已有软件包'},
  ];
  binariesList = [];
  versionList = [];
  baseImages = [
    {id: 'spring_boot', name: 'spring_boot'},
    {id: 'jdk7_tomcat7', name: 'jdk7_tomcat7'},
    {id: 'jdk8_tomcat8', name: 'jdk8_tomcat8'}
  ];
  toolOptions;
  toolList = [
    {id: 'gradle', name: 'gradle'},
    {id: 'maven', name: 'maven'}
  ];
  buildOptions;
  branchOption = [];
  buildList = [
    {id: 's2i', name: '从源代码构建镜像'},
    {id: 'b2i', name: '从程序包构建镜像'},
    {id: 's2b', name: '从源代码构建程序包'}
  ];
  checkOptions = [
    {label: 'Push Events', value: 'Push Events', checked: false},
    {label: 'Opened Merge Request Events', value: 'Opened Merge Request Events', checked: false},
    {label: 'Accepted Merge Request Events', value: 'Accepted Merge Request Events', checked: false},
    {label: 'Closed Merge Request Event', value: 'Closed Merge Request Event', checked: false},
    {label: 'Comments', value: 'Comments', checked: false}
  ];
  weekday = [
    {label: '周一', value: '周一', checked: false},
    {label: '周二', value: '周二', checked: false},
    {label: '周三', value: '周三', checked: false},
    {label: '周四', value: '周四', checked: false},
    {label: '周五', value: '周五', checked: false},
    {label: '周六', value: '周六', checked: false},
    {label: '周日', value: '周日', checked: false}
  ];
  triggerManual = false;
  triggerPoll = '';
  modelData = {
    'Id': null,
    'name': null,
    'scmType': 'GitLab',
    'apiToken': null,
    'projectUrl': null,
    'branchName': null,
    'scmUsername': null,
    'scmPassword': null,
    'language': 'java8',
    'buildTool': null,
    'buildScript': null,
    'triggerGitevent': null,
    'triggerPoll': null,
    'triggerManual': null,
    'artifactName': null,
    'artifactPath': null,
    'baseImage': null,
    'outputImageName': null,
    'cmdOpts': null,
    'namespace': null,
    'jobName': null,
    'jobToken': null,
    'lastBuildTime': null,
    'createTime': null,
    'lastBuildStatus': null,
    'pkgName': null,
    'pkgVersion': null,
    'pkgHasName': null,
    'pkgHasVersion': null,
    'buildType': 's2i',
    'exposePort': '',
  }; // 初始数据
  trigger = 2;
  triggerCope;
  timeCheck = 'period';
  timeCheckInit = true;
  periodStyle = 'minute';
  minuteStart;
  minuteEnd;
  hourStart;
  hourEnd;
  authentication = false;
  dayDate: Date | null = null;
  weekDate: Date | null = null;
  minuteType = true;
  hourType = false;
  dayType = false;
  weekType = false;
  aimType = '';
  handGit = false;
  handTime = false;
  handCheck = false;
  addOrEdit = false;
  artifactNameInput = true; // 判断构建路径输入框是否出现
  buildTypeInit; // 用来记录编辑时候初始构建类型
  pkgType = '0'; // 软件包新建或者选择已有：0新建 1选择
  apiMessage; // 记录apiToken校验信息
  // userMessage; // 记录用户名密码校验信息
  errorMessage; // 记录获取分支填写的错误
  resultNum = 1; // 记录apiToken校验标记
  // userNum = 1; // 记录用户名密码校验标记
  errorNum = 1; // 记录获取分支标记
  gitEventOrNot; // git事件是否可以点击
  testCode = true; // 测试按钮
  isLoadingBranch;
  isLoadingTest; // 测试加载
  clickNumber = 0; // 设置点击次数，两秒内点击多次不生效
  branchInput = false;

  // 获得全部构建信息
  getData(): void {
    this.buildManagementService.getBuilds().subscribe(datas => {
      if (datas) {
        this.dataName = datas || [];
      }
    });
  }

  // 处理构建语言联动
  languageType(value) {
    if (value === 'Nodejs8') {
      this.toolList = [
        {id: 'npm', name: 'npm'}
      ];
      this.baseImages = [
        {id: 'nginx', name: 'nginx'},
      ];
      this.modelData.baseImage = 'nginx';
      this.modelData.buildTool = 'npm';
      this.modelData.exposePort = '80';
      this.artifactNameInput = false;
      this.validateForm.setControl('artifactName', new FormControl(null));
      this.validateForm.controls['artifactName'].reset();
      this.validateForm.controls['exposePort'].disable();
    } else {
      this.artifactNameInput = true;
      this.validateForm.setControl('artifactName', new FormControl(null, [Validators.required]));
    }
    if (value === 'Go') {
      this.toolList = [
        {id: 'gradle', name: 'gradle'},
        {id: 'make', name: 'make'}
      ];
      this.baseImages = [
        {id: 'golang', name: 'golang'},
      ];
      this.modelData.baseImage = 'golang';
      if (this.addOrEdit === false) {
        this.modelData.buildTool = 'make';
        this.modelData.exposePort = '';
        this.validateForm.controls['exposePort'].enable();
      } else if (this.addOrEdit === true) {
        if (this.modelData.buildTool !== 'gradle' && this.modelData.buildTool !== 'make') {
          this.modelData.buildTool = 'gradle';
        }
      }
    }
    if (value === 'java7') {
      this.toolList = [
        {id: 'gradle', name: 'gradle'},
        {id: 'maven', name: 'maven'}
      ];
      this.baseImages = [
        {id: 'spring_boot', name: 'spring_boot'},
        {id: 'jdk7_tomcat7', name: 'jdk7_tomcat7'}
      ];
      if (this.addOrEdit === false) {
        if (this.modelData.buildTool !== 'maven') {
          this.modelData.buildTool = 'gradle';
        }
        this.modelData.baseImage = 'spring_boot';
        this.modelData.exposePort = '8080';
        this.validateForm.controls['exposePort'].enable();
      } else if (this.addOrEdit === true) {
        if (this.modelData.buildTool !== 'gradle' && this.modelData.buildTool !== 'maven') {
          this.modelData.buildTool = 'gradle';
        }
        if (this.modelData.baseImage !== 'spring_boot' && this.modelData.baseImage !== 'jdk7_tomcat7') {
          this.modelData.baseImage = 'spring_boot';
        }
      }
    }
    if (value === 'java8') {
      this.toolList = [
        {id: 'gradle', name: 'gradle'},
        {id: 'maven', name: 'maven'}
      ];
      this.baseImages = [
        {id: 'spring_boot', name: 'spring_boot'},
        {id: 'jdk8_tomcat8', name: 'jdk8_tomcat8'}
      ];
      if (this.addOrEdit === false) {
        if (this.modelData.buildTool !== 'maven') {
          this.modelData.buildTool = 'gradle';
        }
        this.modelData.baseImage = 'spring_boot';
        this.modelData.exposePort = '8080';
        this.validateForm.controls['exposePort'].enable();
      } else if (this.addOrEdit === true) {
        if (this.modelData.buildTool !== 'gradle' && this.modelData.buildTool !== 'maven') {
          this.modelData.buildTool = 'gradle';
        }
        if (this.modelData.baseImage !== 'spring_boot' && this.modelData.baseImage !== 'jdk7_tomcat7') {
          this.modelData.baseImage = 'spring_boot';
        }
      }
    }
    this.toolOptions = {
      datas: this.toolList
    };
    this.imageOptions = {
      datas: this.baseImages
    };
  }

  // 构建脚本联动
  buildToolChange(value) {
    if (value === 'gradle' && this.addOrEdit === false) {
      this.modelData.buildScript = 'gradle build\r' +
        'gradle uploadArchives';
      this.modelData.artifactPath = './build/libs/';
    } else if (value === 'maven' && this.addOrEdit === false) {
      this.modelData.buildScript = 'mvn compile\r' +
        'mvn install';
      this.modelData.artifactPath = './target/';
    } else if (value === 'make' && this.addOrEdit === false) {
      this.modelData.buildScript = 'go build xxx.go';
      this.modelData.artifactPath = '';
    } else if (value === 'npm' && this.addOrEdit === false) {
      this.modelData.buildScript = 'npm install\r' +
        'npm build\r' +
        'npm publish';
      this.modelData.artifactPath = './dist/';
    }
  }

  // 处理触发器
  triggerCheck() {
    if (this.trigger === 1) {
      this.handTime = true;
      this.handGit = false;
      this.handCheck = false;
      if (this.modelData.triggerPoll) {
        this.timeCheck = 'custom';
        this.timeCheckInit = true;
      } else {
        this.timeCheck = 'period';
        this.timeCheckInit = false;
      }
    } else if (this.trigger === 0) {
      this.handTime = false;
      this.handGit = true;
      this.handCheck = false;
      this.validateForm.setControl('triggerPoll', new FormControl(null));
    } else if (this.trigger === 2) {
      this.validateForm.setControl('triggerManual', new FormControl(null, [this.triggerManualValidator]));
      this.validateForm.setControl('triggerPoll', new FormControl(null));
      this.handTime = false;
      this.handGit = false;
      this.handCheck = true;
      this.triggerManual = true;
    }
    if (this.trigger !== 2) {
      this.triggerManual = false;
      this.validateForm.setControl('triggerManual', new FormControl(null));
    }
    if (this.trigger !== 0) {
      this.checkOptions.forEach(item => item.checked = false);
    }
  }

  // apiToken控制git事件能否选中
  apiTokenChange() {
    this.testButtonChange();
    if (this.modelData.apiToken === null || this.modelData.apiToken === '') {
      this.gitEventOrNot = true;
    } else {
      this.gitEventOrNot = false;
    }
  }

  // apiToken添加与否git事件提醒
  gitEventChange() {
    if (this.handGit === true && this.gitEventOrNot === true) {
      setTimeout(() => {
        this.handGit = false;
        this.trigger = 1;
      }, 500);
      this.nzNotificationService.warning('', '请先填入token再点击git事件');
    }
  }

  // 处理时间构建
  triggerPollChange(value) {
    if (value === 'custom') {
      this.timeCheckInit = true;
      this.validateForm.setControl('triggerPoll', new FormControl(null, Validators.required));
    } else if (value === 'period') {
      this.timeCheckInit = false;
      this.periodStyle = 'minute';
      this.validateForm.setControl('triggerPoll', new FormControl(null));
    }
  }

  // cron表达式选择时间
  periodTrigger(value) {
    if (value === 'weekend') {
      this.weekType = true;
      this.dayType = false;
      this.hourType = false;
      this.minuteType = false;
      this.aimType = value;
      this.validateForm.setControl('weekDate', new FormControl(null, Validators.required));
      this.validateForm.setControl('minuteStart', new FormControl(null));
      this.validateForm.setControl('minuteEnd', new FormControl(null));
      this.validateForm.setControl('hourStart', new FormControl(null));
      this.validateForm.setControl('hourEnd', new FormControl(null));
      this.validateForm.setControl('dayDate', new FormControl(null));
    } else if (value === 'day') {
      this.weekType = false;
      this.dayType = true;
      this.hourType = false;
      this.minuteType = false;
      this.aimType = value;
      this.validateForm.setControl('dayDate', new FormControl(null, Validators.required));
      this.validateForm.setControl('minuteStart', new FormControl(null));
      this.validateForm.setControl('minuteEnd', new FormControl(null));
      this.validateForm.setControl('hourStart', new FormControl(null));
      this.validateForm.setControl('hourEnd', new FormControl(null));
      this.validateForm.setControl('weekDate', new FormControl(null));
    } else if (value === 'hour') {
      this.weekType = false;
      this.dayType = false;
      this.hourType = true;
      this.minuteType = false;
      this.aimType = value;
      this.validateForm.setControl('hourStart', new FormControl(null, Validators.required));
      this.validateForm.setControl('hourEnd', new FormControl(null, [Validators.required, this.timeValidator]));
      this.validateForm.setControl('minuteStart', new FormControl(null));
      this.validateForm.setControl('minuteEnd', new FormControl(null));
      this.validateForm.setControl('weekDate', new FormControl(null));
      this.validateForm.setControl('dayDate', new FormControl(null));
    } else if (value === 'minute') {
      this.weekType = false;
      this.dayType = false;
      this.hourType = false;
      this.minuteType = true;
      this.aimType = value;
      this.validateForm.setControl('minuteStart', new FormControl(null, Validators.required));
      this.validateForm.setControl('minuteEnd', new FormControl(null, [Validators.required, this.timeValidator]));
      this.validateForm.setControl('hourStart', new FormControl(null));
      this.validateForm.setControl('hourEnd', new FormControl(null));
      this.validateForm.setControl('weekDate', new FormControl(null));
      this.validateForm.setControl('dayDate', new FormControl(null));
    }
  }

  // 创建初始化
  initAdd() {
    this.checkOptions.forEach(item => item.checked = false);
    this.triggerManual = false;
    this.handTime = true;
    this.trigger = 1;
    this.triggerCope = 1;
    this.buildType = 's2i';
    this.timeCheck = 'period';
    this.periodStyle = 'minute';
    this.timeCheckInit = false;
    this.addOrEdit = false;
  }

  // 提交应用构建
  handleOk() {
    ++this.clickNumber;
    // 设置两秒内不能重复点击;
    setTimeout(() => {
      this.clickNumber = 0;
    }, 2000);
    if (this.clickNumber > 1) {
      return false;
    }
    // 创建时候
    if (this.addOrEdit === false) {
      if (this.modelData.apiToken && this.modelData.projectUrl && this.modelData.buildType !== 'b2i') {
        const data = {};
        data['apiToken'] = this.modelData.apiToken;
        data['projectUrl'] = this.modelData.projectUrl;
        this.buildManagementService.apiTokenValidator(data).subscribe(data => {
          this.resultNum = data.resultNum;
          if (data.resultNum !== 0) {
            this.nzMessageService.error('apiToken与项目地址匹配不正确');
            this.apiMessage = data.errorInfo;
          } else if (data.resultNum === 0) {
            // const isSuccess: boolean = this.testValidator();
            // return !isSuccess;
            const isSuccess: boolean = this.submitForm();
            return !isSuccess;
          }
        });
      } else {
        // const isSuccess: boolean = this.testValidator();
        // return !isSuccess;
        const isSuccess: boolean = this.submitForm();
        return !isSuccess;
      }
    } else if (this.addOrEdit === true) { // 编辑时候
      if (this.modelData.apiToken && this.modelData.projectUrl && this.modelData.buildType !== 'b2i') {
        const data = {};
        data['apiToken'] = this.modelData.apiToken;
        data['projectUrl'] = this.modelData.projectUrl;
        this.buildManagementService.apiTokenValidator(data).subscribe(data => {
          this.resultNum = data.resultNum;
          if (data.resultNum !== 0) {
            this.nzMessageService.error('apiToken与项目地址匹配不正确');
            this.apiMessage = data.errorInfo;
          } else if (data.resultNum === 0) {
            if (this.buildTypeInit !== this.modelData.buildType) {
              this.modalService.warning({
                nzTitle: '警告提示',
                nzContentTitle: '您是否确认要修改构建类型',
                nzContent: '<b>修改操作无法回滚，请谨慎操作</b>',
                nzOnOk: () => {
                  // const isSuccess: boolean = this.testValidator();
                  // return !isSuccess;
                  const isSuccess: boolean = this.updateForm(this.buildId);
                  return !isSuccess;
                },
                nzOnCancel: () => {
                }
              });
            } else {
              // const isSuccess: boolean = this.testValidator();
              // return !isSuccess;
              const isSuccess: boolean = this.updateForm(this.buildId);
              return !isSuccess;
            }
          }
        });
      } else {
        if (this.buildTypeInit !== this.modelData.buildType) {
          this.modalService.confirm({
            nzTitle: '警告提示',
            nzContentTitle: '您是否确认要修改构建类型',
            nzContent: '<b>修改操作无法回滚，请谨慎操作</b>',
            nzOnOk: () => {
              // const isSuccess: boolean = this.testValidator();
              // return !isSuccess;
              const isSuccess: boolean = this.updateForm(this.buildId);
              return !isSuccess;
            },
            nzOnCancel: () => {
            }
          });
        } else {
          // const isSuccess: boolean = this.testValidator();
          // return !isSuccess;
          const isSuccess: boolean = this.updateForm(this.buildId);
          return !isSuccess;
        }
      }
    }
  }

  // 取消应用构建
  handleCancel(): void {
    this.resetForm();
  }

  // 构建提交表单数据
  submitForm() {
    const data = {};
    // 处理triggerPoll数据
    if (this.timeCheckInit === false && this.trigger === 1) {
      this.minuteStart = this.validateForm.controls['minuteStart'].value;
      this.minuteEnd = this.validateForm.controls['minuteEnd'].value;
      this.hourStart = this.validateForm.controls['hourStart'].value;
      this.hourEnd = this.validateForm.controls['hourEnd'].value;
      switch (this.aimType) {
        case 'minute':
          this.triggerPoll = '0' + ' ' + this.minuteStart + '/' + this.minuteEnd + ' * * * ?';
          break;
        case 'hour':
          this.triggerPoll = '0 0 ' + this.hourStart + '/' + this.hourEnd + ' * * ?';
          break;
        case 'day':
          this.triggerPoll = '0 ' + this.dayDate.toString().slice(19, 21) + ' ' + this.dayDate.toString().slice(16, 18) + ' * * ?';
          break;
        case 'weekend':
          const week = this.validateForm.controls['weekday'].value;
          let weeks = '';
          for (let l = 0; l < week.length; l++) {
            if (l === 6 && week[l].checked === true) {
              weeks += 1 + ',';
            }
            if (week[l].checked === true && l !== 6) {
              weeks += (l + 2) + ',';
            }
          }
          weeks = weeks.slice(0, weeks.length - 1);
          console.log(weeks);
          this.triggerPoll = '0 ' + this.weekDate.toString().slice(19, 21) + ' ' + this.weekDate.toString().slice(16, 18) + ' ? * ' + weeks;
          break;
      }
    } else {
      this.validateForm.setControl('dayDate', new FormControl(null));
      this.validateForm.setControl('minuteStart', new FormControl(null));
      this.validateForm.setControl('minuteEnd', new FormControl(null));
      this.validateForm.setControl('hourStart', new FormControl(null));
      this.validateForm.setControl('hourEnd', new FormControl(null));
      this.validateForm.setControl('weekDate', new FormControl(null));
    }
    // 先检验表单
    for (const l in this.validateForm.controls) {
      if (l) {
        this.validateForm.controls[l].markAsDirty();
        this.validateForm.controls[l].updateValueAndValidity();
      }
    }
    if (this.validateForm.status !== 'VALID') {
      return false;
    }
    // 处理trigger_gitevent数据
    const event = this.validateForm.controls.triggerGitevent.value;
    //  this.validateForm.removeControl('triggerGitevent');
    let gitEventString = '';
    for (let i = 0; i < event.length; i++) {
      if (event[i].checked === true) {
        gitEventString += '1';
      } else {
        gitEventString += '0';
      }
    }
    for (const i in this.validateForm.controls) {
      if (i) {
        data[i] = this.validateForm.controls[i].value;
      }
    }
    data['triggerGitevent'] = gitEventString;
    // 处理triggerManual数据
    if (this.triggerManual === true) {
      data['triggerManual'] = '1';
    } else {
      data['triggerManual'] = '0';
    }
    // 定时检查时间
    if (this.timeCheckInit === false) {
      data['triggerPoll'] = this.triggerPoll;
    }

    // 删除无用data
    delete data['check'];
    delete data['timeCheck'];
    delete data['periodTime'];
    delete data['weekday'];
    delete data['minuteStart'];
    delete data['minuteEnd'];
    delete data['hourStart'];
    delete data['hourEnd'];
    delete data['dayDate'];
    delete data['weekDate'];
    delete data['handCheck'];
    delete data['handGit'];
    delete data['handTime'];
    delete data['handTime'];
    delete data['launchParams'];
    delete data['fileName'];
    delete data['pkgHasName'];
    delete data['pkhHasVersion'];
    data['language'] = data['language'].toLowerCase();
    // 处理pkgUrl数据
    if (this.buildType === 'b2i') {
      this.buildManagementService.getBinariesList('', '').subscribe({
        next: (datas) => {
          this.binariesList = datas || [];
          for (let i = 0; i < this.binariesList.length; i++) {
            if (this.pkgType === '0' && this.binariesList[i].name === this.modelData.pkgName) {
              if (this.binariesList[i].binariesVersions[0].path && this.binariesList[i].binariesVersions[0].name) {
                data['pkgUrl'] = this.binariesList[i].binariesVersions[0].path;
                data['pkgName'] = this.binariesList[i].binariesVersions[0].name;
                this.create(data);
              } else {
                this.nzMessageService.error('程序包url为空');
              }
            } else if (this.pkgType === '1' && this.binariesList[i].name === this.modelData.pkgHasName) {
              for (let j = 0; j < this.binariesList[i].binariesVersions.length; j++) {
                if (this.binariesList[i].binariesVersions[j].version === this.modelData.pkgHasVersion) {
                  data['pkgUrl'] = this.binariesList[i].binariesVersions[j].path;
                  data['pkgName'] = this.binariesList[i].binariesVersions[j].name;
                  data['pkgVersion'] = this.modelData.pkgHasVersion;
                }
              }
              if (data['pkgUrl'] && data['pkgName']) {
                this.create(data);
              } else {
                this.nzMessageService.error('程序包url为空');
              }
            }
          }
        },
        complete: () => {
        }
      });
    }
    else {
      this.create(data);
    }
    return true;
  }

  // 增加表单
  create(data) {
    const mid = this.nzMessageService.loading('正在创建中', {nzDuration: 0}).messageId;
    this.buildManagementService.create(data).subscribe(respose => {
      //  this.refreshData(this.ownerId);
      this.nzMessageService.success('创建成功！');
      this.nzMessageService.remove(mid);
      setTimeout(() => {
        this.router.navigateByUrl('/app-apply-build-management');
      }, 1000);
    });
  }

  // 源代码构建数据校验
  getInvalidMessage(name) {
    return this.NziFormComponent.getInvalidMessage(name);
  }

  // 判断认证
  identification(value) {
    this.testButtonChange();
    if (value === true) {
      this.authentication = true;
      this.validateForm.controls['scmUsername'].enable();
      this.validateForm.controls['scmPassword'].enable();
      this.validateForm.setControl('scmUsername', new FormControl(null, Validators.required));
      this.validateForm.setControl('scmPassword', new FormControl(null, Validators.required));
    } else {
      this.authentication = false;
      this.validateForm.controls['scmUsername'].disable();
      this.validateForm.controls['scmPassword'].disable();
      this.validateForm.setControl('scmUsername', new FormControl(null));
      this.validateForm.setControl('scmPassword', new FormControl(null));
    }
  }

  // 测试按钮显示与否
  testButtonChange() {
    // if (this.modelData.scmUsername && this.modelData.scmPassword && this.modelData.projectUrl && this.check === true) {
    //   this.testCode = false;
    // } else
    if (this.modelData.apiToken && this.modelData.projectUrl) {
      this.testCode = false;
    } else {
      this.testCode = true;
      // this.userNum = 1;
      this.resultNum = 1;
      this.errorNum = 1;
    }
  }

  // 取消操作
  resetForm() {
    if (this.type === 'detail') {
      setTimeout(() => {
        this.router.navigateByUrl('/app-apply-build-management/detail/' + this.buildId);
      }, 500);
    } else {
      setTimeout(() => {
        this.router.navigateByUrl('/app-apply-build-management');
      }, 500);
    }
    return true;
  }

  // 通过id获得数据
  getDatasById(id): void {
    this.loading = true;
    this.addOrEdit = true;
    this.triggerManual = false;
    this.buildManagementService.getAppsById(id).subscribe(datas => {
      if (datas) {
        this.loading = false;
        this.modelData = datas || [];
        this.buildType = this.modelData.buildType;
        this.buildTypeInit = this.modelData.buildType;
        this.pkgType = '1';
        this.editName = datas.name;
        let pkgNameInit = this.modelData.pkgName.split('.');
        this.modelData.pkgName = pkgNameInit[0];
        //处理构建语言大小写
        if (this.modelData.language === 'nodejs8') {
          this.modelData.language = 'Nodejs8';
        }
        if (this.modelData.language === 'go') {
          this.modelData.language = 'Go';
        }
        // 处理trigger
        if (datas.triggerManual === '1') {
          this.trigger = 2;
          this.handGit = false;
          this.handTime = false;
          this.handCheck = true;
          this.triggerManual = true;
        } else if (datas.triggerPoll != null && datas.triggerPoll !== '') {
          this.trigger = 1;
          this.triggerManual = false;
          this.timeCheckInit = true;
          this.handGit = false;
          this.handTime = true;
          this.handCheck = false;
          this.timeCheck = 'custom';
        } else if (datas.triggerGitevent !== '00000') {
          this.triggerManual = false;
          this.trigger = 0;
          this.handGit = true;
          this.handTime = false;
          this.handCheck = false;
          for (let i = 0; i < datas.triggerGitevent.length; i++) {
            if (datas.triggerGitevent.slice(i, i + 1) === '1') {
              this.checkOptions[i].checked = true;
            }
          }
        }
        this.triggerCope = this.trigger;
        // 处理认证数据
        if (datas.scmUsername !== '' && datas.scmUsername != null) {
          this.check = true;
        }
        // 处理启动参数
        if (datas.cmdOpts !== '' && datas.cmdOpts != null) {
          this.lanuch = true;
          this.launchParm = false;
        }
      }
    });

  }

  // 获得程序包名称数据
  getBinariesList(name: string, runtimeEnv: string): void {
    this.buildManagementService.getBinariesList(name, runtimeEnv).subscribe({
      next: (datas) => {
        this.binariesList = datas || [];
        if (this.binariesList.length > 0) {
          for (let i = 0; i < this.binariesList.length; i++) {
            this.binariesList[i].id = this.binariesList[i].name;
          }
          this.pkgOptions = {
            datas: this.binariesList
          };
          if (this.addOrEdit === true && this.modelData.buildType === 'b2i' && this.modelData.pkgName !== null && this.modelData.pkgName !== '') {
            this.modelData.pkgHasName = this.modelData.pkgName;
            this.modelData.pkgName = '';
            this.modelData.pkgHasVersion = this.modelData.pkgVersion;
            this.modelData.pkgVersion = '';
          } else {
            this.modelData.pkgHasName = this.binariesList[0].name;
          }
        }
      },
      complete: () => {
      }
    });
  }

  // 更新表单'buildType': null,
  updateForm(id) {
    const data = {};
    if (this.timeCheckInit === false && this.trigger === 1) {
      this.minuteStart = this.validateForm.controls['minuteStart'].value;
      this.minuteEnd = this.validateForm.controls['minuteEnd'].value;
      this.hourStart = this.validateForm.controls['hourStart'].value;
      this.hourEnd = this.validateForm.controls['hourEnd'].value;
      switch (this.aimType) {
        case 'minute':
          this.triggerPoll = '0' + ' ' + this.minuteStart + '/' + this.minuteEnd + ' * * * ?';
          break;
        case 'hour':
          this.triggerPoll = '0 0 ' + this.hourStart + '/' + this.hourEnd + ' * * ?';
          break;
        case 'day':
          this.triggerPoll = '0 ' + this.dayDate.toString().slice(19, 21) + ' ' + this.dayDate.toString().slice(16, 18) + ' * * ?';
          break;
        case 'weekend':
          const week = this.validateForm.controls['weekday'].value;
          let weeks = '';
          for (let l = 0; l < week.length; l++) {
            if (l === 6 && week[l].checked === true) {
              weeks += 1 + ',';
            }
            if (week[l].checked === true && l !== 6) {
              weeks += (l + 2) + ',';
            }
          }
          weeks = weeks.slice(0, weeks.length - 1);
          console.log(weeks);
          this.triggerPoll = '0 ' + this.weekDate.toString().slice(19, 21) + ' ' + this.weekDate.toString().slice(16, 18) + ' ? * ' + weeks;
          break;
      }
    } else {
      this.validateForm.setControl('dayDate', new FormControl(null));
      this.validateForm.setControl('minuteStart', new FormControl(null));
      this.validateForm.setControl('minuteEnd', new FormControl(null));
      this.validateForm.setControl('hourStart', new FormControl(null));
      this.validateForm.setControl('hourEnd', new FormControl(null));
      this.validateForm.setControl('weekDate', new FormControl(null));
    }
    // 先检验表单
    for (const l in this.validateForm.controls) {
      if (l) {
        this.validateForm.controls[l].markAsDirty();
        this.validateForm.controls[l].updateValueAndValidity();
      }
    }
    if (this.validateForm.status !== 'VALID') {
      return false;
    }
    // 处理trigger_gitevent数据
    const event = this.validateForm.controls.triggerGitevent.value;
    //  this.validateForm.removeControl('trigger_gitevent');
    let gitEventString = '';
    for (let i = 0; i < event.length; i++) {
      if (event[i].checked === true) {
        gitEventString += '1';
      } else {
        gitEventString += '0';
      }
    }
    for (const i in this.validateForm.controls) {
      if (i) {
        data[i] = this.validateForm.controls[i].value;
      }
    }
    data['triggerGitevent'] = gitEventString;
    // 定时检查时间
    if (this.timeCheckInit === false) {
      data['triggerPoll'] = this.triggerPoll;
    }
    // 处理triggerManual数据
    if (this.triggerManual === true) {
      data['triggerManual'] = '1';
    } else {
      data['triggerManual'] = '0';
    }
    delete data['check'];
    delete data['timeCheck'];
    delete data['periodTime'];
    delete data['weekday'];
    delete data['minuteStart'];
    delete data['minuteEnd'];
    delete data['hourStart'];
    delete data['hourEnd'];
    delete data['dayDate'];
    delete data['weekDate'];
    delete data['handGit'];
    delete data['handTime'];
    delete data['handTime'];
    delete data['launchParams'];
    data['language'] = data['language'].toLowerCase();
    data['jobName'] = this.modelData.jobName;
    data['jobToken'] = this.modelData.jobToken;
    data['lastBuildTime'] = this.modelData.lastBuildTime;
    data['lastBuildStatus'] = this.modelData.lastBuildStatus;
    data['createTime'] = this.modelData.createTime;
    data['Id'] = parseInt(this.modelData.Id);
    if (this.buildType === 'b2i') {
      this.buildManagementService.getBinariesList('', '').subscribe({
        next: (datas) => {
          this.binariesList = datas || [];
          for (let i = 0; i < this.binariesList.length; i++) {
            if (this.pkgType === '0' && this.binariesList[i].name === this.modelData.pkgName) {
              if (this.binariesList[i].binariesVersions[0].path && this.binariesList[i].binariesVersions[0].name) {
                data['pkgUrl'] = this.binariesList[i].binariesVersions[0].path;
                data['pkgName'] = this.binariesList[i].binariesVersions[0].name;
                this.update(id, data);
              } else {
                this.nzMessageService.error('程序包url为空');
              }
            } else if (this.pkgType === '1' && this.binariesList[i].name === this.modelData.pkgHasName) {
              for (let j = 0; j < this.binariesList[i].binariesVersions.length; j++) {
                if (this.binariesList[i].binariesVersions[j].version === this.modelData.pkgHasVersion) {
                  data['pkgUrl'] = this.binariesList[i].binariesVersions[j].path;
                  data['pkgName'] = this.binariesList[i].binariesVersions[j].name;
                  data['pkgVersion'] = this.modelData.pkgHasVersion;
                }
              }
              if (data['pkgUrl'] && data['pkgName']) {
                this.update(id, data);
              } else {
                this.nzMessageService.error('程序包url为空');
              }
            }
          }
        },
        complete: () => {
        }
      });
    }
    else {
      this.update(id, data);
    }
    return true;
  }

  // 更新数据
  update(id: string, data) {
    const mid = this.nzMessageService.loading('正在更新中', {nzDuration: 0}).messageId;
    this.buildManagementService.update(id, data).subscribe(respose => {
      //  this.refreshData(this.ownerId);
      this.nzMessageService.success('更新成功！');
      this.nzMessageService.remove(mid);
      if (this.type === 'detail') {
        setTimeout(() => {
          this.router.navigateByUrl('/app-apply-build-management/detail/' + this.buildId);
        }, 1000);
      } else if (this.type === 'edit') {
        setTimeout(() => {
          this.router.navigateByUrl('/app-apply-build-management');
        }, 1000);
      }
    });
  }

  // url校验
  urlValidator = (control: FormControl): { [s: string]: any } => {
    const EMAIL_REGEXP = /^((ht|f)tps?):\/\/[\w\-]+(\.[\w\-]+)+([\w\-\.,@?^=%&:\/~\+#]*[\w\-\@?^=%&\/~\+#])?$/;
    if (!EMAIL_REGEXP.test(control.value)) {
      return {projectUrl: {message: '请输入正确的项目地址格式!'}};
    }
  };

  // 手动触发校验
  triggerManualValidator = (control: FormControl): { [s: string]: any } => {
    if (this.trigger === 2 && control.value === false) {
      return {triggerManual: {message: '请选择手动检查!'}};
    }
  };

  // time校验
  timeValidator = (control: FormControl): { [s: string]: any } => {
    if (parseInt(control.value) < 1) {
      return {minuteEnd: {message: '间隔分钟大于1'}};
    }
  };

  // 程序包名称校验
  pkgValidator = (control: FormControl): { [s: string]: any } => {
    for (let i = 0; i < this.binariesList.length; i++) {
      if (this.modelData.pkgName == this.binariesList[i].name) {
        return {pkgName: {message: '程序包名称已经存在'}};
      }
    }
  };

  // 构建名称校验
  buildNameValidator = (control: FormControl): { [s: string]: any } => {
    // 判断name是否唯一
    for (let m = 0; m < this.dataName.length; m++) {
      if (this.modelData.name === this.dataName[m].name && this.addOrEdit === false) {
        return {buildName: {message: '构建名称已经存在'}};
      } else if (this.modelData.name === this.dataName[m].name && this.addOrEdit === true) {
        if (this.modelData.name !== this.editName) {
          return {buildName: {message: '构建名称已经存在'}};
        }
      }
    }
  };

  // 暴露端口校验
  exposePortValidator = (control: FormControl): { [s: string]: any } => {
    const EMAIL_REGEXP = /^(([1-9]\d{0,3})|([1-5]\d{4})|(6[0-4]\d{3})|(65[0-4]\d{2})|(655[0-2]\d)|(6553[0-5]))(\s+(([1-9]\d{0,3})|([1-5]\d{4})|(6[0-4]\d{3})|(65[0-4]\d{2})|(655[0-2]\d)|(6553[0-5])))*$/;
    if (!EMAIL_REGEXP.test(control.value)) {
      return {expose: {message: '请按照描述输入暴露端口!'}};
    }
  };

  // 生成路径校验
  artifactPathValidator = (control: FormControl): { [s: string]: any } => {
    const EMAIL_REGEXP = /^(\.)([-a-zA-Z0-9/]*[a-zA-Z0-9])?\/$/;
    if (!EMAIL_REGEXP.test(control.value)) {
      return {artifactName: {message: '请使用相对路径，且相对路径名由字母、数字、/组成、并以/结尾!'}};
    }
  };

  // 输出镜像tag校验
  outImageValidator = (control: FormControl): { [s: string]: any } => {
    const EMAIL_REGEXP = /^[a-z0-9]([._\-\/a-z0-9]*)?$/;
    if (control.value) {
      if (!EMAIL_REGEXP.test(control.value)) {
        return {expose: {message: '只能输入小写字母、数字、点、/、下划线及中横线，以字母或者数字开头!'}};
      }
    }
  };

  // apiToken与projectUrl匹配校验
  apiTokenValidator() {
    if (this.modelData.apiToken && this.modelData.projectUrl) {
      const data = {};
      data['apiToken'] = this.modelData.apiToken;
      data['projectUrl'] = this.modelData.projectUrl;
      this.isLoadingTest = true;
      // this.userNum = 1;
      this.buildManagementService.apiTokenValidator(data).subscribe(data => {
        this.isLoadingTest = false;
        this.resultNum = data.resultNum;
        if (data.resultNum !== 0) {
          this.apiMessage = data.errorInfo;
        } else if (data.resultNum === 0) {
          this.apiMessage = '测试成功';
        }
        if (data.branches.length < 1) {
          this.errorMessage = data.errorInfo;
        } else if (data.branches.length > 0) {
          this.branchOption = [];
          for (let i = 0; i < data.branches.length; i++) {
            this.branchOption.push({'value': data.branches[i].name, 'label': data.branches[i].name});
          }
        }
      });
    }
  };

  // 获得分支
  getBranch() {
    this.branchInput = false;
    this.isLoadingBranch = true;
    if (this.testCode === false) {
      const data = {};
      data['apiToken'] = this.modelData.apiToken;
      data['projectUrl'] = this.modelData.projectUrl;
      this.isLoadingBranch = true;
      this.buildManagementService.apiTokenValidator(data).subscribe(data => {
        setTimeout(() => {
          this.isLoadingBranch = false;
        }, 500);
        this.errorNum = data.resultNum;
        if (data.branches.length < 1) {
          this.errorMessage = data.errorInfo;
        } else if (data.branches.length > 0) {
          this.branchOption = [];
          for (let i = 0; i < data.branches.length; i++) {
            this.branchOption.push({'value': data.branches[i].name, 'label': data.branches[i].name});
          }
        }
      });
    } else {
      setTimeout(() => {
        this.isLoadingBranch = false;
      }, 1000);
    }
  }

  //一键构建
  autoWrite() {
    this.modelData = {
      'Id': this.modelData.Id,
      'name': 'springdemo',
      'scmType': 'GitLab',
      'apiToken': 'yb6bhTWiphSZryKCFKUr',
      'projectUrl': 'http://git.inspur.com/yangke02/MongoTools.git',
      'branchName': 'master',
      'scmUsername': null,
      'scmPassword': null,
      'language': 'java8',
      'buildScript': 'mvn package',
      'buildTool': 'maven',
      'triggerGitevent': null,
      'triggerPoll': null,
      'triggerManual': 0,
      'artifactName': 'boot-angular-1.0-SNAPSHOT.jar',
      'artifactPath': './build/libs/',
      'baseImage': 'jdk8_tomcat8',
      'outputImageName': 'springdemo',
      'cmdOpts': '',
      'namespace': null,
      'jobName': null,
      'jobToken': null,
      'lastBuildTime': null,
      'createTime': null,
      'lastBuildStatus': null,
      'pkgName': null,
      'pkgVersion': null,
      'buildType': this.buildType,
      'exposePort': '8080',
      'pkgHasName': null,
      'pkgHasVersion': null
    };
    this.trigger = 2;
  }

  // 构建模式转变
  switchForm(value) {
    if (value === 's2i') {
      this.buildType = 's2i';
      this.codeBuild();
    } else if (value === 'b2i') {
      this.buildType = 'b2i';
      this.packageBuild();
    } else if (value === 's2b') {
      this.buildType = 's2b';
      this.codeToPackage();
    }
  }

  // 从程序包构建镜像
  packageBuild() {
    this.validateForm.setControl('scmUsername', new FormControl(null));
    this.validateForm.setControl('scmPassword', new FormControl(null));
    this.validateForm.setControl('scmType', new FormControl(null));
    this.validateForm.setControl('projectUrl', new FormControl(null));
    this.validateForm.setControl('branchName', new FormControl(null));
    this.validateForm.setControl('buildTool', new FormControl(null));
    this.validateForm.setControl('buildScript', new FormControl(null));
    this.validateForm.setControl('artifactPath', new FormControl(null));
    this.validateForm.setControl('artifactName', new FormControl(null));
    this.validateForm.setControl('outputImageName', new FormControl(null, [Validators.required, this.outImageValidator]));
    this.validateForm.setControl('exposePort', new FormControl(null, [Validators.required, this.exposePortValidator]));
    this.validateForm.setControl('pkgName', new FormControl(null, [Validators.required, this.pkgValidator]));
    this.validateForm.setControl('pkgVersion', new FormControl(null, Validators.required));
    this.validateForm.setControl('fileName', new FormControl(null, Validators.required));
    this.triggerCope = this.trigger;
    this.trigger = -1;
    this.baseImages = [
      {id: 'spring_boot', name: 'spring_boot'},
      {id: 'jdk7_tomcat7', name: 'jdk7_tomcat7'},
      {id: 'jdk8_tomcat8', name: 'jdk8_tomcat8'}
    ];
    this.imageOptions = {
      datas: this.baseImages
    };
    this.getBinariesList('', '');
    this.uploader.onAfterAddingFile = this.afterAddFile();
    this.uploader.onSuccessItem = this.onSuccessItem();
    this.uploader.onErrorItem = this.onErrorItem();
  }

  // 源代码构建镜像
  codeBuild() {
    this.validateForm.setControl('scmType', new FormControl(null, Validators.required));
    this.validateForm.setControl('projectUrl', new FormControl(null, [Validators.required, this.urlValidator]));
    this.validateForm.setControl('branchName', new FormControl(null, Validators.required));
    this.validateForm.setControl('buildTool', new FormControl(null, Validators.required));
    this.validateForm.setControl('apiToken', new FormControl(null, Validators.required));
    this.validateForm.setControl('buildScript', new FormControl(null, Validators.required));
    this.validateForm.setControl('artifactPath', new FormControl(null, [Validators.required, this.artifactPathValidator]));
    this.validateForm.setControl('artifactName', new FormControl(null, Validators.required));
    this.validateForm.setControl('outputImageName', new FormControl(null, [Validators.required, this.outImageValidator]));
    this.validateForm.setControl('exposePort', new FormControl(null, [Validators.required, this.exposePortValidator]));
    this.validateForm.setControl('pkgName', new FormControl(null));
    this.validateForm.setControl('pkgVersion', new FormControl(null));
    this.validateForm.setControl('fileName', new FormControl(null));
    if (this.triggerCope) {
      this.trigger = this.triggerCope;
    }
  }

  // 源代码构建程序包
  codeToPackage() {
    this.validateForm.setControl('scmType', new FormControl(null, Validators.required));
    this.validateForm.setControl('projectUrl', new FormControl(null, [Validators.required, this.urlValidator]));
    this.validateForm.setControl('apiToken', new FormControl(null, Validators.required));
    this.validateForm.setControl('branchName', new FormControl(null, Validators.required));
    this.validateForm.setControl('buildTool', new FormControl(null, Validators.required));
    this.validateForm.setControl('buildScript', new FormControl(null, Validators.required));
    this.validateForm.setControl('artifactPath', new FormControl(null, [Validators.required, this.artifactPathValidator]));
    this.validateForm.setControl('artifactName', new FormControl(null, Validators.required));
    this.validateForm.setControl('outputImageName', new FormControl(null));
    this.validateForm.setControl('exposePort', new FormControl(null));
    this.validateForm.setControl('pkgName', new FormControl(null));
    this.validateForm.setControl('pkgVersion', new FormControl(null));
    this.validateForm.setControl('fileName', new FormControl(null));
    if (this.triggerCope) {
      this.trigger = this.triggerCope;
    }
  }

  // 上传保存之后
  afterAddFile(): any {
    return (fileItem: FileItem) => {
      this.fileName = fileItem._file.name;
      this.fileItem = fileItem;
    };
  }

  // 上传成功
  onSuccessItem(): any {
    return (item: FileItem, response: string, status: number, headers: ParsedResponseHeaders) => {
      this.nzMessageService.success('上传成功！');
      this.nzMessageService.remove(this.uploadMid);
      this.isUploadEnd = true;
    };
  }

  // 上传失败
  onErrorItem(): any {
    return (item: FileItem, response: string, status: number, headers: ParsedResponseHeaders) => {
      this.nzMessageService.error('上传失败！');
      this.nzMessageService.remove(this.uploadMid);
      this.isUploadEnd = true;
    };
  }

  // 上传
  save(): boolean {
    this.isUploadEnd = false;
    let b;
    let params: any = {};
    let url = '/apis/apps/v1/binaries';
    b = this.pkgValidForm();
    params = {
      name: this.modelData.pkgName,
      version: this.modelData.pkgVersion
    };
    if (b) {
      this.uploader.setOptions({
        url: url,
        method: 'POST',
        itemAlias: 'file',
        additionalParameter: params,
        headers: [
          {name: 'Authorization', value: 'bearer ' + this.getToken()}
        ],
      });
      this.uploadMid = this.nzMessageService.loading('正在上传程序包', {nzDuration: 0}).messageId;
      this.uploader.uploadItem(this.fileItem);
    }
    return b;
  }

  getToken(): string {
    let token = '';
    const name = 'iotToken=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      const c = ca[i].trim();
      if (c.indexOf(name) === 0) {
        token = c.substring(name.length, c.length);
      }
    }
    return token;
  }

  // 软件包校验
  pkgValidForm(): boolean {
    if (this.modelData.pkgName == null || this.modelData.pkgName === '') {
      this.validateForm.controls['pkgName'].markAsDirty();
      this.validateForm.controls['pkgName'].updateValueAndValidity();
      return false;
    }
    if (this.modelData.pkgVersion == null || this.modelData.pkgVersion === '') {
      this.validateForm.controls['pkgVersion'].markAsDirty();
      this.validateForm.controls['pkgVersion'].updateValueAndValidity();
      return false;
    }
    if (this.fileName == null || this.fileName === '') {
      this.validateForm.controls['fileName'].markAsDirty();
      this.validateForm.controls['fileName'].updateValueAndValidity();
      return false;
    }
    return true;
  }

  // 软件包名称版本级联
  pkgNameChange(value) {
    let version = [];
    for (let i = 0; i < this.binariesList.length; i++) {
      if (this.binariesList[i].name === value) {
        version = this.binariesList[i].binariesVersions;
      }
    }
    if (version.length > 0) {
      for (let i = 0; i < version.length; i++) {
        version[i].id = version[i].version;
        version[i].name = version[i].version;
      }
      this.versionOptions = {
        datas: version
      };
      if (this.modelData.pkgHasVersion == null || this.addOrEdit === false) {
        this.modelData.pkgHasVersion = version[0].version;
      }
    }
  }

  // 上传方式联动
  pkgTypeChange(value) {
    if (value === '0') {
      this.validateForm.setControl('pkgName', new FormControl(null, [Validators.required, CuValidators.nameEn, this.pkgValidator]));
      this.validateForm.setControl('pkgVersion', new FormControl(null, [Validators.required, CuValidators.version]));
      this.validateForm.setControl('fileName', new FormControl(null, Validators.required));
    } else if (value === '1') {
      this.validateForm.setControl('pkgName', new FormControl(null));
      this.validateForm.setControl('pkgVersion', new FormControl(null));
      this.validateForm.setControl('fileName', new FormControl(null));
    }
  }

  ngOnInit() {
    this.validateForm = this.fb.group({
      name: [null, [Validators.required, this.buildNameValidator, CuValidators.nameEn]],
      scmType: [null, [Validators.required]],
      projectUrl: [null, [Validators.required, this.urlValidator]],
      branchName: [null, [Validators.required]],
      check: [null],
      apiToken: [null,[Validators.required]],
      scmUsername: [null, [Validators.required]],
      scmPassword: [null, [Validators.required]],
      language: [null, [Validators.required]],
      buildTool: [null, [Validators.required]],
      buildScript: [null, [Validators.required]],
      triggerGitevent: [null],
      triggerPoll: [null],
      triggerManual: [null, [this.triggerManualValidator]],
      artifactName: [null, [Validators.required]],
      artifactPath: [null, [Validators.required]],
      baseImage: [null],
      outputImageName: [null, [Validators.required]],
      launchParams: [null],
      cmdOpts: [null],
      timeCheck: [null],
      periodTime: [null],
      weekday: [null],
      minuteStart: [null, [Validators.required]],
      minuteEnd: [null, [Validators.required]],
      hourStart: [null, [Validators.required]],
      hourEnd: [null, [Validators.required]],
      dayDate: [null, [Validators.required]],
      weekDate: [null, [Validators.required]],
      handTime: [null],
      handGit: [null],
      handCheck: [null],
      buildType: [null],
      pkgName: [null],
      pkgVersion: [null],
      fileName: [null],
      exposePort: [null, [Validators.required]],
      pkgType: [null],
      pkgHasName: [null],
      pkgHasVersion: [null]
    });
    this.typeOptions = {
      datas: this.scmList
    };
    this.buildOptions = {
      datas: this.buildList
    };
    this.languageOptions = {
      datas: this.languageList
    };
    this.toolOptions = {
      datas: this.toolList
    };
    this.imageOptions = {
      datas: this.baseImages
    };
    this.pkgOptions = {
      datas: this.binariesList
    };
    this.pkgTypeOptions = {
      datas: this.pkgTypeList
    };
    this.versionOptions = {
      datas: this.versionList
    };
    this.buildId = this.activatedRoute.snapshot.params['id'];
    this.type = this.activatedRoute.snapshot.params['type'];
    if (this.buildId) {
      this.getDatasById(this.buildId);
      this.branchInput = true;
    } else {
      this.initAdd();
    }
    this.getData();
  }

  ngOnChanges() {
  }
}

import {Component, OnChanges, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {NzMessageService} from 'ng-zorro-antd';
import {Router, ActivatedRoute} from '@angular/router';
import {PipelineManagementService} from '../pipeline-management.service';
import {NziModalService, CuValidators} from 'ng-zorro-iop';

@Component({
  selector: 'app-apply-pipeline-add',
  templateUrl: './pipeline-add.component.html',
  styleUrls: ['./pipeline-add.component.css']
})

export class PipelineAddComponent implements OnInit, OnChanges {
  @ViewChild('NziFormComponent') NziFormComponent;
  @ViewChild('NziStageFormComponent') NziStageFormComponent;

  constructor(private fb: FormBuilder,
              private pipelineManagementService: PipelineManagementService,
              private nzMessageService: NzMessageService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private nzModalService: NziModalService) {
  }

  pipelineId;
  validateForm: FormGroup;
  validateStageForm: FormGroup;
  editData = {
    'Id': null,
    'name': '',
    'constructId': '',
    'stages': []
  };
  buildType;
  buildList = []; // 构建列表
  codeCheckList = []; // 代码审查列表
  addOrEdit = 0; //  0:创建时 1:编辑时
  pageIndex = 1; //  stage当前页
  pageTotal = 1; //  stage总页数
  pageStage = [];
  stageAllData = []; //  节点的总数据
  judgeIndex = 0; //  以4为单位计数
  addOrNot = true; //  判断创捷节点form表单是否输入准确
  editOrNot = false; //  编辑时候css样式
  addStyle = false; //  增加节点时css样式
  deleteOrNot = false; //  删除节点操作标志
  stageIndex = 0; //  stage当前的index
  m = 1;
  typeInit = -1;
  node: any[] = [[]]; //  装填节点数据
  stageRow; //  stage二维数组当前行列
  stageColumn;
  stageData = {  //  单个节点数据
    'name': '',
    'type': '',
    'index': 0,
    'imageTag': '',
    'timeout': '',
    'timeoutTest': '',
    'constructId': '',
    'typeIndex': 0,
    'codeCheckId': '',
    'codeCheckName': '',
    'script': ''
  };
  stageList = [
    {id: 'constructId', name: 'Build', disabled: false},
    {id: 'imageTag', name: 'TagAndDeploy', disabled: false},
    {id: 'timeoutTest', name: 'Test', disabled: false},
    {id: 'timeout', name: 'ManualOperation', disabled: false},
    {id: 'script', name: 'Script', disabled: false},
    {id: 'codeCheckId', name: 'CodeCheck', disabled: true}
  ];
  errorStyle = false; // 检验节点输入
  TagAndDeployIndex = 0; // name 总个数
  TestIndex = 0;
  ManualOperationIndex = 0;
  TagAndDeployNumber = 0; //name 要显示序号
  TestNumber = 0;
  ManualOperationNumber = 0;
  ScriptNumber = 0;
  col = -1; // 行
  row = -1; // 列
  loading = true;
  codeCheckLoading;
  pipelineNameLoading = true;
  pipelineList = [];
  editName; // 编辑时候的名字
  clickNumber = 0; // 设置点击次数，两秒内点击多次不生效
  s2bOrNot = false; // the build that whether is Source2Binary

  //  获得构建数据
  getDatas(): void {
    this.loading = true;
    this.pipelineManagementService.getApps().subscribe(datas => {
      if (datas) {
        this.buildList = datas || [];
        this.loading = false;
        if (this.buildList.length < 1) {
          this.nzMessageService.warning('请先创建构建信息！');
        }
      } else {
        this.loading = false;
        this.nzMessageService.warning('请先创建构建信息！');
      }
    });
  }

  // 获得本地流水线数据
  getLocalPipeline() {
    this.pipelineNameLoading = true;
    this.pipelineManagementService.getLocalPipeline().subscribe(data => {
      this.pipelineNameLoading = false;
      this.pipelineList = data;
    });
  }

  // 获得代码检查信息
  getCodeData(name) {
    let id, pipeId;
    for (let i = 0; i < this.buildList.length; i++) {
      if (name === this.buildList[i].name) {
        id = this.buildList[i].Id;
        if (this.buildList[i].buildType === 's2b') {
          this.s2bOrNot = true;
        } else {
          this.s2bOrNot = false;
        }
      }
    }
    if (this.addOrEdit === 0 || id !== this.editData.constructId) {
      pipeId = 0;
    } else {
      pipeId = this.pipelineId;
    }
    if (id) {
      this.codeCheckList = [];
      this.codeCheckLoading = true;
      this.pipelineManagementService.getCodeData(id, pipeId).subscribe(data => {
        this.codeCheckLoading = false;
        this.codeCheckList = data || [];
        for (let i = 0; i < this.stageAllData.length; i++) {
          if (this.stageAllData[i].type === 'CodeCheck') {
            let codeCheck = [];
            for (let j = 0; j < this.codeCheckList.length; j++) {
              codeCheck.push(this.codeCheckList[j].Id);
            }
            if (codeCheck.indexOf(this.stageAllData[i].codeCheckId) === -1) {
              this.stageAllData[i]['message'] = false;
              this.errorStyle = true;
              this.nzMessageService.warning('请重新选择代码检查');
            }
          }
        }
      });
    }
  }

  // 匹配构建Id
  getData(): void {
    this.pipelineManagementService.getApps().subscribe(datas => {
      if (datas) {
        this.buildList = datas || [];
        this.loading = false;
        if (this.stageAllData.length > 0) {
          for (let i = 0; i < this.stageAllData.length; i++) {
            if (this.stageAllData[i].type === 'Build') {
              for (let j = 0; j < datas.length; j++) {
                if (this.editData.constructId === datas[j].Id) {
                  this.stageAllData[i]['constructId'] = datas[j].name;
                }
              }
            } else {
              this.stageAllData[i]['constructId'] = '';
            }
          }
        } else {
          this.nzMessageService.warning('流水线相关构建信息已删除无法编辑！');
        }
      } else {
        this.loading = false;
        this.nzMessageService.warning('流水线相关构建信息已删除无法编辑！');
      }
    });
  }

  // 匹配代码审查id
  getEditCodeData(id) {
    this.codeCheckLoading = true;
    this.pipelineManagementService.getCodeData(id, this.editData.Id).subscribe(data => {
      this.codeCheckLoading = false;
      this.codeCheckList = data || [];
      if (this.stageAllData.length > 0) {
        for (let i = 0; i < this.stageAllData.length; i++) {
          if (this.stageAllData[i].type === 'CodeCheck') {
            for (let j = 0; j < data.length; j++) {
              if (this.stageAllData[i].codeCheckId === data[j].Id) {
                this.stageAllData[i]['codeCheckName'] = data[j].name;
              }
            }
          } else {
            this.stageAllData[i]['codeCheckName'] = '';
          }
        }
      }
    });
  }

  // 通过id 获得一条pipeline数据
  getPipeLineDataById(id) {
    this.judgeIndex = 0;
    this.addOrEdit = 1;
    this.editOrNot = false;
    this.pipelineManagementService.getPipelineById(id).subscribe(datas => {
      if (datas) {
        this.editData = datas;
        this.editName = this.editData.name;
        this.node = [[]];
        this.pageStage = [];
        this.judgeIndex = 0;
        this.m = 1;
        //  this.editData.constructId = this.buildList;
        this.stageAllData = this.editData.stages;
        for (let i = 0; i < this.stageAllData.length; i++) {
          if (this.stageAllData[i].type === 'Test') {
            this.stageAllData[i].timeoutTest = this.stageAllData[i].timeout;
          }
        }
        this.autoStageName();
        this.getData();
        this.getEditCodeData(this.editData.constructId);
        this.pageIndex = 1;
        this.stageAllData.splice(0, 0, 'start');
        this.stageAllData.splice(this.stageAllData.length, 0, 'end');
        this.pageTotal = Math.ceil(this.stageAllData.length / 8);
        if (this.pageIndex < this.pageTotal) {
          this.pageStage = this.stageAllData.slice((this.pageIndex - 1) * 8, this.pageIndex * 8);
        } else if (this.pageIndex === this.pageTotal) {
          this.pageStage = this.stageAllData.slice((this.pageIndex - 1) * 8, this.stageAllData.length);
        }
        if (this.stageAllData) {
          //  把节点赋值给二维数组，以便循环排列
          for (let i = 0; i < this.pageStage.length; i++) {
            this.judgeIndex++;
            if (this.judgeIndex > 4) {
              this.judgeIndex = 1;
              this.m++;
            }
          }
          for (let i = 0; i < this.m; i++) {
            this.node[i] = this.pageStage.slice(i * 4, 4 * (i + 1));
          }
          this.stageAllData.splice(0, 1);
          this.stageAllData.splice(this.stageAllData.length - 1, 1);
          this.stageData = this.node[0][1];
        }
      }
    });
  }

  handleOk() {
    ++this.clickNumber;
    // 设置两秒内不能重复点击;
    setTimeout(() => {
      this.clickNumber = 0;
    }, 2000);
    if (this.clickNumber > 1) {
      return false;
    }
    if (this.addOrEdit === 0) {
      const isSuccess: boolean = this.submitForm();
      return !isSuccess;
    } else if (this.addOrEdit === 1) {
      const isSuccess: boolean = this.editSubmitForm(this.pipelineId);
      return !isSuccess;
    }
  }

  handleCancel() {
    const isSuccess: boolean = this.resetForm();
    return !isSuccess;
  }

  // 提交表单数据
  submitForm() {
    //  在stage显示界面时候操作
    const data = {};
    let stage = {};
    //  先检验表单
    for (const i in this.validateForm.controls) {
      if (i) {
        this.validateForm.controls[i].markAsDirty();
        this.validateForm.controls[i].updateValueAndValidity();
      }
    }
    if (this.validateForm.status !== 'VALID') {
      return false;
    }
    for (const i in this.validateForm.controls) {
      if (i) {
        data[i] = this.validateForm.controls[i].value;
      }
    }
    if (this.messageRight() === false) {
      return false;
    }
    for (let i = 0; i < this.stageAllData.length; i++) {
      if (this.stageAllData[i].timeout) {
        this.stageAllData[i].timeout = parseInt(this.stageAllData[i].timeout, 10);
      } else {
        this.stageAllData[i].timeout = 0;
      }
      // 处理构建
      if (this.stageAllData[i].constructId) {
        for (let j = 0; j < this.buildList.length; j++) {
          if (this.stageAllData[i].constructId === this.buildList[j].name) {
            data['constructId'] = this.buildList[j].Id;
          }
        }
      }
      this.stageAllData[i].codeCheckId = parseInt(this.stageAllData[i].codeCheckId);
    }
    stage = this.stageAllData;
    data['stages'] = stage;
    this.create(data);
    return true;
  }

  //  编辑表单数据
  editSubmitForm(id) {
    const data = {};
    let stage = {};
    for (const i in this.validateForm.controls) {
      if (i) {
        this.validateForm.controls[i].markAsDirty();
        this.validateForm.controls[i].updateValueAndValidity();
      }
    }
    if (this.validateForm.status !== 'VALID') {
      return false;
    }
    for (const i in this.validateForm.controls) {
      if (i) {
        data[i] = this.validateForm.controls[i].value;
      }
    }
    if (this.messageRight() === false) {
      return false;
    }
    for (let i = 0; i < this.stageAllData.length; i++) {
      if (this.stageAllData[i].timeout) {
        this.stageAllData[i].timeout = parseInt(this.stageAllData[i].timeout, 10);
      } else {
        this.stageAllData[i].timeout = 0;
      }
      // 处理构建
      if (this.stageAllData[i].constructId) {
        for (let j = 0; j < this.buildList.length; j++) {
          if (this.stageAllData[i].constructId === this.buildList[j].name) {
            data['constructId'] = this.buildList[j].Id;
          }
        }
      }
      this.stageAllData[i].codeCheckId = parseInt(this.stageAllData[i].codeCheckId);
    }
    stage = this.stageAllData;
    data['stages'] = stage;
    data['Id'] = parseInt(id, 10);
    this.update(id, data);
    return true;
  }

  //  取消新建流水线
  resetForm() {
    this.validateForm.reset();
    for (const key in this.validateForm.controls) {
      if (key) {
        this.validateForm.controls[key].markAsPristine();
        this.validateForm.controls[key].updateValueAndValidity();
      }
    }
    this.resetStageForm();
    setTimeout(() => {
      this.router.navigateByUrl('/app-apply-pipeline-management');
    });
    return true;
  }

  resetStageForm() {
    this.validateStageForm.reset();
    for (const key in this.validateStageForm.controls) {
      if (key) {
        this.validateStageForm.controls[key].markAsPristine();
        this.validateStageForm.controls[key].updateValueAndValidity();
      }
    }
  }

  // 创建pipeline
  create(data) {
    const mid = this.nzMessageService.loading('正在创建中', {nzDuration: 0}).messageId;
    this.pipelineManagementService.create(data).subscribe(respose => {
      //  this.refreshData(this.ownerId);
      this.nzMessageService.success('创建成功！');
      this.nzMessageService.remove(mid);
      setTimeout(() => {
        this.router.navigateByUrl('/app-apply-pipeline-management');
      }, 10);
    });
  }

  // 更新pipeline
  update(id: string, data) {
    const mid = this.nzMessageService.loading('正在更新中', {nzDuration: 0}).messageId;
    this.pipelineManagementService.update(id, data).subscribe(respose => {
      //  this.refreshData(this.ownerId);
      this.nzMessageService.success('更新成功！');
      this.nzMessageService.remove(mid);
      setTimeout(() => {
        this.router.navigateByUrl('/app-apply-pipeline-management');
      }, 10);
    });
  }

  //  判断前端数据输入
  getFormControl(name) {
    return this.validateForm.controls[name];
  }

  // pipeline名称数据校验
  getInvalidMessage(name) {
    return this.NziFormComponent.getInvalidMessage(name);
  }

  // 输入部分数据校验
  getFormStageControl(name) {
    return this.NziStageFormComponent.getInvalidMessage(name);
  }

  // 增加addStage
  addStage(index, n, i) {
    this.addTypeIndex(); // 初始化typeIndex值
    this.editOrNot = false;
    this.addStyle = true;
    this.judgeIndex = 0;
    this.m = 1;
    this.stageIndex = index + 1;
    this.deleteOrNot = false;
    this.stageData = {
      'name': '',
      'type': '',
      'index': 0,
      'imageTag': '',
      'timeout': '',
      'timeoutTest': '',
      'constructId': '',
      'typeIndex': 0,
      'codeCheckId': '',
      'codeCheckName': '',
      'script': ''
    };
    this.validateStageForm.reset();
    //  先生成一个节点
    this.stageOk(index, n, i);
  }

  //  删除Stage
  deleteStage(index: number) {
    this.nzModalService.confirm({
      nzTitle: '删除',
      nzContentTitle: '你是否确认要删除节点',
      nzContent: '<b>删除操作无法回滚，请谨慎操作</b>',
      nzOnOk: () => {
        this.delete(index);
      },
      nzOnCancel: () => {
      }
    });
  }

  // 删除节点
  delete(index) {
    this.editOrNot = true;
    this.deleteOrNot = true;
    this.judgeIndex = 0;
    this.m = 1;
    this.stageAllData.splice(index, 1);
    if (index === this.stageIndex && this.stageAllData.length > 0) {
      if (index > 0) {
        this.stageData = this.stageAllData[index - 1];
        this.stageIndex = index - 1;
      } else {
        this.stageIndex = 0;
        this.stageData = this.stageAllData[0];
      }
    } else if (index < this.stageIndex) {
      --this.stageIndex;
    }

    for (let i = index; i < this.stageAllData.length; i++) {
      this.stageAllData[i].index = i;
    }
    this.node = [[]];
    this.pageStage = [];
    // 给总的节点增加开始、结束两个节点在页面中显示
    this.stageAllData.splice(0, 0, 'start');
    this.stageAllData.splice(this.stageAllData.length, 0, 'end');
    this.pageTotal = Math.ceil(this.stageAllData.length / 8);
    if (this.pageIndex < this.pageTotal) {
      this.pageStage = this.stageAllData.slice((this.pageIndex - 1) * 8, this.pageIndex * 8);
    } else if (this.pageIndex === this.pageTotal) {
      this.pageStage = this.stageAllData.slice((this.pageIndex - 1) * 8, this.stageAllData.length);
    } else if (this.pageIndex > this.pageTotal) {
      this.pageIndex--;
      this.pageStage = this.stageAllData.slice((this.pageIndex - 1) * 8, this.stageAllData.length);
    }
    //  把节点赋值给二维数组，以便循环排列
    for (let i = 0; i < this.pageStage.length; i++) {
      this.judgeIndex++;
      if (this.judgeIndex > 4) {
        this.judgeIndex = 0;
        this.m++;
      }
    }
    for (let i = 0; i < this.m; i++) {
      this.node[i] = this.pageStage.slice(i * 4, 4 * (i + 1));
    }
    this.stageAllData.splice(0, 1);
    this.stageAllData.splice(this.stageAllData.length - 1, 1);
    //  处理节点逻辑
    let type = [];
    for (let l = 0; l < this.stageAllData.length; l++) {
      type.push(this.stageAllData[l].type);
    }
    if (this.stageData.type === 'Build') {
      this.stageList = [
        {id: 'constructId', name: 'Build', disabled: false},
        {id: 'imageTag', name: 'TagAndDeploy', disabled: false},
        {id: 'timeoutTest', name: 'Test', disabled: false},
        {id: 'timeout', name: 'ManualOperation', disabled: false},
        {id: 'script', name: 'Script', disabled: false}
      ];
    } else if (this.stageData.type === 'CodeCheck' && type.indexOf('Build') > -1) {
      if (this.s2bOrNot === false) {
        this.stageList = [
          {id: 'imageTag', name: 'TagAndDeploy', disabled: false},
          {id: 'timeoutTest', name: 'Test', disabled: false},
          {id: 'timeout', name: 'ManualOperation', disabled: false},
          {id: 'codeCheckId', name: 'CodeCheck', disabled: false},
          {id: 'script', name: 'Script', disabled: false}
        ];
      } else {
        this.stageList = [
          {id: 'timeoutTest', name: 'Test', disabled: false},
          {id: 'timeout', name: 'ManualOperation', disabled: false},
          {id: 'codeCheckId', name: 'CodeCheck', disabled: false},
          {id: 'script', name: 'Script', disabled: false}
        ];
      }
    } else {
      this.stageListDeal();
    }
    this.stageErrorMessage();
  }

  //  编辑Stage
  editStage(n, i, index: number) {
    this.errorStyle = false;
    this.stageData = this.node[n][i];
    // 处理节点顺序与显示
    let type = [];
    for (let l = 0; l < this.stageAllData.length; l++) {
      type.push(this.stageAllData[l].type);
    }
    if (this.stageData.type === 'Build') {
      this.stageList = [
        {id: 'constructId', name: 'Build', disabled: false},
        {id: 'imageTag', name: 'TagAndDeploy', disabled: false},
        {id: 'timeoutTest', name: 'Test', disabled: false},
        {id: 'timeout', name: 'ManualOperation', disabled: false},
        {id: 'script', name: 'Script', disabled: false}
      ];
    } else if (this.stageData.type === 'CodeCheck' && type.indexOf('Build') > -1) {
      if (this.s2bOrNot === false) {
        this.stageList = [
          {id: 'imageTag', name: 'TagAndDeploy', disabled: false},
          {id: 'timeoutTest', name: 'Test', disabled: false},
          {id: 'timeout', name: 'ManualOperation', disabled: false},
          {id: 'codeCheckId', name: 'CodeCheck', disabled: false},
          {id: 'script', name: 'Script', disabled: false}
        ];
      } else {
        this.stageList = [
          {id: 'timeoutTest', name: 'Test', disabled: false},
          {id: 'timeout', name: 'ManualOperation', disabled: false},
          {id: 'codeCheckId', name: 'CodeCheck', disabled: false},
          {id: 'script', name: 'Script', disabled: false}
        ];
      }
    } else {
      this.stageListDeal();
    }

    this.stageIndex = index;
    this.stageRow = n;
    this.editOrNot = true;
    this.addStyle = false;
    this.deleteOrNot = false;
    this.stageColumn = i;
  }

  // stage提交
  stageOk(index, n, i) {
    const isSuccess: boolean = this.submitStageForm(index, n, i);
    return !isSuccess;
  }

  // 增加节点
  submitStageForm(index, n, i) {
    if (this.addOrNot === true) {
      this.stageData.index = index + 1;
      this.stageAllData.splice(index + 1, 0, this.stageData);
      for (let l = index + 1; l < this.stageAllData.length; l++) {
        this.stageAllData[l].index = l;
      }
      this.node = [[]];
      this.pageStage = [];
      // 处理分页
      if (n === 1 && i === 3) {
        this.pageIndex++;
      }
      // 给总的节点增加开始、结束两个节点在页面中显示

      this.stageAllData.splice(0, 0, 'start');
      this.stageAllData.splice(this.stageAllData.length, 0, 'end');
      this.pageTotal = Math.ceil(this.stageAllData.length / 8);
      if (this.pageIndex < this.pageTotal) {
        this.pageStage = this.stageAllData.slice((this.pageIndex - 1) * 8, this.pageIndex * 8);
      } else if (this.pageIndex === this.pageTotal) {
        this.pageStage = this.stageAllData.slice((this.pageIndex - 1) * 8, this.stageAllData.length);
      } else if (this.pageIndex > this.pageTotal) {
        this.pageIndex--;
        this.pageStage = this.stageAllData.slice((this.pageIndex - 1) * 8, this.stageAllData.length);
      }
      // 把节点赋值给二维数组，以便循环排列
      for (let l = 0; l < this.pageStage.length; l++) {
        this.judgeIndex++;
        if (this.judgeIndex > 4) {
          this.judgeIndex = 1;
          this.m++;
        }
      }
      for (let l = 0; l < this.m; l++) {
        this.node[l] = this.pageStage.slice(l * 4, 4 * (l + 1));
      }
      this.stageAllData.splice(0, 1);
      this.stageAllData.splice(this.stageAllData.length - 1, 1);
    }

    // 设置build节点只能创建一个
    this.stageListDeal();
    return true;
  }

  // setShadow设置样式
  setShadow(index) {
    // 流水线编辑进来让其第一个有阴影
    if (this.addStyle === false && this.editOrNot === false
      && this.deleteOrNot === false && index === 0) {
      const styles = {
        '-moz-box-shadow': '0 0 0 2px rgba(24, 144, 255, 0.2)',
        '-webkit-box-shadow': '0 0 0 2px rgba(24, 144, 255, 0.2)',
        'box-shadow': '0 0 0 2px rgba(24, 144, 255, 0.2)',
        'border-color': '#40a9ff'
      };
      return styles;
    }
    // 只有一个节点
    if (this.stageAllData.length === 1) {
      const styles = {
        '-moz-box-shadow': '0 0 0 2px rgba(24, 144, 255, 0.2)',
        '-webkit-box-shadow': '0 0 0 2px rgba(24, 144, 255, 0.2)',
        'box-shadow': '0 0 0 2px rgba(24, 144, 255, 0.2)',
        'border-color': '#40a9ff'
      };
      return styles;
    }
    // 编辑时候
    if (this.editOrNot === true && this.stageIndex === index) {
      const styles = {
        '-moz-box-shadow': this.editOrNot ? '0 0 0 2px rgba(24, 144, 255, 0.2)' : 'none',
        '-webkit-box-shadow': this.editOrNot ? '0 0 0 2px rgba(24, 144, 255, 0.2)' : 'none',
        'box-shadow': this.editOrNot ? '0 0 0 2px rgba(24, 144, 255, 0.2)' : 'none',
        'border-color': this.editOrNot ? '#40a9ff' : 'none'
      };
      return styles;
    }
    // 增加时候
    if (this.addStyle === true && index === this.stageIndex) {
      const styles = {
        '-moz-box-shadow': this.addStyle ? '0 0 0 2px rgba(24, 144, 255, 0.2)' : 'none',
        '-webkit-box-shadow': this.addStyle ? '0 0 0 2px rgba(24, 144, 255, 0.2)' : 'none',
        'box-shadow': this.addStyle ? '0 0 0 2px rgba(24, 144, 255, 0.2)' : 'none',
        'border-color': this.addStyle ? '#40a9ff' : 'none'
      };
      return styles;
    }
  }

  //检测输入错误
  showError(index) {
    for (let i = 0; i < this.stageAllData.length; i++) {
      if (this.errorStyle === true && this.stageAllData[i].message === false && index === i) {
        const styles = {
          'opacity': 1
        };
        return styles;
      }
    }
  }

  // 向左翻页
  leftPage() {
    if (this.pageIndex > 1) {
      this.pageIndex--;
      this.pageStage = [];
      this.node = [[]];
      // 给总的节点增加开始、结束两个节点在页面中显示
      this.stageAllData.splice(0, 0, 'start');
      this.stageAllData.splice(this.stageAllData.length, 0, 'end');
      this.pageStage = this.stageAllData.slice((this.pageIndex - 1) * 8, 8 * this.pageIndex);
      this.judgeIndex = 0;
      this.m = 1;
      for (let i = 0; i < this.pageStage.length; i++) {
        this.judgeIndex++;
        if (this.judgeIndex > 4) {
          this.judgeIndex = 1;
          this.m++;
        }
      }
      for (let i = 0; i < this.m; i++) {
        this.node[i] = this.pageStage.slice(i * 4, 4 * (i + 1));
      }
      this.stageAllData.splice(0, 1);
      this.stageAllData.splice(this.stageAllData.length - 1, 1);
    }
  }

  // 向右翻页
  rightPage() {
    if (this.pageIndex < this.pageTotal) {
      this.pageIndex++;
      this.pageStage = [];
      this.node = [[]];
      this.stageAllData.splice(0, 0, 'start');
      this.stageAllData.splice(this.stageAllData.length, 0, 'end');
      if (this.pageIndex === this.pageTotal) {
        this.pageStage = this.stageAllData.slice((this.pageIndex - 1) * 8, this.stageAllData.length);
      } else {
        this.pageStage = this.stageAllData.slice((this.pageIndex - 1) * 8, 8 * this.pageIndex);
      }
      this.judgeIndex = 0;
      this.m = 1;
      for (let i = 0; i < this.pageStage.length; i++) {
        this.judgeIndex++;
        if (this.judgeIndex > 4) {
          this.judgeIndex = 1;
          this.m++;
        }
      }
      for (let i = 0; i < this.m; i++) {
        this.node[i] = this.pageStage.slice(i * 4, 4 * (i + 1));
      }
      this.stageAllData.splice(0, 1);
      this.stageAllData.splice(this.stageAllData.length - 1, 1);
    }
  }

  // 判断stageType
  typeChange() {
    // 有build节点先去
    switch (this.stageData.type) {
      case 'TagAndDeploy':
        this.typeInit = 1;
        this.validateStageForm.setControl('imageTag', new FormControl(null, [Validators.required, this.tagValidator, Validators.minLength(2), Validators.maxLength(20)]));
        this.typeDeal('TagAndDeploy');
        //name初始化与type一致
        this.stageData.typeIndex = this.TagAndDeployNumber;
        if (this.addStyle === true) {
          this.stageData.name = 'TagAndDeploy' + this.TagAndDeployNumber;
        }
        this.stageNameDirty();
        break;
      case 'ManualOperation':
        this.typeInit = 2;
        this.validateStageForm.setControl('timeout', new FormControl(null, [Validators.required, CuValidators.positiveIntegerNotZero]));
        this.typeDeal('ManualOperation');
        if (this.addStyle === true) {
          this.stageData.name = 'ManualOperation' + this.ManualOperationNumber;
        }
        this.stageNameDirty();
        break;
      case 'Test':
        this.typeInit = 3;
        this.validateStageForm.setControl('timeoutTest', new FormControl(null, [Validators.required, CuValidators.positiveIntegerNotZero]));
        this.typeDeal('Test');
        this.stageData.typeIndex = this.TestNumber;
        if (this.addStyle === true) {
          this.stageData.name = 'Test' + this.TestNumber;
        }
        this.stageNameDirty();
        break;
      case 'Build':
        this.typeInit = 0;
        this.typeDeal('Build');
        this.stageData.name = 'Build';
        this.stageNameDirty();
        break;
      case 'CodeCheck':
        this.typeInit = 4;
        this.typeDeal('CodeCheck');
        this.stageData.name = 'CodeCheck';
        this.buildCheck();
        this.stageNameDirty();
        break;
      case 'Script':
        this.typeInit = 5;
        this.typeDeal('Script');
        this.stageData.name = 'Script';
        this.stageData.typeIndex = this.ScriptNumber;
        if (this.addStyle === true) {
          this.stageData.name = 'script' + this.ScriptNumber;
        }
        this.stageNameDirty();
        break;
      default:
        this.typeInit = -1;
        this.typeDeal('');
    }
    this.stageErrorMessage();
  }

  // 节点切换处理节点
  typeDeal(value) {
    for (let i = 0; i < this.stageList.length; i++) {
      if (this.stageList[i].name !== value) {
        this.validateStageForm.setControl(this.stageList[i].id, new FormControl(null));
        this.validateStageForm.controls[this.stageList[i].id].reset();
      }
    }
  }

  // 校验先有build节点，再有codeCheck
  buildCheck() {
    let type = [];
    if (this.codeCheckList.length < 1 && this.codeCheckLoading === false) {
      this.nzMessageService.error('没有与构建相匹配的代码检查数据！');
    }
  }

  // 编辑删除build节点操作提示用户信息
  stageErrorMessage() {
    let type = [];
    for (let l = 0; l < this.stageAllData.length; l++) {
      type.push(this.stageAllData[l].type);
    }
    if (this.s2bOrNot === true) {
      for (let l = 0; l < this.stageAllData.length; l++) {
        if (this.stageAllData[l].type === 'TagAndDeploy') {
          this.stageAllData[l]['message'] = false;
          this.errorStyle = true;
          this.nzMessageService.warning('构建类型是从源代码构建程序包，不可添加TagAndDeploy节点！');
          setTimeout(() => {
            this.stageAllData[l].type = '';
            this.stageAllData[l].codeCheckId = '';
            this.stageAllData[l].codeCheckName = '';
            this.stageAllData[l].name = '';
            this.stageAllData[l]['message'] = true;
            this.errorStyle = false;
          }, 500);
        }
      }
    }
    if (type.indexOf('Build') === -1) {
      for (let l = 0; l < this.stageAllData.length; l++) {
        if (this.stageAllData[l].type === 'CodeCheck') {
          this.stageAllData[l]['message'] = false;
          this.errorStyle = true;
          this.nzMessageService.warning('请先创建build节点再创建代码检查节点');
          setTimeout(() => {
            this.stageAllData[l].type = '';
            this.stageAllData[l].codeCheckId = '';
            this.stageAllData[l].codeCheckName = '';
            this.stageAllData[l].name = '';
            this.stageAllData[l]['message'] = true;
            this.errorStyle = false;
          }, 500);
        }
      }
    }
    if (type.indexOf('Build') > -1) {
      if (this.stageData.index < type.indexOf('Build') && this.stageData.name === 'CodeCheck') {
        this.nzMessageService.warning('代码检查节点必须在build节点之后！');
        this.validateStageForm.reset();
      }
    }
  }

  // 节点规则：1一个build节点   2一个CodeCheck节点
  stageListDeal() {
    let type = [];
    for (let l = 0; l < this.stageAllData.length; l++) {
      type.push(this.stageAllData[l].type);
    }
    if (type.indexOf('Build') > -1 && type.indexOf('CodeCheck') > -1) {
      if (this.s2bOrNot === false) {
        this.stageList = [
          {id: 'imageTag', name: 'TagAndDeploy', disabled: false},
          {id: 'timeoutTest', name: 'Test', disabled: false},
          {id: 'timeout', name: 'ManualOperation', disabled: false},
          {id: 'script', name: 'Script', disabled: false}
        ];
      } else {
        this.stageList = [
          {id: 'timeoutTest', name: 'Test', disabled: false},
          {id: 'timeout', name: 'ManualOperation', disabled: false},
          {id: 'script', name: 'Script', disabled: false}
        ];
      }

    } else if (type.indexOf('Build') > -1 && type.indexOf('CodeCheck') === -1) {
      if (this.s2bOrNot === false) {
        this.stageList = [
          {id: 'imageTag', name: 'TagAndDeploy', disabled: false},
          {id: 'timeoutTest', name: 'Test', disabled: false},
          {id: 'timeout', name: 'ManualOperation', disabled: false},
          {id: 'script', name: 'Script', disabled: false},
          {id: 'codeCheckId', name: 'CodeCheck', disabled: false}
        ];
      } else {
        this.stageList = [
          {id: 'timeoutTest', name: 'Test', disabled: false},
          {id: 'timeout', name: 'ManualOperation', disabled: false},
          {id: 'script', name: 'Script', disabled: false},
          {id: 'codeCheckId', name: 'CodeCheck', disabled: false}
        ];
      }
    } else {
      this.stageList = [
        {id: 'constructId', name: 'Build', disabled: false},
        {id: 'imageTag', name: 'TagAndDeploy', disabled: false},
        {id: 'timeoutTest', name: 'Test', disabled: false},
        {id: 'timeout', name: 'ManualOperation', disabled: false},
        {id: 'script', name: 'Script', disabled: false},
        {id: 'codeCheckId', name: 'CodeCheck', disabled: true}
      ];
    }
  }

  // 手动输入判断是否重名
  stageUnique = (control: FormControl): { [s: string]: any } => {
    // 校验stage name是否有重复
    let hasName = 1;
    for (let i = 0; i < this.stageAllData.length; i++) {
      if (this.stageData.name === this.stageAllData[i].name) {
        hasName++;
      }
    }
    if (hasName > 2) {
      return {stageName: {message: 'stage名称不能重复!'}};
    }
  };

  // 镜像tag校验
  tagValidator = (control: FormControl): { [s: string]: any } => {
    const EMAIL_REGEXP = /^[_A-Za-z0-9]([._\-A-Za-z0-9]*)?$/;
    if (!EMAIL_REGEXP.test(control.value)) {
      return {expose: {message: '仅包含字母、数字、点、下划线及中横线，不能以点、中横线开头!'}};
    }
  };

  // 流水线名称校验
  pipelineNameValidator = (control: FormControl): { [s: string]: any } => {
    const EMAIL_REGEXP = /^[A-Za-z0-9_\-\.]+$/;
    if (!EMAIL_REGEXP.test(control.value)) {
      return {expose: {message: '仅包含字母、数字、下划线及中横线!'}};
    }
  };

  // stage联动校验
  stageNameDirty() {
    this.validateStageForm.controls['name'].markAsDirty();
    this.validateStageForm.controls['name'].updateValueAndValidity();
  }

  // 流水线名称校验
  nameValidator = (control: FormControl): { [s: string]: any } => {
    // 判断name是否唯一
    for (let m = 0; m < this.pipelineList.length; m++) {
      if (this.editData.name === this.pipelineList[m].name && this.addOrEdit === 0) {
        return {pipelineName: {message: '流水线名称已经存在'}};
      } else if (this.editData.name === this.pipelineList[m].name && this.addOrEdit === 1) {
        if (this.editData.name !== this.editName) {
          return {pipelineName: {message: '流水线名称已经存在'}};
        }
      }
    }
  };

  // 自动生成typeIndex
  autoStageName() {
    for (let i = 0; i < this.stageAllData.length; i++) {
      if (this.stageAllData[i].type === 'TagAndDeploy') {
        this.stageAllData[i]['typeIndex'] = this.TagAndDeployIndex;
        this.TagAndDeployIndex++;
      }
      if (this.stageAllData[i].type === 'Test') {
        this.stageAllData[i]['typeIndex'] = this.TestIndex;
        this.TestIndex++;
      }
      if (this.stageAllData[i].type === 'ManualOperation') {
        this.stageAllData[i]['typeIndex'] = this.ManualOperationIndex;
        this.ManualOperationIndex++;
      }
    }
  }

  // stageData中typeIndex自动加1处理
  addTypeIndex() {
    let tagAndDeploy = [], test = [], manualOperation = [], script = [];
    for (let i = 0; i < this.stageAllData.length; i++) {
      if (this.stageAllData[i].type === 'TagAndDeploy') {
        tagAndDeploy.push(this.stageAllData[i].typeIndex);
      }
      if (this.stageAllData[i].type === 'Test') {
        test.push(this.stageAllData[i].typeIndex);
      }
      if (this.stageAllData[i].type === 'ManualOperation') {
        manualOperation.push(this.stageAllData[i].typeIndex);
      }
      if (this.stageAllData[i].type === 'Script') {
        script.push(this.stageAllData[i].typeIndex);
      }
    }
    for (let i = 0; i < tagAndDeploy.length; i++) {
      tagAndDeploy = tagAndDeploy.sort();
      if (tagAndDeploy[i] !== i) {
        this.TagAndDeployNumber = i;
        break;
      } else {
        this.TagAndDeployNumber = i + 1;
      }
    }
    if (tagAndDeploy.length < 1) {
      this.TagAndDeployNumber = 0;
    }
    for (let i = 0; i < test.length; i++) {
      test = test.sort();
      if (test[i] !== i) {
        this.TestNumber = i;
        break;
      } else {
        this.TestNumber = i + 1;
      }
    }
    if (test.length < 1) {
      this.TestNumber = 0;
    }
    for (let i = 0; i < manualOperation.length; i++) {
      manualOperation = manualOperation.sort();
      if (manualOperation[i] !== i) {
        this.ManualOperationNumber = i;
        break;
      } else {
        this.ManualOperationNumber = i + 1;
      }
    }
    if (manualOperation.length < 1) {
      this.ManualOperationNumber = 0;
    }
    for (let i = 0; i < script.length; i++) {
      script = script.sort();
      if (script[i] !== i) {
        this.ScriptNumber = i;
        break;
      } else {
        this.ScriptNumber = i + 1;
      }
    }
    if (script.length < 1) {
      this.ScriptNumber = 0;
    }
  }

  // 校验提交信息是否完整
  messageRight = () => {
    if (this.stageAllData.length < 1) {
      this.nzMessageService.error('至少创建一个节点');
      return false;
    }
    // 输入信息不完整校验
    this.errorStyle = false;
    for (let i = 0; i < this.stageAllData.length; i++) {
      if (this.stageAllData[i].timeoutTest) {
        this.stageAllData[i].timeout = this.stageAllData[i].timeoutTest;
      }
      if (this.stageAllData[i].name && this.stageAllData[i].type) {
        this.stageAllData[i]['message'] = true;
      } else {
        this.stageAllData[i]['message'] = false;
        this.errorStyle = true;
      }
      switch (this.stageAllData[i].type) {
        case 'Build':
          this.stageMessage(i, this.stageAllData[i].constructId);
          break;
        case 'TagAndDeploy':
          this.stageMessage(i, this.stageAllData[i].imageTag);
          break;
        case 'Test':
          this.stageMessage(i, this.stageAllData[i].timeout);
          break;
        case 'ManualOperation':
          this.stageMessage(i, this.stageAllData[i].timeout);
          break;
        case 'CodeCheck':
          this.stageMessage(i, this.stageAllData[i].codeCheckId);
          break;
        case 'Script':
          this.stageMessage(i, this.stageAllData[i].script);
          break;
        default:
          break;
      }
      delete this.stageAllData[i].typeIndex;
    }
    if (this.errorStyle === true) {
      this.nzMessageService.error('信息创建不完整');
      return false;
    }
    // build 节点校验
    for (let i = 0; i < this.stageAllData.length; i++) {
      if (this.stageAllData[i].type === 'Build') {
        break;
      } else if (i === this.stageAllData.length - 1) {
        this.nzMessageService.error('必须创建build节点');
        return false;
      }
    }
    // 节点内容校验
    let hasName = [];
    for (let i = 0; i < this.stageAllData.length; i++) {
      hasName.push(this.stageAllData[i].name);
    }
    hasName = hasName.sort();
    for (let i = 0; i < hasName.length; i++) {
      if (hasName[i] == hasName[i + 1]) {
        this.nzMessageService.error('节点内容不能重复');
        return false;
      }
    }
  };

  // 保存数据时候节点校验
  stageMessage(index, value) {
    if (value) {
      this.stageAllData[index]['message'] = true;
    } else {
      this.stageAllData[index]['message'] = false;
      this.errorStyle = true;
    }
  }

  // 给name赋值
  changeCodeCheck(value) {
    for (let i = 0; i < this.codeCheckList.length; i++) {
      if (value === this.codeCheckList[i].Id) {
        this.stageData.codeCheckName = this.codeCheckList[i].name;
      }
    }
    console.log(this.codeCheckLoading);
  }

  // 鼠标移入删除按钮显示
  mouseOver(n, i) {
    this.row = n;
    this.col = i;
  }

  // 鼠标移出删除按钮消失
  mouseMove() {
    this.row = -1;
    this.col = -1;
  }


  ngOnInit() {
    this.validateStageForm = this.fb.group({
      name: [null, [Validators.required, this.stageUnique]],
      type: [null, Validators.required],
      constructId: [null],
      timeoutTest: [null],
      timeout: [null],
      imageTag: [null],
      codeCheckId: [null],
      script: [null]
    });
    this.validateForm = this.fb.group({
      name: [null, [Validators.required, this.pipelineNameValidator, this.nameValidator]],
    });
    this.pipelineId = this.activatedRoute.snapshot.params['id'];
    if (this.pipelineId) {
      this.getPipeLineDataById(this.pipelineId);
    } else {
      // 开始结束节点
      this.node[0][0] = 'start';
      this.node[0][1] = 'end';
      this.addStage(-1, 0, 0);
      this.getDatas();
    }
    this.getLocalPipeline();
  }

  ngOnChanges() {
  }
}

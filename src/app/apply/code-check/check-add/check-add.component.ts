import {Component, OnChanges, Output, EventEmitter, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators, FormArray, AbstractControl} from '@angular/forms';
import {NzMessageService} from 'ng-zorro-antd';
import {FileItem, FileUploader} from 'ng2-file-upload';
import {ParsedResponseHeaders} from 'ng2-file-upload/file-upload/file-uploader.class';
import {CodeCheckService} from '../code-check.service';
import {Router, ActivatedRoute} from "@angular/router";
import {CuValidators} from 'ng-zorro-iop';

@Component({
  selector: 'app-check-add',
  templateUrl: './check-add.component.html',
  styleUrls: ['./check-add.component.css']
})
export class CheckAddComponent implements OnInit, OnChanges {
  @Output() del = new EventEmitter();
  @ViewChild('NziFormComponent') NziFormComponent;

  constructor(private fb: FormBuilder,
              private codeCheckService: CodeCheckService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private nzMessageService: NzMessageService) {
  }

  validateForm: FormGroup; // 表单
  loading; // 加载数据
  buildOptions; // 构建
  buildList = []; // 构建数据
  loadingBuild; // 构建加载
  addOrEdit; // 增加或者编辑
  modelData = {
    'Id': null,
    'name': null,
    'constructId': null,
    'sonarSources': null,
    'constructName': null,
    'pipelineName': null
  }; // 结构体初始化
  codeCheckId; // 代码检查Id
  type; // 构建还是编辑
  codeCheckData = []; // 代码检查数据
  editName; // 编辑时候的名字，用于名字校验判断

  // 从本地数据库获得构建信息
  getBuildData() {
    this.loadingBuild = true;
    this.codeCheckService.getBuilds().subscribe(data => {
      this.loadingBuild = false;
      this.buildList = data || [];
    })
  }

  // 获得代码检查信息列表
  getData() {
    this.loading = true;
    this.codeCheckService.getApps().subscribe(datas => {
      this.loading = false;
      this.codeCheckData = datas;
    });
  }

  // 编辑获得一条数据
  getDataById(id) {
    this.validateForm.controls['name'].disable();
    this.loading = true;
    this.addOrEdit = 'edit';
    this.codeCheckService.getDataById(id).subscribe(data => {
      this.editName = data.name;
      this.loading = false;
      this.modelData = data || [];
    })
  }

  //初始化创建
  initAdd() {
    this.addOrEdit = 'add'
  }

  // 提交任务数据
  handleOk() {
    if (this.addOrEdit === 'add') {
      const isSuccess: boolean = this.submitForm();
      return !isSuccess;
    } else if (this.addOrEdit === 'edit') {
      const isSuccess: boolean = this.updateForm(this.codeCheckId);
      return !isSuccess;
    }

  }

  // 代码检查提交表单数据
  submitForm() {
    let data = {};
    // 先检验表单
    if (!this.NziFormComponent.validForm()) {
      return false;
    }
    if (this.NziFormComponent.validForm()) {
      data = this.NziFormComponent.getFormData();
      this.create(data);
      return true;
    } else {
      return false;
    }
  }

  // 代码检查更新数据
  updateForm(id) {
    let data = {};
    // 先检验表单
    if (!this.NziFormComponent.validForm()) {
      return false;
    }
    if (this.NziFormComponent.validForm()) {
      data = this.NziFormComponent.getFormData();
      data['Id'] = parseInt(this.modelData.Id);
      data['constructName'] = this.modelData.constructName;
      data['pipelineName'] = this.modelData.pipelineName;
      this.update(id, data);
      return true;
    } else {
      return false;
    }
  }

  // 增加表单
  create(data) {
    const mid = this.nzMessageService.loading('正在创建中', {nzDuration: 0}).messageId;
    this.codeCheckService.create(data).subscribe(respose => {
      //  this.refreshData(this.ownerId);
      this.nzMessageService.success('创建成功！');
      this.nzMessageService.remove(mid);
      setTimeout(() => {
        this.router.navigateByUrl('/app-apply-code-check');
      }, 1000);
    });
  }

  // 更新数据
  update(id: string, data) {
    const mid = this.nzMessageService.loading('正在更新中', {nzDuration: 0}).messageId;
    this.codeCheckService.update(id, data).subscribe(respose => {
      this.nzMessageService.success('更新成功！');
      this.nzMessageService.remove(mid);
      if (this.type === 'edit') {
        setTimeout(() => {
          this.router.navigateByUrl('/app-apply-code-check')
        }, 1000);
      } else if (this.type === 'detail') {
        setTimeout(() => {
          this.router.navigateByUrl('/app-apply-code-check/detail/' + this.codeCheckId)
        }, 1000);
      }
    });
  }

  // 取消提交数据
  handleCancel() {
    this.resetForm();
  }

  //取消操作
  resetForm() {
    if (this.type === 'detail') {
      setTimeout(() => {
        this.router.navigateByUrl('/app-apply-code-check/detail/' + this.codeCheckId)
      }, 500);
    } else {
      setTimeout(() => {
        this.router.navigateByUrl('/app-apply-code-check');
      }, 500);
    }
  }

  // 代码检查名称校验
  nameValidator = (control: FormControl): { [s: string]: any } => {
    // 判断name是否唯一
    for (let m = 0; m < this.codeCheckData.length; m++) {
      if (this.modelData.name === this.codeCheckData[m].name && this.addOrEdit === 'add') {
        return {name: {message: '任务名称已经存在'}};
      } else if (this.addOrEdit === 'edit') {
        if (this.modelData.name !== this.editName) {
          return {name: {message: '任务名称不能修改'}};
        }
      }
    }
  };

  // 源代码路径校验
  sonarSourcesValidator = (control: FormControl): { [s: string]: any } => {
    const EMAIL_REGEXP = /^(\.)([-a-zA-Z0-9/]*[a-zA-Z0-9])?\/$/;
    if (!EMAIL_REGEXP.test(control.value)) {
      return {sonarSources: {message: '请使用相对路径，且相对路径名由字母、数字、/组成、并以/结尾!'}};
    }
  };

  // 源代码构建数据校验
  getInvalidMessage(name) {
    return this.NziFormComponent.getInvalidMessage(name);
  }

  ngOnInit() {
    this.validateForm = this.fb.group({
      name: [null, [Validators.required, this.nameValidator, CuValidators.nameEn]],
      constructId: [null, [Validators.required]],
      sonarSources: [null, [Validators.required, this.sonarSourcesValidator]]
    });
    this.buildOptions = {
      datas: this.buildList
    };
    this.codeCheckId = this.activatedRoute.snapshot.params['id'];
    this.type = this.activatedRoute.snapshot.params['type'];
    if (this.codeCheckId) {
      this.getDataById(this.codeCheckId)
    } else {
      this.initAdd();
    }
    this.getBuildData();
    this.getData();
  }

  ngOnChanges() {
  }
}

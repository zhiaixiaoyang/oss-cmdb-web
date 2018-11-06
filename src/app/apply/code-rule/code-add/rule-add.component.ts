import {Component, OnChanges, Output, EventEmitter, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators, FormArray, AbstractControl} from '@angular/forms';
import {NzModalService, NzMessageService} from 'ng-zorro-antd';
import {FileItem, FileUploader} from 'ng2-file-upload';
import {ParsedResponseHeaders} from 'ng2-file-upload/file-upload/file-uploader.class';
import {CodeRuleService} from '../code-rule.service';
import {Router, ActivatedRoute} from "@angular/router";
import {CuValidators} from 'ng-zorro-iop';

@Component({
  selector: 'app-code-add',
  templateUrl: './rule-add.component.html',
  styleUrls: ['./rule-add.component.css']
})
export class RuleAddComponent implements OnInit, OnChanges {
  @Output() del = new EventEmitter();
  @ViewChild('NziFormComponent') NziFormComponent;

  constructor(private fb: FormBuilder,
              private codeRuleService: CodeRuleService,
              private modalService: NzModalService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private nzMessageService: NzMessageService) {
  }

  validateForm: FormGroup; // 表单
  loading; // 加载数据
  ruleIndex = 0; // tab标签页index
  ruleSelectData; // 已选数据
  ruleSelectLoading; // 已选规则表格加载
  ruleAllData; // 可选数据
  ruleAllLoading; // 可选规则表格加载
  modelData = {
    'name': null,
    'description': null
  }; // 结构体初始化

  // 提交任务数据
  handleOk() {
  }

  // 取消提交数据
  handleCancel() {
    this.resetForm();
  }

  //取消操作
  resetForm() {
    setTimeout(() => {
      this.router.navigateByUrl('/app-apply-code-rule');
    }, 500);
  }

  // 标签页处理
  triggerCheck() {
  }

  // 源代码构建数据校验
  getInvalidMessage(name) {
    return this.NziFormComponent.getInvalidMessage(name);
  }

  // 设置button样式
  setShadow() {
    const styles = {
      'background-color': this.ruleIndex < 1 ? '#1890ff' : 'white',
      'color': this.ruleIndex < 1 ? 'black' : ''
    };
    return styles;
  }
  setColor() {
    const styles = {
      'background-color': this.ruleIndex > 0 ? '#1890ff' : 'white',
      'color': this.ruleIndex > 0 ? 'black' : ''
    };
    return styles;
  }

  ngOnInit() {
    this.validateForm = this.fb.group({
      name: [null, [Validators.required, CuValidators.nameEn]],
      description: [null],
    });
  }

  ngOnChanges() {
  }
}

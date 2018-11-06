import {Component, OnChanges, Output, EventEmitter, OnInit, OnDestroy, ViewChild} from '@angular/core';
import {NzModalService, NzMessageService} from 'ng-zorro-antd';
import {CodeRuleService} from './code-rule.service';
import {FormBuilder, FormControl, FormGroup, FormArray, Validators} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-apply-code-rule',
  templateUrl: './code-rule.component.html',
  styleUrls: ['./code-rule.component.css']
})
export class CodeRuleComponent implements OnInit, OnChanges, OnDestroy {
  @Output() del = new EventEmitter();
  @ViewChild('FormTagComponent') FormTagComponent;

  constructor(private codeRuleService: CodeRuleService,
              private modalService: NzModalService,
              private nzMessageService: NzMessageService,
              private fb: FormBuilder,
              private activatedRoute: ActivatedRoute) {
  }
  data; // 表格数据
  loading; // 表格数据加载

  ngOnInit() {
  }

  ngOnDestroy() {

  }

  ngOnChanges() {
  }
}

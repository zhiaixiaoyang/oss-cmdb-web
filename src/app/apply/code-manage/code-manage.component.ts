import {Component, OnChanges, Output, TemplateRef, EventEmitter, OnInit, ViewChild, OnDestroy} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {NzModalService, NzMessageService, NzNotificationService} from 'ng-zorro-antd';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-apply-code-manage',
  templateUrl: './code-manage.component.html',
  styleUrls: ['./code-manage.component.css']
})
export class CodeManageComponent implements OnInit, OnChanges, OnDestroy {
  @Output() del = new EventEmitter();
  @ViewChild('FormTagComponent') FormTagComponent;

  constructor(
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

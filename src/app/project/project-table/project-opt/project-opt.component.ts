import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd';

@Component({
  selector: 'app-project-opt',
  styleUrls: ['./project-opt.component.css'],
  templateUrl: './project-opt.component.html',
})
export class ProjectTableOptComponent implements OnInit {
  @Input()  rowData: Element;
  @Output() del = new EventEmitter();

  newData: any = {};

  validateForm: FormGroup;

  showConfirm() {
    const _this = this;
    this.modalService.confirm({
      nzTitle  : '您是否确认要删除这项内容',
      nzContent: '<b>删除操作无法回滚，请谨慎操作</b>',
      nzOnOk: () => {
        _this.del.emit();
      },
      nzOnCancel: () => {
      }
    });
  }
  getFormControl(name: string) {
    return this.validateForm.controls[ name ];
  }

  resetForm() {
    this.validateForm.reset();
    for (const key in this.validateForm.controls) {
      if (key) {
        this.validateForm.controls[ key ].markAsPristine();
      }
    }
  }

  constructor(private modalService: NzModalService, private fb: FormBuilder) {}

  ngOnInit() {
    this.validateForm = this.fb.group({
      name: [ null, [ Validators.required ] ],
      code: [ null, [ Validators.required ] ],
      visit_address: [ null],
      manage_address: [ null ],
      owner_id: [ null ],
      description: [ null, [ Validators.required ] ],

    });
  }
}

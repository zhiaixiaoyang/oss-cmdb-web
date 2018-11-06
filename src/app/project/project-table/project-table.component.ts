import {Component, OnChanges, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NzModalService} from 'ng-zorro-antd';

import {ProjectService} from '../project.service';

@Component({
  selector: 'app-project-table',
  styleUrls: ['./project-table.component.css'],
  templateUrl: './project-table.component.html',
})
export class ProjectTableComponent implements OnInit, OnChanges {
  data: Element[] = [];
  loading = true;
  isPage = true;
  isVisible = false;
  validateForm: FormGroup;
  _current = 1;
  _pageSize = 10;
  _total = 200;
  _sortValue = 'descend';

  constructor(private fb: FormBuilder, private projectService: ProjectService,
              private modalService: NzModalService) {
  }

  showModal(contentTpl) {
    const _this = this;
    this.modalService.create({
      nzTitle: '新建',
      nzContent: contentTpl,
      nzMaskClosable: false,
      nzOnOk: () => {
        return _this.handleOk();
      },
      nzOnCancel: () => {
        return _this.handleCancel();
      }
    });
    this.isVisible = true;
  }

  handleOk(): boolean {
    const isSuccess: boolean = this.submitForm();
    if (isSuccess) {
      this.isVisible = false;
    }
    return isSuccess;
  }

  handleCancel(): void {
    this.resetForm();
    this.isVisible = false;
  }

  submitForm(): boolean {
    const data: Element = new Element();
    for (const i in this.validateForm.controls) {
      if (i) {
        this.validateForm.controls[i].markAsDirty();
        data[i] = this.validateForm.controls[i].value;
      }
    }
    if (this.validateForm.status !== 'VALID') {
      return false;
    }
    this.resetForm();
    this.create(data);
    return true;
  }

  getFormControl(name: number) {
    return this.validateForm.controls[name];
  }

  resetForm(): void {
    this.validateForm.reset();
    for (const key in this.validateForm.controls) {
      if (key) {
        this.validateForm.controls[key].markAsPristine();
      }
    }
  }

  sort(value): void {
    this._sortValue = value;
    this.refreshData();
  }

  getDatas(): void {
    this.loading = true;
    this.projectService.getProjects('').subscribe(datas => {
      this.loading = false;
      this.data = datas || [];
    });
  }

  refreshData(reset = false) {
    if (reset) {
      this._current = 1;
    }
    this.loading = true;
    const current = this._current;
    this.projectService.getPageData(current, this._pageSize).subscribe((datas: any) => {
      this.loading = false;
      this.data = datas.data || [];
      this._total = datas.total;
    });
  }

  del(item): void {
    this.projectService.delete(item.name).subscribe(respose => this.refreshData());
  }

  create(data) {
    this.projectService.create(data).subscribe(respose => this.refreshData());
  }

  ngOnInit() {
    this.validateForm = this.fb.group({
      name: [null, [Validators.required]],
      tag: [null, [Validators.required]],
      visit_address: [null],
      manage_address: [null],
      owner_id: [null],
      description: [null, [Validators.required]]
    });
    this.refreshData();
  }

  ngOnChanges() {

  }
}

export class Element {
  name: any;
  code: any;
  visit_address: any;
  manage_address: any;
  owner_id: any;
  description: any;

}

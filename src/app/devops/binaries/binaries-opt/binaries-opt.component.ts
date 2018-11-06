import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { BinariesService } from '../binaries.service';
import { FileItem, FileUploader } from 'ng2-file-upload';
import { ParsedResponseHeaders } from 'ng2-file-upload/file-upload/file-uploader.class';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-binaries-opt',
  styleUrls: ['./binaries-opt.component.css'],
  templateUrl: './binaries-opt.component.html',
})
export class BinariesOptComponent implements OnInit {
  constructor( private binariesService: BinariesService,
               private message: NzMessageService,
               private fb: FormBuilder,
               private router: Router,
               private modalService: NzModalService) {}

  @Input()  binariesData: Element;
  @Input()  binariesVersionData: Element;
  @Output() delBinaries = new EventEmitter();
  @Output() updateBinariesVersionBtn = new EventEmitter();
  @Output() delBinariesVersion = new EventEmitter();
  downloadUrl: string;
  uploader: FileUploader = new FileUploader({});
  fileName;
  fileItem: FileItem = null;
  uploadMid;
  updateValidateForm: FormGroup;
  versionId;
  versions = [];

  showUpdateModal(contentTpl) {
    const _this = this;
    if (_this.binariesData && _this.binariesData['binariesVersions']) {
      _this.versions = _this.binariesData['binariesVersions'] || [];
      if (_this.versions.length > 0 ) {
        _this.versionId = _this.versions[0]['id'];
      }
    }
    const modal = this.modalService.create({
      nzTitle       : '更新',
      nzContent     : contentTpl,
      nzWidth: '550px',
      nzMaskClosable: false,
      nzOnOk: () => {
        const b = _this.validForm();
        if (b) {
          _this.updateBinariesVersion();
        }
        return b;
      },
      nzOnCancel: () => {
        _this.resetForm();
      }
    });
  }

  delBinariesConfirm() {
    const _this = this;
    this.modalService.confirm({
      nzTitle  : '你确认要删除<b>[' + this.binariesData['name'] + ']</b>吗',
      nzContent: '<b>删除操作无法回滚，请谨慎操作</b>',
      nzOnOk: () => {
        _this.delBinaries.emit();
      },
      nzOnCancel: () => {
      }
    });
  }

  delBinariesVersionConfirm() {
    const _this = this;
    this.modalService.confirm({
      nzTitle  : '你确认要删除<b>[' + this.binariesVersionData['name'] + ':' + this.binariesVersionData['version'] + ']</b>吗',
      nzContent: '<b>删除操作无法回滚，请谨慎操作</b>',
      nzOnOk: () => {
        _this.delBinariesVersion.emit();
      },
      nzOnCancel: () => {
      }
    });
  }

  downLoadBinariesVersion() {
    this.binariesService.downLoadBinariesVersion(this.binariesVersionData.id).subscribe(respose =>  {
      const data = respose.body;
      const blob = new Blob([data]);
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('style', 'display:none');
      a.setAttribute('href', objectUrl);
      a.setAttribute('download', this.binariesVersionData['name']);
      a.click();
      URL.revokeObjectURL(objectUrl);
    });
  }
  updateBinariesVersion(): void {
    const url = '/apis/apps/v1/binaries/versions/' + this.versionId;

    this.uploader.setOptions({
      url: url,
      method: 'POST',
      itemAlias: 'file',
      additionalParameter: {},
      headers: [
        {name: 'Authorization', value: 'bearer ' + this.getToken()}
      ],
    });
    this.uploadMid = this.message.loading('正在更新程序包', {nzDuration: 0}).messageId;
    this.uploader.uploadItem(this.fileItem);
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

  afterAddFile(): any {
    return (fileItem: FileItem) => {
      this.fileName = fileItem._file.name;
      this.fileItem = fileItem;
    };
  }

  onSuccessItem(): any {
    const _this = this;
    return (item: FileItem, response: string, status: number, headers: ParsedResponseHeaders) => {
      this.message.success('更新成功！');
      this.message.remove(this.uploadMid);
      _this.resetForm();
      _this.updateBinariesVersionBtn.emit();
    };
  }
  onErrorItem(): any {
    return (item: FileItem, response: string, status: number, headers: ParsedResponseHeaders) => {
      const obj = JSON.parse(response);
      this.message.error('更新失败:' + obj.message);
      this.message.remove(this.uploadMid);
    };
  }

  getUpdateInvalidMessage(name) {
    const _this = this;
    return _this.getInvalidMessage(name);
  }

  fileNameCheck = (control: FormControl): { [s: string]: any } => {
    if (!control.value) {
      return {projectUrl: {message: '请选择正确的程序包：java程序（jar包或者war包），php&nodejs程序（zip包），' +
          'go程序（需要构建成windows或者Linux需要的二进制包）'}};
    }
    let type = control.value.substr(control.value.indexOf('.'));
    if (control.value.indexOf('.') <= 0) {
      type = control.value;
    }
    let b = false;
    if (type === '.jar' || type === '.war' || type === '.zip' || type === '.exe' || type === this.fileName) {
      b = true;
    }
    if (!b) {
      return {projectUrl: {message: '请选择正确的程序包：java程序（jar包或者war包），php&nodejs程序（zip包），' +
          'go程序（需要构建成windows或者Linux需要的二进制包）'}};
    }
  }

  validForm(): boolean {
    for (const i in this.updateValidateForm.controls) {
      if (i) {
        this.updateValidateForm.controls[i].markAsDirty();
        this.updateValidateForm.controls[i].updateValueAndValidity();
      }
    }
    return this.updateValidateForm.status === 'VALID';
  }

  resetForm() {
    this.updateValidateForm.reset();
    for (const key in this.updateValidateForm.controls) {
      if (key) {
        this.updateValidateForm.controls[key].markAsPristine();
      }
    }
  }
  getFormData(): any {
    const data: any = {};
    for (const i in this.updateValidateForm.controls) {
      if (i) {
        const value = this.updateValidateForm.controls[i].value;
        data[i] = typeof(value) === 'string' ? value.trim() : value;
      }
    }
    return data;
  }

  getInvalidMessage(name, name1?, type?) {
    let errors, formControl = this.updateValidateForm.get(name);
    if (name1) {
      if (type === 'formGroup') {

      }
      if (type === 'formArray') {

      }
    } else {
      errors = formControl.errors;
      if (!errors || !formControl.dirty) {
        return false;
      } else {
        if (formControl.hasError('required')) {
          return {message: '该内容不可为空'};
        }
        if (formControl.hasError('email')) {
          return {message: '输入的内容不符合email的格式'};
        }
        if (formControl.hasError('minlength')) {
          const error = formControl.getError('minlength');
          return {message: `请输入长度不小于${error.requiredLength}的内容`};
        }
        if (formControl.hasError('maxlength')) {
          const error = formControl.getError('maxlength');
          return {message: `请输入长度不大于${error.requiredLength}的内容`};
        }
        if (formControl.hasError('min')) {
          const error = formControl.getError('min');
          return {message: `请输入不大于${error.min}的值`};
        }
        if (formControl.hasError('max')) {
          const error = formControl.getError('max');
          return {message: `请输入不大于${error.max}的值`};
        }
        let message = '';
        for (const key in errors) {
          message += errors[key].message + ' ';
        }
        return {message: message};
      }
    }
  }

  ngOnInit() {
    if (this.binariesVersionData) {
      this.downloadUrl = '/apis/apps/v1/binaries/versions/' + this.binariesVersionData['id'] + '/download';
    }
    this.updateValidateForm = this.fb.group({
      versionId: [null, [Validators.required]],
      fileName: [null, [Validators.required, this.fileNameCheck]],
    });

    this.uploader.onAfterAddingFile = this.afterAddFile();
    this.uploader.onSuccessItem = this.onSuccessItem();
    this.uploader.onErrorItem = this.onErrorItem();
  }
}

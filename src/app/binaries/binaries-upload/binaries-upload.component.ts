import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BinariesService } from '../binaries.service';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import {FileItem, FileUploader} from 'ng2-file-upload';
import {ParsedResponseHeaders} from 'ng2-file-upload/file-upload/file-uploader.class';
import {CuValidators} from 'ng-zorro-iop/index';

@Component({
  selector: 'binaries-upload',
  styleUrls: ['./binaries-upload.component.css'],
  templateUrl: './binaries-upload.component.html',
})
export class BinariesUploadComponent implements OnInit {
  @ViewChild('NziFormComponentAdd')NziFormComponentAdd;
  @ViewChild('NziFormComponentBinaries')NziFormComponentBinaries;
  constructor(private fb: FormBuilder,
              private nzMessageService: NzMessageService,
              private modalService: NzModalService,
              private binariesService: BinariesService,
              private activedRoute: ActivatedRoute,
              private router: Router) {}
  addValidateForm: FormGroup;
  binariesValidateForm: FormGroup;
  uploader: FileUploader = new FileUploader({});
  fileName;
  fileItem: FileItem = null;
  uploadMid;
  binariesList = [];
  binariesName = '';

  afterAddFile(): any {
    return (fileItem: FileItem) => {
      this.fileName = fileItem._file.name;
      this.fileItem = fileItem;
    };
  }

  onSuccessItem(): any {
    return (item: FileItem, response: string, status: number, headers: ParsedResponseHeaders) => {
      this.nzMessageService.success('上传成功！');
      this.nzMessageService.remove(this.uploadMid);
      this.handleCancel();
    };
  }

  onErrorItem(): any {
    return (item: FileItem, response: string, status: number, headers: ParsedResponseHeaders) => {
      const obj = JSON.parse(response);
      this.nzMessageService.error('上传失败:' + obj.message);
      this.nzMessageService.remove(this.uploadMid);
    };
  }

  save(): boolean {
    let b ;
    let params: any = {};
    const url = '/apis/apps/v1/binaries';
    b = this.NziFormComponentAdd.validForm();
    const data = this.NziFormComponentAdd.getFormData();
    params = {
      name: data.name,
      version: data.version,
      description: data.description
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

  fileNameCheck = (control: FormControl): { [s: string]: any } => {
    if (!control.value) {
      return {projectUrl: {message: '请选择正确的程序包：java程序（jar包或者war包），php&nodejs程序（zip包），' +
          'go程序（需要构建成windows或者Linux需要的二进制包）'}};
    }
    let type = control.value.substr(control.value.lastIndexOf('.'));
    if (control.value.lastIndexOf('.') <= 0) {
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

  getInvalidMessage(name) {
    return this.NziFormComponentAdd.getInvalidMessage(name);
  }

  handleCancel() {
    const isSuccess: boolean = this.resetForm();
    return !isSuccess;
  }

  resetForm() {
    setTimeout(() => {
      this.router.navigateByUrl('/app-binaries');
    });
    return true;
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

  showModal(contentTpl) {
    const modal = this.modalService.create({
      nzTitle: '新建程序包',
      nzContent: contentTpl,
      nzWidth: '550px',
      nzMaskClosable: false,
      nzOnOk: () => {
        const b = this.NziFormComponentBinaries.validForm();
        if (b) {
          const mid = this.nzMessageService.loading('正在创建中', {nzDuration: 0}).messageId;
          const data = this.NziFormComponentBinaries.getFormData();
          this.binariesService.createBinariesMeta(data).subscribe(respose => {
            if (respose) {
              if (this.binariesList) {
                this.binariesList.push(respose);
                this.binariesName = respose.name;
              }
              this.nzMessageService.success('创建成功！');
              this.nzMessageService.remove(mid);
            }
          });
        }
        return b;
      },
      nzOnCancel:  () => {
        this.NziFormComponentBinaries.resetForm();
      }
    });
  }

  getBinariesInvalidMessage(name) {
    return this.NziFormComponentBinaries.getInvalidMessage(name);
  }

  getBinariesList(name: string, runtimeEnv: string): void {
    this.binariesService.getBinariesList(name, runtimeEnv).subscribe({
      next: (datas) => {
        this.binariesList = datas || [];
        if (this.binariesList) {
          this.binariesName = this.binariesList[0]['name'];
        }
      },
      complete: () => {
      }
    });
  }

  ngOnInit() {
    this.addValidateForm = this.fb.group({
      name: [null, [Validators.required]],
      version: [null, [CuValidators.version, Validators.required]],
      fileName: [null, [Validators.required, this.fileNameCheck]],
      description: ['', [Validators.maxLength(500)]],
    });

    this.binariesValidateForm = this.fb.group({
      name: [null, [Validators.required, CuValidators.nameEn]],
    });

    this.uploader.onAfterAddingFile = this.afterAddFile();
    this.uploader.onSuccessItem = this.onSuccessItem();
    this.uploader.onErrorItem = this.onErrorItem();

    this.getBinariesList('', '');
  }
}

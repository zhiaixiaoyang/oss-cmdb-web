import {Component, OnChanges, OnInit, ViewChild} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {NzMessageService, NzModalService} from 'ng-zorro-antd';
import {ActivatedRoute} from '@angular/router';

import {UserService} from './user.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit, OnChanges {
  @ViewChild('NziFormComponent') NziFormComponent;
  constructor(private fb: FormBuilder,
              private activatedRoute: ActivatedRoute,
              private userService: UserService,
              private modalService: NzModalService,
              private nzMessageService: NzMessageService) {}

  data = [];
  loading = true;
  isPage = true;
  validateForm: FormGroup;
  validateForm1: FormGroup;
  email: '';
  _sortValue = 'descend';
  allChecked = false;
  indeterminate = false;
  displayData = [];
  envArray = [];
  name: '';
  spaces = [];
  spaceStyle = true;
  value: any[] = null;
  projects = [];
  image;
  checked = false;
  display_name;
  isChange = false;
  namespaceList = [];

  roles = [];

  showModal(contentTpl) {
    const modal = this.modalService.create({
      nzTitle: '新建',
      nzContent: contentTpl,
      nzMaskClosable: false,
      nzOnOk: () => {
        let data: any;
        if (this.NziFormComponent.validForm()) {
          data = this.NziFormComponent.getFormData();
          this.create(data);
          this.envArray = [];
          this.NziFormComponent.resetForm();
          return true;
        } else {
          return false;
        }
      },
      nzOnCancel:  () => {
          return this.handleCancel();
      }
    });
    modal.afterOpen.subscribe(() => {
      // this.display_name = '';
      this.isChange = false;
    });
    this.getAvailableRoles();
  }


  handleCancel(): void {
    this.envArray = [];
    this.NziFormComponent.resetForm();
  }


  changeCode(name) {
    if (!this.isChange) {
      this.display_name = name;
    }
  }

  changeStatus() {
    this.isChange = true;
  }
  getInvalid(name) {
    if ( this.NziFormComponent === undefined ) {
      return false;
    }
    return this.NziFormComponent.getInvalidMessage(name) ;
  }

  getFormControl(name: number, i?, name1?) {
    if (name1) {
      const arr = this.validateForm.get('appenv_spec') as FormArray;
      const formGroup = arr.controls[i] as FormGroup;
      return formGroup.controls[name1];
    } else {
      return this.validateForm.controls[name];
    }
  }

  getDatas(name, email ): void {
    this.loading = true;
    this.userService.getApps(name, email).subscribe(datas => {
      this.loading = false;
      this.data = datas.data || [];
    });
  }

  create(data) {
    console.log(data);
    const mid = this.nzMessageService.loading('正在创建中', {nzDuration: 0}).messageId;
    this.userService.create(data).subscribe(respose => {
      this.getDatas(this.name, this.email);
      this.nzMessageService.success('创建成功！');
      this.nzMessageService.remove(mid);
    });
  }

  displayDataChange($event) {
    this.displayData = $event;
    this.refreshStatus();
  }

  refreshStatus() {
    const allChecked = this.displayData.every(value => value.checked === true);
    const allUnChecked = this.displayData.every(value => !value.checked);
    this.allChecked = allChecked;
    this.indeterminate = (!allChecked) && (!allUnChecked);
  }

  checkAll(value) {
    if (value) {
      this.displayData.forEach(data => {
        data.checked = true;
      });
    } else {
      this.displayData.forEach(data => {
        data.checked = false;
      });
    }
    this.refreshStatus();
  }

  showConfirm(id, name) {
    this.modalService.confirm({
      nzTitle  : '确认删除',
      nzContent: '<b>确认删除用户[' + name + ']？数据删除后将无法恢复!</b>',
      nzOnOk: () => {
        this.deleteUser(id);
      },
      nzOnCancel:  () => {
      }
    });
  }

  deleteUser(id) {
    const mid = this.nzMessageService.loading('正在删除', {nzDuration: 0}).messageId;
    this.userService.deleteUser(id).subscribe(res => {
      this.nzMessageService.success('删除成功！');
      this.nzMessageService.remove(mid);
      this.getDatas(this.name, this.email);
    });
  }

  getAvailableRoles() {

    this.userService.getAvailableRoles().subscribe((datas: any) => {
      this.roles = datas || ['user', 'admin'];
    });
    // this.roles =  ['user', 'admin'];
  }


  nameUnique(): ValidatorFn {
    return (control: FormControl): Promise<{[s: string]: boolean}> => {
      const name = control.value;
      return this.userService.nameUnique('default', 'application', name).then(res => {
        if (res) {
          return {unique: true};
        }
      });
    };
  }

  filterOption(inputValue: string, item: any): boolean {
    return item.title.indexOf(inputValue) > -1;
  }

  changeNamespace(ret: {}): void {
    let id = '';
    if (ret['from'] === 'left' && ret['to'] === 'right') {
      const changes = ret['list'];
      for (let i = 0; i < changes.length; i++) {
        const item = changes[i];
        id = item.key;
        this.userService.addUserToNamespace(item.key, item.description).subscribe();
      }
    }
    if (ret['from'] === 'right' && ret['to'] === 'left') {
      const changes = ret['list'];
      for (let i = 0; i < changes.length; i++) {
        const item = changes[i];
        id = item.key;
        this.userService.removeUserFromNamespace(item.key, item.description).subscribe();
      }
    }
    // this.loadUserNamespace(id);
  }

  showUserNamespaces(id, contentTpl) {
    this.modalService.create({
      nzTitle: '分配命名空间',
      nzContent: contentTpl,
      nzMaskClosable: false,
      nzFooter: null
    });
    this.loadUserNamespace(id);
    console.log(this.namespaceList.length);
  }

  loadUserNamespace(id) {
    this.namespaceList = [];
    const namespaces = [];
    this.userService.getUserAvailableNamespaces(id).subscribe((aData: any) => {
      for (let i = 0; i < aData.namespaces.length; i++) {
        const namespace = aData.namespaces[i];
        namespaces.push({
          key        : id,
          title      : namespace.objectMeta.annotations && namespace.objectMeta.annotations.displayName || namespace.objectMeta.name,
          description: namespace.objectMeta.name,
          direction  : 'right'
        });
      }
      this.userService.getUserUnavailableNamespaces(id).subscribe((uData: any) => {
        for (let i = 0; i < uData.namespaces.length; i++) {
          const namespace = uData.namespaces[i];
          namespaces.push({
            key        : id,
            title      : namespace.objectMeta.annotations && namespace.objectMeta.annotations.displayName || namespace.objectMeta.name,
            description: namespace.objectMeta.name,
            direction  : ''
          });
        }
        this.namespaceList = namespaces;
      });
    });

  }

  showedit(id, name, namespace, desc, contentTpl) {
    this.modalService.create({
      nzTitle: '重置密码',
      nzContent: contentTpl,
      nzMaskClosable: false,
      nzOnOk: () => {
        let date: any, editdata: any;
        if (this.NziFormComponent.validForm()) {
          date = this.NziFormComponent.getFormData();
          editdata = {
            id: id,
            password: date.password
          };
          this.edit(editdata, id) ;
          this.NziFormComponent.resetForm();
          return true; // 关闭对话框
        }else {
          return false; // 不关闭对话框
        }
      },
      nzOnCancel:  () => {
        return this.handleCancel();
      }
    });
  }
  edit(editdata, id) {
    const mid = this.nzMessageService.loading('', {nzDuration: 0}).messageId;
    this.userService.edit(editdata, id).subscribe(res => {
      this.nzMessageService.success('密码重置成功！');
      this.nzMessageService.remove(mid);
      this.getDatas(this.name, this.email);
    });
  }
  checkChange(enable: Boolean, data) {
    data.enable = enable;

    if (enable) {
      this.turnon(data) ;
    }else {
      this.turnoff(data);
    }
  }
  turnon(data) {
    const cent = this;
    this.modalService.confirm({
      nzTitle  : '确认启用该账号？',
      nzContent: '<b></b>',
      nzOnOk() {
        return cent.active(data.id, data);
      },
      nzOnCancel() {
        data.enable = false;
      }
    });
  }
  turnoff(data) {
    const cent = this;
    this.modalService.confirm({
      nzTitle  : '确认禁用该账号？',
      nzContent: '<b></b>',
      nzOnOk() {
        return cent.active(data.id, data);
      },
      nzOnCancel() {
        data.enable = true;
      }
    });
  }
  active(id: string, data): void  {
    // this.TaskTemplateService.update(this.ownerId,id,data).subscribe(respose => this.refreshData(this.ownerId));
  }
  search(): void {
    this.loading = true;
    this.userService.getApplication(this.name, this.email).subscribe(datas => {
      this.loading = false;
      this.data = datas || [];
    });
  }
  ngOnInit() {
    // 重置密码校验
    this.validateForm1 = this.fb.group({
      password: [null, [Validators.required, Validators.minLength(6)]],
      confirm_password: [null, [Validators.required, Validators.minLength(6)]]
    });
    // 新建用户校验
    this.validateForm = this.fb.group({
      name: [null, [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(25),
        Validators.pattern('^[a-z0-9]([-a-z0-9]*[a-z0-9])?$')]],
      email: [null, [Validators.required, Validators.email]],
      roles: [null],
      enable: [null],
      password: [null, [Validators.required, Validators.minLength(6), Validators.maxLength(25)]]
     // confirm_password: [null, [Validators.required]]
    });
    this.getDatas(this.name, this.email);
  }


  ngOnChanges() {

  }
}

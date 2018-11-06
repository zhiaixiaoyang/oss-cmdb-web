import {Component, EventEmitter, forwardRef, Input, OnInit, Output} from '@angular/core';

import {EnvironmentService} from './environment.services';
import {NzNotificationService} from 'ng-zorro-antd';
import {UserService} from '@trident/shared';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  ValidatorFn
} from '@angular/forms';

export const EXE_COUNTER_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => EnvironmentComponent),
  multi: true
};
export const validateRange: ValidatorFn = (control: AbstractControl): ValidationErrors => {
  return (!control.value) ?
    {'rangeError': '123'} : null;
};
export const EXE_COUNTER_VALIDATOR = {
  provide: NG_VALIDATORS,
  useValue: validateRange,
  multi: true
};

@Component({
  selector: 'app-environment',
  templateUrl: './environment.component.html',
  styleUrls: ['./environment.component.css'],
  providers: [EXE_COUNTER_VALUE_ACCESSOR, EXE_COUNTER_VALIDATOR]
})
export class EnvironmentComponent implements ControlValueAccessor, OnInit {

  @Output() change = new EventEmitter();
  @Input() Sm: number;
  @Input() nzPlaceHolder: string;
  @Input() Xs: number;
  @Input() width: number;
  @Input() nzSize: string;
  @Input() type = 'form';
  @Input() firstName: boolean;
  @Input() returnList: boolean;
  @Input() session = true;
  count;
  environmentName;

  constructor(private environmentService: EnvironmentService,
              private userService: UserService,
              private nzNotificationService: NzNotificationService) {
  }

  environments = [];
  _environment;

  get environment() {
    if (this.type === 'table' && this.width && this.returnList !== true) {
      document.getElementById('environmentId').style.width = this.width + 'px';
    } else if (this.type === 'table' && this.width && this.returnList === true){
      document.getElementById('environmentId2').style.width = this.width + 'px';
    }
    return this._environment;
  }

  set environment(value) {
    this._environment = value;
    for (let i=0; i< this.environments.length;i++) {
      if (this._environment === this.environments[i].id) {
        this.environmentName = '集群: ' + this.environments[i].displayName;
        if(this.session === true && this.returnList !== true) {
          sessionStorage.removeItem('environmentSession');
          sessionStorage.setItem('environmentSession',JSON.stringify(value));
        } else if (this.session === true && this.returnList === true) {
          sessionStorage.removeItem('environmentSessionList');
          sessionStorage.setItem('environmentSessionList',JSON.stringify(value));
        }
      }
    }
    this.propagateChange(this._environment);
  }

  propagateChange = (_: any) => {
  }

  writeValue(value: any) {
    if (value) {
      this.environment = value;
    } else {
      this.environment = null;
    }
  }

  registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any) {
  }

  // 获得environment数据
  getEnvironments(): void {
    this.environmentService.getEnvironment().subscribe(datas => {
      this.count = datas.length;
      this.environments = datas || [];
      if (this.environments.length < 1) {
        if (this.userService.isAdmin()) {
          this.nzNotificationService.info('提示信息', '请先创建集群！');
        } else {
          this.nzNotificationService.info('提示信息', '请先让管理员分配命名空间！');
        }
      }
      if (this.firstName === true && this.environments.length > 0) {
        if (this.session !== true) {
          if (this.returnList === true) {
            this.writeValue(this.environments[0]);
            this.change.emit(this.environment);
          } else {
            this.writeValue(this.environments[0].id);
            this.change.emit(this.environment);
          }
          this.environmentName = '集群: ' + this.environments[0].displayName;
        } else {
          if (this.returnList === true) {
            if (JSON.parse(sessionStorage.getItem('environmentSessionList'))) {
              this._environment = JSON.parse(sessionStorage.getItem('environmentSessionList'));
              this.writeValue(this._environment);
            } else {
              this.writeValue(this.environments[0]);
            }
            this.change.emit(this.environment);
          } else{
            if(JSON.parse(sessionStorage.getItem('environmentSession'))){
              this._environment = JSON.parse(sessionStorage.getItem('environmentSession'));
              this.writeValue(this._environment);
            } else {
              this.writeValue(this.environments[0].id);
            }
            this.change.emit(this.environment);
          }
        }

      }
      if (this.session === true && this.firstName !== true && this.environments.length > 0) {
        if (this.returnList === true) {
          if (JSON.parse(sessionStorage.getItem('environmentSessionList'))) {
            this._environment = JSON.parse(sessionStorage.getItem('environmentSessionList'));
            this.writeValue(this._environment);
          }
          this.change.emit(this.environment);
        } else{
          if(JSON.parse(sessionStorage.getItem('environmentSession'))){
            this._environment = JSON.parse(sessionStorage.getItem('environmentSession'));
            this.writeValue(this._environment);
          }
          this.change.emit(this.environment);
        }
      }
    });
  }

  // 输出namespace
  getEnvironment() {
    this.change.emit(this.environment);
  }

  ngOnInit() {
    this.getEnvironments();
  }
}

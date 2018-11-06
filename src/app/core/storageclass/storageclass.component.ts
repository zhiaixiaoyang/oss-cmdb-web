import {Component, EventEmitter, OnInit, Output, Input, forwardRef} from '@angular/core';

import {StorageclassService} from './storageclass.service';
import {
  ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS,
  AbstractControl, ValidatorFn, ValidationErrors, FormControl
} from '@angular/forms';

export const EXE_COUNTER_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => StorageclassComponent),
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
  selector: 'app-storageclass',
  templateUrl: './storageclass.component.html',
  styleUrls: ['./storageclass.component.css'],
  providers: [EXE_COUNTER_VALUE_ACCESSOR, EXE_COUNTER_VALIDATOR]
})
export class StorageclassComponent implements ControlValueAccessor, OnInit {

  @Output() change = new EventEmitter();
  @Input() Sm: number;
  @Input() nzPlaceHolder: string;
  @Input() Xs: number;
  @Input() width: number;
  @Input() nzSize: string;
  @Input() type = 'form';
  @Input() firstName: boolean;
  loading;
  count;

  @Input()
  set environment(environment: string) {
    this._environment = environment;
    this.getStorageclasses(this.namespace, environment);
  }

  get environment(): string {
    return this._environment;
  }

  _environment;

  @Input()
  set namespace(namespace: string) {
    this._namespace = namespace;
    this.getStorageclasses(namespace, this.environment);
  }

  get namespace(): string {
    return this._namespace;
  }

  _namespace: string;

  storageNamespaceRef = [
    {
      provisioner: 'kubernetes.io/glusterfs',
      namespaceKey: 'secretNamespace'
    },
    {
      provisioner: 'kubernetes.io/cephfs',
      namespaceKey: 'adminSecretNamespace'
    },
    {
      provisioner: 'kubernetes.io/quobyte',
      namespaceKey: 'adminSecretNamespace'
    },
    {
      provisioner: 'kubernetes.io/rbd',
      namespaceKey: 'adminSecretNamespace'
    },
    {
      provisioner: 'kubernetes.io/storageos',
      namespaceKey: 'adminSecretNamespace'
    }
  ];

  constructor(private storageclassService: StorageclassService) {
  }

  storageclasses = [];
  _storageclass;

  get storageclass() {
    if (this.type === 'table' && this.width) {
      document.getElementById('storageclassId').style.width = this.width + 'px';
    }
    return this._storageclass;
  }

  set storageclass(value) {
    this._storageclass = value;
    this.propagateChange(this._storageclass);
  }

  propagateChange = (_: any) => {
  };

  writeValue(value: any) {
    if (value) {
      this.storageclass = value;
    } else {
      this.storageclass = null;
    }
  }

  registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any) {
  }

  // 获得storageclass数据
  getStorageclasses(namespace, environment): void {
    if (environment && namespace) {
      this.loading = true;
      this.storageclassService.getStorageclasses(environment, namespace).subscribe(datas => {
        this.loading = false;
        this.storageclasses = [];
        let display = [], name = [];
        if (datas.objectMeta.hasOwnProperty('annotations')) {
          if(datas.objectMeta.annotations.hasOwnProperty('storageclass-displayname')) {
            display = datas.objectMeta.annotations['storageclass-displayname'].split(';');
            name = datas.objectMeta.annotations['storageclass-name'].split(';');
          }
        }
        if (display.length < 1 && datas.objectMeta.hasOwnProperty('labels')) {
          if(datas.objectMeta.labels.hasOwnProperty('storageclass-displayname')) {
            display = datas.objectMeta.labels['storageclass-displayname'].split('.');
            name = datas.objectMeta.labels['storageclass-name'].split('.');
          }
        }
        for (let i = 0; i < display.length; i++) {
          this.storageclasses.push({'displayName': display[i], 'name': name[i]});
        }
        this.count = this.storageclasses.length;
        if (this.firstName === true && this.storageclasses.length > 0) {
          this.writeValue(this.storageclasses[0].name);
          this.change.emit(this.storageclass);
        }
      });
    }
  }

  // 输出storageclass
  getStorageclass() {
    this.change.emit(this.storageclass);
  }

  ngOnInit() {
    this.getStorageclasses(this.namespace, this.environment);
  }
}

import {Component, EventEmitter, OnInit, Output, Input, forwardRef} from '@angular/core';

import {NamespaceService} from './namespace.service';
import {
  ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS,
  AbstractControl, ValidatorFn, ValidationErrors, FormControl
} from '@angular/forms';

export const EXE_COUNTER_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => NamespaceComponent),
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
  selector: 'app-namespace',
  templateUrl: './namespace.component.html',
  styleUrls: ['./namespace.component.css'],
  providers: [EXE_COUNTER_VALUE_ACCESSOR, EXE_COUNTER_VALIDATOR]
})
export class NamespaceComponent implements ControlValueAccessor, OnInit {

  @Output() change = new EventEmitter();
  @Input() Sm: number;
  @Input() nzPlaceHolder: string;
  @Input() Xs: number;
  @Input() width: number;
  @Input() nzSize: string;
  @Input() type = 'form';
  @Input() firstName: boolean;
  count;
  loading;

  constructor(private namespaceService: NamespaceService) {
  }

  namespaces = [];
  _nameSpace;
  _environment: string;

  @Input()
  set environment(environment: string) {
    this._environment = environment;
    this.getNamespaces(environment);
  }

  get environment(): string {
    return this._environment;
  }


  get nameSpace() {
    if (this.type === 'table' && this.width) {
      document.getElementById('namespaceId').style.width = this.width + 'px';
    }
    return this._nameSpace;
  }

  set nameSpace(value) {
    this._nameSpace = value;
    this.propagateChange(this._nameSpace);
  }

  propagateChange = (_: any) => {
  }

  writeValue(value: any) {
    if (value) {
      this.nameSpace = value;
    }else {
      this.nameSpace = null;
    }
  }

  registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any) {
  }

  // 获得namespace数据
  getNamespaces(id): void {
    if (id) {
      this.loading = true;
      this.namespaces = [];
      this.namespaceService.getNamespaces(id).subscribe(datas => {
        this.loading = false;
        this.count = datas.namespaces.length;
        if (this.count > 0) {
          for (const namespace of datas.namespaces) {
            if (namespace.objectMeta.annotations && namespace.objectMeta.annotations.displayName) {
              namespace.displayName = namespace.objectMeta.annotations.displayName;
            } else {
              namespace.displayName = namespace.objectMeta.name;
            }
            this.namespaces.push(namespace);
          }
        }
        if (this.firstName === true && this.namespaces.length > 0) {
          this.writeValue(this.namespaces[0].objectMeta.name);
          this.change.emit(this.nameSpace);
        }
      });
    }
  }

  // 输出namespace
  getNamespace() {
    this.change.emit(this.nameSpace);
  }

  ngOnInit() {
    this.getNamespaces(this.environment);
  }
}

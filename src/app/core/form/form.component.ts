import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html'
})
export class FormComponent {
  @Input() formName;

  getFormData(): any {
    let data: any = {};
    for (const i in this.formName.controls) {
      if (i) {
        data[i] = this.formName.controls[i].value;
      }
    }
    return data;
  }

  validForm(): boolean {
    for (const i in this.formName.controls) {
      if (i) {
        this.formName.controls[i].markAsDirty();
        this.formName.controls[i].updateValueAndValidity();
      }
    }

    return this.formName.status === 'VALID';
  }

  resetForm() {
    this.formName.reset();
    for (const key in this.formName.controls) {
      if (key) {
        this.formName.controls[key].markAsPristine();
      }
    }
  }


}

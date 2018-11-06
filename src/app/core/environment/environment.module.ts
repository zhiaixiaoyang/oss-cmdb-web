import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import {FormsModule} from '@angular/forms';
import {UserService} from '@trident/shared';

import {EnvironmentComponent} from './environment.component';
import {EnvironmentService} from './environment.services';


@NgModule({
  imports: [
    NgZorroAntdModule,
    CommonModule,
    FormsModule
  ],
  declarations: [
    EnvironmentComponent
  ],
  exports: [ EnvironmentComponent ],
  providers: [ EnvironmentService, UserService]
})
export class EnvironmentModule {}


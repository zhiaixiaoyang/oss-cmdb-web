import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { FormsModule} from '@angular/forms';

import {NamespaceComponent} from './namespace.component';
import {NamespaceService} from './namespace.service';


@NgModule({
  imports: [
    NgZorroAntdModule,
    CommonModule,
    FormsModule,
  ],
  declarations: [
    NamespaceComponent
  ],
  exports: [ NamespaceComponent ],
  providers: [ NamespaceService]
})
export class NamespaceModule {}


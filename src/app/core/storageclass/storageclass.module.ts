import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { FormsModule} from '@angular/forms';

import {StorageclassComponent} from './storageclass.component';
import {StorageclassService} from './storageclass.service';


@NgModule({
  imports: [
    NgZorroAntdModule,
    CommonModule,
    FormsModule,
  ],
  declarations: [
    StorageclassComponent
  ],
  exports: [ StorageclassComponent ],
  providers: [ StorageclassService]
})
export class StorageclassModule {}


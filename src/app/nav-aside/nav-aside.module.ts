import { NgModule }          from '@angular/core';
import { FormsModule }       from '@angular/forms';
import { CommonModule }      from '@angular/common';
import { RouterModule }      from '@angular/router';
import { NgZorroAntdModule } from 'ng-zorro-antd';

import { NavAsideComponent } from './nav-aside.component';
import { NavItemComponent }  from './nav-item/nav-item.component';
import { MenuService } from '../shared';

@NgModule({
  imports: [
    FormsModule,
    RouterModule,
    CommonModule,
    NgZorroAntdModule
  ],
  declarations: [
    NavAsideComponent,
    NavItemComponent
  ],
  exports: [
    NavAsideComponent,
    NavItemComponent
  ],
  providers: [
    MenuService
  ]
})
export class NavAsideModule { }

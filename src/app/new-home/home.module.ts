import { NgModule } from "@angular/core";
import { RouterModule, Routes } from '@angular/router';
import { NgZorroAntdModule } from 'ng-zorro-antd';

import { NewHomeComponnent } from "./home.component";

const routes: Routes = [
  {
    path: '', component: NewHomeComponnent
  }
];

@NgModule({
  imports: [
    RouterModule,
    RouterModule.forChild(routes),
    NgZorroAntdModule
  ],
  declarations: [NewHomeComponnent]
})
export class NewHomeModule {

}

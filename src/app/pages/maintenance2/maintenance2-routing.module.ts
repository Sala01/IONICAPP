import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Maintenance2Page } from './maintenance2.page';

const routes: Routes = [
  {
    path: '',
    component: Maintenance2Page
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class Maintenance2PageRoutingModule {}

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OperationPage } from './operation.page';

const routes: Routes = [
  {
    path: '',
    component: OperationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OperationPageRoutingModule {}

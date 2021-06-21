import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { Maintenance2PageRoutingModule } from './maintenance2-routing.module';

import { Maintenance2Page } from './maintenance2.page';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Maintenance2PageRoutingModule,
    NgxDatatableModule
  ],
  declarations: [Maintenance2Page]
})
export class Maintenance2PageModule {}

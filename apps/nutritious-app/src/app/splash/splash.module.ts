import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxColorsModule } from 'ngx-colors';

import { SplashRoutingModule } from './splash-routing.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SplashRoutingModule,
    FormsModule,
    NgxColorsModule
  ]
})
export class SplashModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PortfoliosRoutingModule } from './portfolios-routing.module';
import { PortfoliosPageComponent } from './pages/portfolios-page/portfolios-page.component';


@NgModule({
  declarations: [
    PortfoliosPageComponent
  ],
  imports: [
    CommonModule,
    PortfoliosRoutingModule
  ]
})
export class PortfoliosModule { }

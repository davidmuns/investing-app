import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalPortfolioComponent } from './modal-portfolio/modal-portfolio.component';
import { PortfoliosComponent } from './portfolios.component';
import { SharedModule } from '@app/shared/shared.module';
import { SearchInstrumentComponent } from './search-instrument/search-instrument.component';
import { LayoutModule } from '@app/layout/layout.module';

@NgModule({
  declarations: [ModalPortfolioComponent, PortfoliosComponent, SearchInstrumentComponent],
  imports: [CommonModule, SharedModule, LayoutModule],
})
export class PortfoliosModule {}

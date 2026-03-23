import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalPortfolioComponent } from './modal-portfolio/modal-portfolio.component';
import { PortfoliosComponent } from './portfolios.component';
import { SharedModule } from '@app/shared/shared.module';
import { TableComponent } from '../table/table.component';
import { SearchInstrumentComponent } from './search-instrument/search-instrument.component';

@NgModule({
  declarations: [ModalPortfolioComponent, PortfoliosComponent, SearchInstrumentComponent],
  imports: [CommonModule, SharedModule],
})
export class PortfoliosModule {}

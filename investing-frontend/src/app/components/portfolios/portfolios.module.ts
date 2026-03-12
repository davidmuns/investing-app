import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalPortfolioComponent } from './modal-portfolio/modal-portfolio.component';
import { PortfoliosComponent } from './portfolios.component';
import { SharedModule } from '@app/shared/shared.module';
import { TableComponent } from '../table/table.component';
import { SearchPositionGptComponent } from './search-position-gpt/search-position-gpt.component';
import { SearchPositionOriolComponent } from './search-position-oriol/search-position-oriol.component';

@NgModule({
  declarations: [ModalPortfolioComponent, PortfoliosComponent, SearchPositionGptComponent, SearchPositionOriolComponent],
  imports: [CommonModule, SharedModule],
})
export class PortfoliosModule {}

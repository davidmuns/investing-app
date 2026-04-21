import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalPortfolioComponent } from './modal-portfolio/modal-portfolio.component';
import { PortfoliosComponent } from './portfolios.component';
import { SharedModule } from '@app/shared/shared.module';
import { SearchInstrumentComponent } from './search-instrument/search-instrument.component';
import { LayoutModule } from '@app/layout/layout.module';
import { TableModule } from '../tables/table.module';
import { AddPositionFormComponent } from './add-position-form/add-position-form.component';
import { PositionSummaryPanelComponent } from './position-summary-panel/position-summary-panel.component';
import { PositionClosePanelComponent } from './position-close-panel/position-close-panel.component';
import { PortfolioTabsComponent } from './portfolio-tabs/portfolio-tabs.component';

@NgModule({
  declarations: [
    ModalPortfolioComponent,
    PortfoliosComponent,
    SearchInstrumentComponent,
    AddPositionFormComponent,
    PositionSummaryPanelComponent,
    PositionClosePanelComponent,
    PortfolioTabsComponent,
  ],
  imports: [CommonModule, SharedModule, LayoutModule, TableModule],
})
export class PortfoliosModule {}

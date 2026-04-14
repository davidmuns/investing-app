import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InstrumentTableComponent } from './instrument/instrument-table.component';
import { PositionTableComponent } from './position/position-table.component';
import { PositionEditFormComponent } from './position/position-edit-form/position-edit-form.component';
import { SharedModule } from '@app/shared/shared.module';
import { PositionCloseTableComponent } from './position-close-table/position-close-table.component';
import { PositionOpenTableComponent } from './position-open-table/position-open-table.component';

@NgModule({
  declarations: [
    InstrumentTableComponent,
    PositionTableComponent,
    PositionEditFormComponent,
    PositionCloseTableComponent,
    PositionOpenTableComponent,
  ],
  imports: [CommonModule, SharedModule],
  exports: [InstrumentTableComponent, PositionTableComponent, PositionCloseTableComponent, PositionOpenTableComponent],
})
export class TableModule {}

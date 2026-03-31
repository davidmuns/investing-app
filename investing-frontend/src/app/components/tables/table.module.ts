import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InstrumentTableComponent } from './instrument/instrument-table.component';
import { PositionService } from '@app/services/position.service';
import { PositionTableComponent } from './position/position-table.component';
import { PositionEditFormComponent } from './position/position-edit-form/position-edit-form.component';
import { SharedModule } from '@app/shared/shared.module';

@NgModule({
  declarations: [InstrumentTableComponent, PositionTableComponent, PositionEditFormComponent],
  imports: [CommonModule, SharedModule],
  exports: [InstrumentTableComponent, PositionTableComponent],
})
export class TableModule {}

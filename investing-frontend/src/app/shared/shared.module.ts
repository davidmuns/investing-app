import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material/material.module';
import { PipesModule } from './pipes/pipes.module';
import { FormTemplateComponent } from './form-template/form-template.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InstrumentTableComponent } from '@app/components/tables/instrument/instrument-table.component';
import { PositionTableComponent } from '@app/components/tables/position/position-table.component';

@NgModule({
  declarations: [FormTemplateComponent, InstrumentTableComponent, PositionTableComponent],
  imports: [CommonModule, MaterialModule, ReactiveFormsModule, FormsModule],
  exports: [
    CommonModule,
    MaterialModule,
    PipesModule,
    FormTemplateComponent,
    ReactiveFormsModule,
    FormsModule,
    InstrumentTableComponent,
    PositionTableComponent,
  ],
})
export class SharedModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material/material.module';
import { PipesModule } from './pipes/pipes.module';
import { FormTemplateComponent } from './form-template/form-template.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableComponent } from '@app/components/table/table.component';

@NgModule({
  declarations: [FormTemplateComponent, TableComponent],
  imports: [CommonModule, MaterialModule, ReactiveFormsModule, FormsModule],
  exports: [
    CommonModule,
    MaterialModule,
    PipesModule,
    FormTemplateComponent,
    ReactiveFormsModule,
    FormsModule,
    TableComponent,
  ],
})
export class SharedModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material/material.module';
import { SearchPipe } from './pipes/search-bar.pipe';
import { PipesModule } from './pipes/pipes.module';

@NgModule({
  imports: [CommonModule, MaterialModule],
  exports: [CommonModule, MaterialModule, PipesModule],
})
export class SharedModule {}

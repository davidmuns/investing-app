import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchPipe } from './search-bar.pipe';

@NgModule({
  declarations: [SearchPipe],
  imports: [CommonModule],
  exports: [SearchPipe],
})
export class PipesModule {}

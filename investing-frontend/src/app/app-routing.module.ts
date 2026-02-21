import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PortfoliosComponent } from './components/portfolios/portfolios.component';

const routes: Routes = [
  { path: '', redirectTo: 'portfolios', pathMatch: 'full' },
  { path: 'portfolios', component: PortfoliosComponent },
  { path: '**', redirectTo: 'portfolios' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PortfoliosComponent } from './components/portfolios/portfolios.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { LayoutModule } from './layout/layout.module';
import { SharedModule } from './shared/shared.module';
import { AuthComponent } from './components/auth/auth.component';
import { AuthModule } from './components/auth/auth.module';
import { TableComponent } from './components/table/table.component';
import { ModalPortfolioComponent } from './components/portfolios/modal-portfolio/modal-portfolio.component';

@NgModule({
  declarations: [AppComponent, PortfoliosComponent, AuthComponent, TableComponent, ModalPortfolioComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    LayoutModule,
    SharedModule,
    AuthModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}

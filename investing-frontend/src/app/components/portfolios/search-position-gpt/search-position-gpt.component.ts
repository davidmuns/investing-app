import { Component, OnInit } from '@angular/core';
import { PortfolioResponse } from '@app/shared/models/portfolios-response';

@Component({
  selector: 'app-search-position-gpt',
  templateUrl: './search-position-gpt.component.html',
  styleUrls: ['./search-position-gpt.component.css'],
})
export class SearchPositionGptComponent implements OnInit {
  symbolQuery = '';
  symbolError = '';
  portfolios: PortfolioResponse[] = [];
  selectedIndex = 0;

  constructor() {}

  ngOnInit(): void {}

  submitSymbol(): void {
    const q = this.symbolQuery.trim();
    if (!q) {
      this.symbolError = 'Introduce un símbolo o búsqueda.';
      return;
    }
    this.symbolError = '';
    console.log('ADD SYMBOL =>', {
      portfolioId: this.portfolios[this.selectedIndex]?.id,
      query: q,
    });

    // Por ahora solo limpiamos el input
    this.symbolQuery = '';
  }
}

import { Pipe, PipeTransform } from '@angular/core';
import { PortfolioResponse } from '../models/portfolios-response';

@Pipe({
  name: 'searchBar',
})
export class SearchPipe implements PipeTransform {
  transform(portfolios: PortfolioResponse[] = [], searchTerm: string = ''): PortfolioResponse[] {
    if (!searchTerm.trim()) return portfolios;

    const normalizedSearchTerm = this.normalizeText(searchTerm);

    return portfolios.filter((portfolio) => this.normalizeText(portfolio.name).includes(normalizedSearchTerm));
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD') // Descompone caracteres como á en a
      .replace(/[\u0300-\u036f]/g, ''); // Elimina los diacríticos
  }
}

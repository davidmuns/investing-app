import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { PositionSummaryResponse } from '@app/shared/models/position-summary-response';

@Component({
  selector: 'app-position-summary-panel',
  templateUrl: './position-summary-panel.component.html',
  styleUrls: ['./position-summary-panel.component.css'],
})
export class PositionSummaryPanelComponent {
  @Input() positionsSummary: PositionSummaryResponse[] = [];
  marketValue = 0;
  totalProfitLossValue = 0;
  totalProfitLossPercentage = 0;
  dailyProfitLossValue = 0;
  dailyProfitLossPercentage = 0;

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['positionsSummary']) {
      this.updateSummary();
    }
  }

  private updateSummary(): void {
    let marketValue = 0;
    let totalProfitLossValue = 0;
    let dailyProfitLossValue = 0;
    let previousPortfolioValue = 0;

    for (const position of this.positionsSummary) {
      marketValue += position.marketValue;
      totalProfitLossValue += position.netProfitLoss;
      dailyProfitLossValue += position.dailyProfitLoss;
      previousPortfolioValue += position.marketValue - position.dailyProfitLoss;
    }

    const costBasis = marketValue - totalProfitLossValue;

    this.marketValue = marketValue;
    this.totalProfitLossValue = totalProfitLossValue;
    this.totalProfitLossPercentage = costBasis !== 0 ? (totalProfitLossValue / costBasis) * 100 : 0;

    this.dailyProfitLossValue = dailyProfitLossValue;
    this.dailyProfitLossPercentage =
      previousPortfolioValue !== 0 ? (dailyProfitLossValue / previousPortfolioValue) * 100 : 0;
  }
}

import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { PositionResponse } from '@app/shared/models/position-response';
import { PositionSummaryResponse } from '@app/shared/models/position-summary-response';

@Component({
  selector: 'app-position-summary-panel',
  templateUrl: './position-summary-panel.component.html',
  styleUrls: ['./position-summary-panel.component.css'],
})
export class PositionSummaryPanelComponent implements OnInit {
  @Input() positions: PositionResponse[] = [];
  @Input() positionsSummary: PositionSummaryResponse[] = [];
  marketValue = 0;
  totalNetAmount = 0;
  totalProfitLossValue = 0;
  totalProfitLossPercentage = 0;
  dailyProfitLossValue = 0;
  dailyProfitLossPercentage = 0;

  constructor() {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['positions'] || changes['positionsSummary']) {
      this.calculateDailyProfitLoss();
      this.calculateTotalProfitLoss();
    }
  }

  private calculateTotalProfitLoss() {
    const totals = this.positions.reduce(
      (acc, position) => {
        acc.closePrice += position.close * position.quantity;
        acc.netAmount += position.netAmount;
        return acc;
      },
      { closePrice: 0, netAmount: 0 },
    );
    this.marketValue = totals.closePrice;
    this.totalNetAmount = totals.netAmount;
    this.totalProfitLossValue = this.marketValue - this.totalNetAmount;
    this.totalProfitLossPercentage = this.marketValue != 0 ? (this.marketValue / this.totalNetAmount - 1) * 100 : 0;
  }

  private calculateDailyProfitLoss() {
    const totals = this.positions.reduce(
      (acc, position) => {
        const previousValue = position.previousClose * position.quantity;
        const dailyValue = (position.close - position.previousClose) * position.quantity;

        acc.previousPortfolioValue += previousValue;
        acc.dailyProfitLossValue += dailyValue;

        return acc;
      },
      {
        previousPortfolioValue: 0,
        dailyProfitLossValue: 0,
      },
    );

    this.dailyProfitLossValue = totals.dailyProfitLossValue;
    this.dailyProfitLossPercentage =
      totals.previousPortfolioValue !== 0 ? (totals.dailyProfitLossValue / totals.previousPortfolioValue) * 100 : 0;
  }
}

import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { PositionCloseResponse } from '@app/shared/models/position-close-response';

@Component({
  selector: 'app-position-close-panel',
  templateUrl: './position-close-panel.component.html',
  styleUrls: ['./position-close-panel.component.css'],
})
export class PositionClosePanelComponent implements OnInit {
  @Input() positions: PositionCloseResponse[] = [];
  @Output() selectedSymbol = new EventEmitter<string>();
  @Input() symbol = '';
  sum = 0;
  uniqueSymbols: string[] = [];

  constructor() {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['positions'] || changes['symbol']) {
      this.buildUniqueSymbols();
      this.sumPositions();
    }
  }

  onSymbolClicked(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedSymbol.emit(value);
  }

  private sumPositions(): void {
    const filtered = this.symbol ? this.positions.filter((p) => p.symbol === this.symbol) : this.positions;

    this.sum = filtered.reduce((acc, p) => acc + p.profitLoss, 0);
  }

  private buildUniqueSymbols(): void {
    this.uniqueSymbols = [...new Set(this.positions.map((p) => p.symbol))];
  }
}

import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { PositionCloseResponse } from '@app/shared/models/position-close-response';

@Component({
  selector: 'app-position-close-panel',
  templateUrl: './position-close-panel.component.html',
  styleUrls: ['./position-close-panel.component.css'],
})
export class PositionClosePanelComponent implements OnInit {
  @Input() positions: PositionCloseResponse[] = [];
  sum = 0;

  constructor() {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['positions']) {
      this.sumPositions();
    }
  }

  sumPositions() {
    this.sum = this.positions.reduce((acc, p) => acc + p.profitLoss, 0);
  }
}

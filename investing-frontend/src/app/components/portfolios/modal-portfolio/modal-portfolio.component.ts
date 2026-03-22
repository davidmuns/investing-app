import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { PortfolioRequest } from '@app/shared/models/portfolios-request';

@Component({
  selector: 'app-modal-portfolio',
  templateUrl: './modal-portfolio.component.html',
  styleUrls: ['./modal-portfolio.component.css'],
})
export class ModalPortfolioComponent {
  constructor(private dialogRef: MatDialogRef<ModalPortfolioComponent>) {}

  onPortfolioRequest(newPortfolio: PortfolioRequest): void {
    this.dialogRef.close(newPortfolio);
  }
}

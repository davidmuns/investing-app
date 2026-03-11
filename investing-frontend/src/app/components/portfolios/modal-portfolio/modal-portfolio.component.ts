import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-modal-portfolio',
  templateUrl: './modal-portfolio.component.html',
  styleUrls: ['./modal-portfolio.component.css'],
})
export class ModalPortfolioComponent {
  constructor(private dialogRef: MatDialogRef<ModalPortfolioComponent>) {}

  onPortfolioCreated(created: any): void {
    this.dialogRef.close(created);
  }
}

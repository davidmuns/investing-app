import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { UtilsService } from '@app/services/utils.service';
import { InstrumentResponse } from '@app/shared/models/instrument-response';
import { PositionRequest } from '@app/shared/models/position-request';

@Component({
  selector: 'app-add-position-form',
  templateUrl: './add-position-form.component.html',
  styleUrls: ['./add-position-form.component.css'],
})
export class AddPositionFormComponent implements OnInit {
  positionForm = {
    operation: 'Compra',
    date: '',
    quantity: '',
    price: '',
    commission: '',
  };
  @Input() positionFormEnabled = false;
  @Input() selectedInstrument: InstrumentResponse | null = null;
  @Input() instrumentName: string = '';
  @Input() portfolioId: number = 0;
  @Input() instrumentExchange: string = '';
  @Input() instrumentSymbol: string = '';
  @Input() closePrice = 0;
  @Output() createPosition = new EventEmitter<PositionRequest>();

  constructor(private utilsSvc: UtilsService) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['positionFormEnabled'] || changes['selectedInstrument'] || changes['closePrice']) {
      this.setPositionForm();
    }
  }

  setPositionForm() {
    this.positionForm.date = this.utilsSvc.getTodayDate();
    this.positionForm.price = this.utilsSvc.toInputNumber(this.closePrice);
  }

  canSubmitPosition(): boolean {
    return !!(
      this.positionFormEnabled &&
      this.selectedInstrument &&
      this.positionForm.quantity.trim() &&
      this.positionForm.price.trim() &&
      this.positionForm.date.trim()
    );
  }

  submitPosition(): void {
    if (!this.canSubmitPosition() || !this.selectedInstrument) return;

    const payload: PositionRequest = {
      name: this.instrumentName,
      portfolioId: this.portfolioId,
      type: this.positionForm.operation,
      date: this.positionForm.date,
      exchange: this.instrumentExchange,
      quantity: this.utilsSvc.parseLocalizedNumber(this.positionForm.quantity),
      price: this.utilsSvc.parseLocalizedNumber(this.positionForm.price),
      fee: this.utilsSvc.parseLocalizedNumber(this.positionForm.commission || '0'),
      symbol: this.instrumentSymbol,
    };
    this.createPosition.emit(payload);
  }

  blockInvalidNumberKey(event: KeyboardEvent) {
    this.utilsSvc.blockInvalidNumberKey(event);
  }
}

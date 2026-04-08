import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { UtilsService } from '@app/services/utils.service';
import { InstrumentResponse } from '@app/shared/models/instrument-response';
import { PositionRequest } from '@app/shared/models/position-request';
import { AddPositionFormModel, PositionFormModel } from '@app/shared/types/position-form-model';

@Component({
  selector: 'app-add-position-form',
  templateUrl: './add-position-form.component.html',
  styleUrls: ['./add-position-form.component.css'],
})
export class AddPositionFormComponent implements OnInit {
  form: AddPositionFormModel = {
    id: 0,
    symbol: '',
    date: '',
    quantity: '1',
    price: '1',
    commission: '',
    operation: 'Compra',
  };
  @Input() positionFormEnabled = false;
  @Input() selectedInstrument: InstrumentResponse | null = null;
  @Input() instrumentName: string = '';
  @Input() portfolioId: number = 0;
  @Input() instrumentExchange: string = '';
  @Input() instrumentSymbol: string = '';
  @Input() closePrice = 1;
  @Output() createPosition = new EventEmitter<PositionRequest>();
  today = '';

  constructor(private utilsSvc: UtilsService) {}

  ngOnInit(): void {
    this.today = this.utilsSvc.getTodayDate();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['positionFormEnabled'] || changes['selectedInstrument'] || changes['closePrice']) {
      this.setPositionForm();
    }
  }

  setPositionForm() {
    this.form.date = this.utilsSvc.getTodayDate();
    this.form.price = this.utilsSvc.toInputNumber(this.closePrice);
  }

  canSubmitPosition(form: AddPositionFormModel): boolean {
    return !!(
      this.positionFormEnabled &&
      this.selectedInstrument &&
      this.utilsSvc.isValidDate(form.date) &&
      this.utilsSvc.isValidPositiveNumber(form.quantity) &&
      this.utilsSvc.isValidPositiveNumber(form.price)
    );
  }

  submitPosition(form: AddPositionFormModel): void {
    if (!this.canSubmitPosition(form) || !this.selectedInstrument) return;

    const payload: PositionRequest = {
      name: this.instrumentName,
      portfolioId: this.portfolioId,
      type: form.operation,
      date: form.date,
      exchange: this.instrumentExchange,
      quantity: this.utilsSvc.parseLocalizedNumber(form.quantity),
      price: this.utilsSvc.parseLocalizedNumber(form.price),
      fee: this.utilsSvc.parseLocalizedNumber(form.commission || '0'),
      symbol: this.instrumentSymbol,
    };
    this.createPosition.emit(payload);
  }

  getQuantityMsgError(form: PositionFormModel): string {
    return this.utilsSvc.getQuantityErrorMsg(form.quantity);
  }

  getPriceMsgError(form: PositionFormModel): string {
    return this.utilsSvc.getPriceErrorMsg(form.price);
  }

  blockInvalidNumberKey(event: KeyboardEvent) {
    this.utilsSvc.blockInvalidNumberKey(event);
  }
}

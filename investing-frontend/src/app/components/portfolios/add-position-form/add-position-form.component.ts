import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { UtilsService } from '@app/services/utils.service';
import { InstrumentResponse } from '@app/shared/models/instrument-response';
import { PositionRequest } from '@app/shared/models/position-request';
import { FormMode, PositionFormModel } from '@app/shared/types/position-form-model';

@Component({
  selector: 'app-add-position-form',
  templateUrl: './add-position-form.component.html',
  styleUrls: ['./add-position-form.component.css'],
})
export class AddPositionFormComponent implements OnInit {
  // positionForm = {
  //   operation: 'Compra',
  //   date: '',
  //   quantity: '',
  //   price: '',
  //   commission: '',
  // };
  mode: FormMode = 'edit';
  positionForm: PositionFormModel = {
    id: 0,
    symbol: '',
    date: '',
    quantity: '',
    price: '',
    commission: '',
    operation: 'Compra',
    mode: this.mode,
    original: {
      date: '',
      quantity: '',
      price: '',
      commission: '',
    },
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

  canSubmitPosition(form: PositionFormModel): boolean {
    return !!(
      this.positionFormEnabled &&
      this.selectedInstrument &&
      this.utilsSvc.isValidDate(form.date) &&
      this.utilsSvc.isValidPositiveNumber(form.quantity) &&
      this.utilsSvc.isValidPositiveNumber(form.price)
    );
  }

  submitPosition(form: PositionFormModel): void {
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
    return this.utilsSvc.getQuantityMsgError(form, 0);
  }

  getPriceMsgError(form: PositionFormModel): string {
    return this.utilsSvc.getPriceMsgError(form);
  }

  blockInvalidNumberKey(event: KeyboardEvent) {
    this.utilsSvc.blockInvalidNumberKey(event);
  }
}

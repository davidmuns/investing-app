import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { InstrumentResponse } from '@app/shared/models/instrument-response';
import { PortfolioResponse } from '@app/shared/models/portfolios-response';
import { PositionRequest } from '@app/shared/models/position-request';
import { PositionResponse } from '@app/shared/models/position-response';

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
  // @Input() isWatchlist = false;
  // @Input() positionFormVisible = false;
  @Input() positionFormEnabled = false;
  // @Input() portfolios: PortfolioResponse[] = [];
  @Input() selectedInstrument: InstrumentResponse | null = null;
  @Input() instrumentName: string = '';
  @Input() portfolioId: number = 0;
  @Input() instrumentExchange: string = '';
  @Input() instrumentSymbol: string = '';
  // @Input() positions: PositionResponse[] = [];
  @Input() closePrice = 0;
  @Output() createPosition = new EventEmitter<PositionRequest>();

  constructor() {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (
      // changes['positions'] ||
      changes['positionFormEnabled'] ||
      changes['selectedInstrument'] ||
      changes['closePrice']
    ) {
      this.setPositionForm();
    }
  }

  setPositionForm() {
    this.positionForm.date = this.getTodayForInput();
    this.positionForm.price = this.toInputNumber(this.closePrice);
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
      quantity: this.parseLocalizedNumber(this.positionForm.quantity),
      price: this.parseLocalizedNumber(this.positionForm.price),
      fee: this.parseLocalizedNumber(this.positionForm.commission || '0'),
      symbol: this.instrumentSymbol,
    };
    this.createPosition.emit(payload);
  }

  blockInvalidNumberKey(event: KeyboardEvent): void {
    const allowedControlKeys = [
      'Backspace',
      'Delete',
      'Tab',
      'Escape',
      'Enter',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End',
    ];

    // Permitir atajos tipo Ctrl+C, Ctrl+V, Ctrl+A, Ctrl+X
    if (event.ctrlKey || event.metaKey) {
      return;
    }

    // Permitir teclas de control
    if (allowedControlKeys.includes(event.key)) {
      return;
    }

    // Permitir números
    if (/^\d$/.test(event.key)) {
      return;
    }

    // Permitir coma
    if (event.key === ',') {
      return;
    }

    // Bloquear todo lo demás, incluido el punto
    event.preventDefault();
  }

  private toInputNumber(value: number | string | null | undefined): string {
    if (value === null || value === undefined) return '';
    return String(value).replace('.', ',');
  }

  private getTodayForInput(): string {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private parseLocalizedNumber(value: string): number {
    const normalized = (value || '').replace(/\./g, '').replace(',', '.').trim();
    return normalized ? Number(normalized) : 0;
  }
}

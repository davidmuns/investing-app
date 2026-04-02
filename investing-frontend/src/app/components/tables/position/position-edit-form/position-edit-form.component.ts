import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { PositionService } from '@app/services/position.service';
import { PositionResponse } from '@app/shared/models/position-response';
import { PositionSummaryResponse } from '@app/shared/models/position-summary-response';

type FormMode = 'view' | 'edit' | 'close';

type PositionFormModel = {
  id: number;
  symbol: string;
  date: string;
  quantity: string;
  price: string;
  commission: string;
  mode: FormMode;
  original: {
    date: string;
    quantity: string;
    price: string;
    commission: string;
  };
};

@Component({
  selector: 'app-position-edit-form',
  templateUrl: './position-edit-form.component.html',
  styleUrls: ['./position-edit-form.component.css'],
})
export class PositionEditFormComponent implements OnChanges {
  @Input() positions: PositionResponse[] = [];
  @Input() positionsSummary: PositionSummaryResponse[] = [];
  @Output() positionsChanged = new EventEmitter<void>();
  @Output() deletePosition = new EventEmitter<number>();

  positionForms: PositionFormModel[] = [];

  constructor(private positionSvc: PositionService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['positions']) {
      this.setForms();
    }
  }

  setForms(): void {
    this.positionForms = this.positions.map((p) => {
      const date = p.createdAt;
      const quantity = this.toInputNumber(p.quantity);
      const price = this.toInputNumber(p.price);
      const commission = this.toInputNumber(p.fee);

      return {
        id: p.id,
        symbol: p.symbol,
        date,
        quantity,
        price,
        commission,
        mode: 'view',
        original: {
          date,
          quantity,
          price,
          commission,
        },
      };
    });
  }

  isViewMode(form: PositionFormModel): boolean {
    return form.mode === 'view';
  }

  isEditMode(form: PositionFormModel): boolean {
    return form.mode === 'edit';
  }

  isCloseMode(form: PositionFormModel): boolean {
    return form.mode === 'close';
  }

  enableEditMode(form: PositionFormModel): void {
    form.mode = 'edit';
  }

  enableCloseMode(form: PositionFormModel): void {
    form.mode = 'close';
  }

  cancel(form: PositionFormModel): void {
    form.date = form.original.date;
    form.quantity = form.original.quantity;
    form.price = form.original.price;
    form.commission = form.original.commission;
    form.mode = 'view';
  }

  saveChanges(form: PositionFormModel): void {
    if (!this.canSubmitPosition(form)) return;

    const payload = {
      id: form.id,
      createdAt: form.date,
      quantity: this.toNumber(form.quantity),
      price: this.toNumber(form.price),
      fee: this.toNumber(form.commission),
    };

    console.log('Guardar cambios', payload);

    form.original = {
      date: form.date,
      quantity: form.quantity,
      price: form.price,
      commission: form.commission,
    };

    form.mode = 'view';

    // cuando tengas endpoint update:
    // this.positionSvc.update(payload).subscribe({
    //   next: () => {
    //     form.original = {
    //       date: form.date,
    //       quantity: form.quantity,
    //       price: form.price,
    //       commission: form.commission,
    //     };
    //     form.mode = 'view';
    //   },
    //   error: () => console.log('Error al guardar cambios'),
    // });
  }

  closePosition(form: PositionFormModel): void {
    if (!this.canSubmitPosition(form)) return;
    this.deletePosition.emit(form.id);
  }

  canSubmitPosition(form: PositionFormModel): boolean {
    return !!form.date && !!form.quantity && !!form.price;
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

    if (event.ctrlKey || event.metaKey) return;
    if (allowedControlKeys.includes(event.key)) return;
    if (/^\d$/.test(event.key)) return;
    if (event.key === ',') return;

    event.preventDefault();
  }

  private toInputNumber(value: number | string | null | undefined): string {
    if (value === null || value === undefined) return '';
    return String(value).replace('.', ',');
  }

  private toNumber(value: string): number {
    return Number(value.replace(',', '.'));
  }
}

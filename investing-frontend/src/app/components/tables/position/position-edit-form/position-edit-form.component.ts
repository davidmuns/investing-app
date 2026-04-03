import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { UtilsService } from '@app/services/utils.service';
import { PositionResponse } from '@app/shared/models/position-response';
import { PositionSummaryResponse } from '@app/shared/models/position-summary-response';
import { UpdatePositionRequest } from '@app/shared/models/update-position-request';

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
  @Output() deletePosition = new EventEmitter<number>();
  @Output() updatePosition = new EventEmitter<UpdatePositionRequest>();

  positionForms: PositionFormModel[] = [];

  constructor(private utilsSvc: UtilsService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['positions']) {
      this.setForms();
    }
  }

  setForms(): void {
    this.positionForms = this.positions.map((p) => {
      const date = p.createdAt;
      const quantity = this.utilsSvc.toInputNumber(p.quantity);
      const price = this.utilsSvc.toInputNumber(p.price);
      const commission = this.utilsSvc.toInputNumber(p.fee);

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
    const payload: UpdatePositionRequest = {
      id: form.id,
      createdAt: form.date,
      quantity: this.toNumber(form.quantity),
      price: this.toNumber(form.price),
      fee: this.toNumber(form.commission),
    };
    this.updatePosition.emit(payload);
  }

  closePosition(form: PositionFormModel): void {
    if (!this.canSubmitPosition(form)) return;
    this.deletePosition.emit(form.id);
  }

  canSubmitPosition(form: PositionFormModel): boolean {
    return !!form.date && !!form.quantity && !!form.price;
  }

  blockInvalidNumberKey(event: KeyboardEvent): void {
    this.utilsSvc.blockInvalidNumberKey(event);
  }

  private toNumber(value: string): number {
    return Number(value.replace(',', '.'));
  }
}

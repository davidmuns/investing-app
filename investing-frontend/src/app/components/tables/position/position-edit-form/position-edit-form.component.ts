import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { UtilsService } from '@app/services/utils.service';
import { PositionResponse } from '@app/shared/models/position-response';
import { UpdatePositionRequest } from '@app/shared/models/update-position-request';
import { EditPositionFormModel, PositionFormModel } from '@app/shared/types/position-form-model';

@Component({
  selector: 'app-position-edit-form',
  templateUrl: './position-edit-form.component.html',
  styleUrls: ['./position-edit-form.component.css'],
})
export class PositionEditFormComponent implements OnChanges {
  @Input() positions: PositionResponse[] = [];
  @Output() closePosition = new EventEmitter<UpdatePositionRequest>();
  @Output() updatePosition = new EventEmitter<UpdatePositionRequest>();
  today = '';
  originalQuantity = 0;

  positionForms: EditPositionFormModel[] = [];

  constructor(private utilsSvc: UtilsService) {}

  ngOnInit(): void {
    this.today = this.utilsSvc.getTodayDate();
  }

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

  isViewMode(form: EditPositionFormModel): boolean {
    return form.mode === 'view';
  }

  isEditMode(form: EditPositionFormModel): boolean {
    return form.mode === 'edit';
  }

  isCloseMode(form: EditPositionFormModel): boolean {
    return form.mode === 'close';
  }

  enableEditMode(form: EditPositionFormModel): void {
    form.mode = 'edit';
  }

  enableCloseMode(form: EditPositionFormModel): void {
    form.mode = 'close';
  }

  cancel(form: EditPositionFormModel): void {
    form.date = form.original.date;
    form.quantity = form.original.quantity;
    form.price = form.original.price;
    form.commission = form.original.commission;
    form.mode = 'view';
  }

  onSaveChanges(form: EditPositionFormModel): void {
    if (!this.canSubmitPosition(form)) return;
    const payload: UpdatePositionRequest = this.toUpdatePositionRequest(form);
    this.updatePosition.emit(payload);
  }

  onClosePosition(form: EditPositionFormModel): void {
    if (!this.canSubmitPosition(form)) return;
    const payload: UpdatePositionRequest = this.toUpdatePositionRequest(form);
    this.closePosition.emit(payload);
  }

  canSubmitPosition(form: EditPositionFormModel): boolean {
    this.originalQuantity = this.utilsSvc.toNumber(form.original.quantity);
    return (
      this.utilsSvc.isValidDate(form.date) &&
      this.utilsSvc.isValidPositiveNumber(form.quantity) &&
      this.utilsSvc.isValidPositiveNumber(form.price) &&
      !this.utilsSvc.isValidSellQuantity(form, this.originalQuantity)
    );
  }

  blockInvalidNumberKey(event: KeyboardEvent): void {
    this.utilsSvc.blockInvalidNumberKey(event);
  }

  private toUpdatePositionRequest(form: PositionFormModel): UpdatePositionRequest {
    const payload: UpdatePositionRequest = {
      id: form.id,
      createdAt: form.date,
      quantity: this.utilsSvc.toNumber(form.quantity),
      price: this.utilsSvc.toNumber(form.price),
      fee: this.utilsSvc.toNumber(form.commission),
    };
    return payload;
  }

  getQuantityMsgError(form: EditPositionFormModel): string {
    return this.utilsSvc.getQuantityErrorMsgOnClose(form, this.originalQuantity);
  }

  getPriceMsgError(form: EditPositionFormModel): string {
    return this.utilsSvc.getPriceErrorMsg(form.price);
  }
}

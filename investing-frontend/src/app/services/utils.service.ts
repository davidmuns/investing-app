import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EditPositionFormModel } from '@app/shared/types/position-form-model';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  constructor(private readonly snack: MatSnackBar) {}
  public showSnackBar(msg: string, duration: number) {
    // const action = this.translateSvc.instant('article.close');
    const action = 'close';
    this.snack.open(msg, action, {
      duration: duration,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
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

  toInputNumber(value: number | string | null | undefined): string {
    if (value === null || value === undefined) return '';
    return String(value).replace('.', ',');
  }

  getTodayDate(): string {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  parseLocalizedNumber(value: string): number {
    const normalized = (value || '').replace(/\./g, '').replace(',', '.').trim();
    return normalized ? Number(normalized) : 0;
  }

  isValidDate(value: string): boolean {
    return !!value?.trim();
  }

  isValidPositiveNumber(value: string): boolean {
    if (!value?.trim()) return false;
    return this.toNumber(value) > 0;
  }

  isValidSellQuantity(form: EditPositionFormModel, quantity: number): boolean {
    if (!form.quantity?.trim()) return false;
    return this.toNumber(form.quantity) > quantity && form.mode === 'close';
  }

  toNumber(value: string): number {
    return Number(value.replace(',', '.'));
  }

  getPriceErrorMsg(price: string): string {
    if (!price.trim() || this.toNumber(price) <= 0) {
      return 'El precio introducido es incorrecto. Por favor, revise sus cifras';
    }
    return '';
  }

  getQuantityErrorMsg(quantity: string): string {
    const errorMsg = this.getBaseQuantityErrorMsg(quantity);
    if (errorMsg) return errorMsg;
    return '';
  }

  getQuantityErrorMsgOnClose(form: EditPositionFormModel, quantity: number): string {
    const errorMsg = this.getBaseQuantityErrorMsg(form.quantity);
    if (errorMsg) return errorMsg;

    if (this.toNumber(form.quantity) > quantity && form.mode === 'close') {
      return 'No es posible cerrar más cantidad de la que actualmente tiene';
    }

    return '';
  }

  private getBaseQuantityErrorMsg(quantity: string): string {
    if (!quantity.trim()) {
      return 'La cantidad es obligatoria';
    }

    if (this.toNumber(quantity) <= 0) {
      return 'La cantidad solo puede ser un número positivo';
    }

    return '';
  }

  getValueStyle(
    columnDef: string,
    element: Record<string, unknown>,
    coloredColumns: string[],
  ): { [key: string]: string } {
    if (!coloredColumns.includes(columnDef)) {
      return {};
    }

    const value = element[columnDef] as number | null | undefined;

    if (value == null) {
      return { 'font-weight': 'bold', color: 'black' };
    }

    if (value > 0) {
      return { 'font-weight': 'bold', color: 'green' };
    }

    if (value < 0) {
      return { 'font-weight': 'bold', color: 'red' };
    }

    return { 'font-weight': 'bold', color: 'black' };
  }
}

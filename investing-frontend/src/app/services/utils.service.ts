import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

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
}

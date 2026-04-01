import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { PositionService } from '@app/services/position.service';
import { PositionResponse } from '@app/shared/models/position-response';

@Component({
  selector: 'app-position-edit-form',
  templateUrl: './position-edit-form.component.html',
  styleUrls: ['./position-edit-form.component.css'],
})
export class PositionEditFormComponent implements OnInit {
  @Input() positions: PositionResponse[] = [];
  editPosition = false;
  positionForms: {
    id: number;
    symbol: string;
    date: string;
    quantity: string;
    price: string;
    commission: string;
  }[] = [];

  constructor(private positionSvc: PositionService) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['positionsSummary'] || changes['positions']) {
      this.setForms();
    }
  }

  setForms(): void {
    this.positionForms = this.positions.map((p) => ({
      id: p.id,
      symbol: p.symbol,
      date: p.createdAt,
      quantity: this.toInputNumber(p.quantity),
      price: this.toInputNumber(p.price),
      commission: this.toInputNumber(p.fee),
    }));
  }

  submitPosition(form: any) {
    this.editPosition = !this.editPosition;
    console.log(form);
  }

  canSubmitPosition(form: any): boolean {
    return !!form.date && !!form.quantity && !!form.price;
  }

  onDeleteClicked(position: PositionResponse) {
    this.positionSvc.deleteById(position.id).subscribe({
      next: () => {
        console.log('Se ha eliminado la posicion ', position.name);
        this.positions = this.positions.filter((p) => p.id == position.id);
      },
      error: () => {
        console.log('Error al eliminar posición');
      },
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

  private toInputNumber(value: number | string | null | undefined): string {
    if (value === null || value === undefined) return '';
    return String(value).replace('.', ',');
  }
}

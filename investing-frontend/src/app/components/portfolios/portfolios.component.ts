import { Component, ElementRef, OnInit, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { HostListener } from '@angular/core';
import { PortfolioService } from '../../services/portfolio.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { PortfolioResponse } from '@app/shared/models/portfolios-response';
import { MatDialog } from '@angular/material/dialog';
import { ModalPortfolioComponent } from './modal-portfolio/modal-portfolio.component';
import { InstrumentService } from '@app/services/instrument.service';
import { InstrumentResponse } from '@app/shared/models/instrument-response';
import { UtilsService } from '@app/services/utils.service';
import { Instrument } from '@app/shared/models/instrument';
import { PortfolioRequest } from '@app/shared/models/portfolios-request';
import { InstrumentRequest } from '@app/shared/models/instrument-request';
import { PositionRequest } from '@app/shared/models/position-request';
import { PositionService } from '@app/services/position.service';
import { PositionResponse } from '@app/shared/models/position-response';
type ApiError = { error?: string; message?: string };

@Component({
  selector: 'app-portfolios',
  templateUrl: './portfolios.component.html',
  styleUrls: ['./portfolios.component.css'],
})
export class PortfoliosComponent implements OnInit {
  portfolios: PortfolioResponse[] = [];
  portfolioId: number = 0;
  selectedIndex = 0;
  loading = false;
  errorMsg = '';
  editingIndex: number | null = null;
  editName = '';
  symbolQuery = '';
  symbolError = '';
  actionsOpen = false;
  trackByPortfolio = (_: number, p: any) => p.id ?? p.name;
  formLoading = false;
  formError = '';
  @ViewChild('nameInput') nameInput?: ElementRef<HTMLInputElement>;
  @ViewChildren('editInput') editInputs!: QueryList<ElementRef<HTMLInputElement>>;
  instruments: InstrumentResponse[] = [];
  portfolioType: string = '';
  instrumentSymbol: string = '';
  instrumentName: string = '';
  positionFormVisible = false;
  positionFormEnabled = false;
  selectedInstrument: InstrumentResponse | null = null;
  positions: PositionResponse[] = [];
  marketValue = 0;
  totalNetAmount = 0;
  totalProfitLossValue = 0;
  totalProfitLossPercentage = 0;
  dailyProfitLossValue = 0;
  dailyProfitLossPercentage = 0;

  positionForm = {
    operation: 'Compra',
    date: '',
    quantity: '',
    price: '',
    commission: '',
  };

  constructor(
    private portfolioService: PortfolioService,
    public dialog: MatDialog,
    private instrumentSvc: InstrumentService,
    private utilsSvc: UtilsService,
    private positionSvc: PositionService,
  ) {}

  ngOnInit(): void {
    this.reload();
    this.reloadInstruments();
  }

  toggleActions(): void {
    this.actionsOpen = !this.actionsOpen;
  }

  closeActions(): void {
    this.actionsOpen = false;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeActions();
    if (this.actionsOpen) this.closeActions();
  }

  onAddPortfolioClicked(): void {
    const dialogRef = this.dialog.open(ModalPortfolioComponent, {
      width: '380px',
    });

    dialogRef.afterClosed().subscribe((newPortfolio) => {
      if (!newPortfolio) return;
      this.createPortfolio(newPortfolio);
    });
  }

  createPortfolio(newPortfolio: PortfolioRequest) {
    this.portfolioService.create(newPortfolio).subscribe({
      next: (p) => {
        this.reload(p.id);
        this.reloadInstruments();
        this.portfolioId = p.id;
        this.portfolioType = p.type;
      },
      error: (err) => {
        if (err?.status === 409) {
          const apiErr: ApiError = err?.error ?? {};
          this.formError = apiErr.message || 'Cartera duplicada.';
          this.utilsSvc.showSnackBar(this.formError, 2500);
          return;
        }
        this.formError = 'No se pudo crear la cartera.';
      },
    });
  }

  onInstrumentEmitted(instrument: InstrumentRequest): void {
    this.instrumentSvc.create(instrument, this.portfolioId).subscribe({
      next: (data) => {
        this.reloadInstruments();
      },
      error: (err) => {
        console.log(err.error.message);
      },
    });
  }

  reloadInstruments(): void {
    this.instrumentSvc.list().subscribe({
      next: (data) => {
        this.instruments = data.data.filter((i) => i.portfolioId == this.portfolioId);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  onDeleteInstrument(instrument: Instrument): void {
    this.instrumentSvc.deleteById(instrument.id).subscribe({
      next: () => {
        this.utilsSvc.showSnackBar(`Instrument ${instrument.name} deleted`, 3000);
        this.instruments = this.instruments.filter((i) => i.id !== instrument.id);
      },
      error: (err) => {
        console.error('Error deleting instrument', err);
        this.utilsSvc.showSnackBar(`Could not delete instrument ${name}`, 3000);
      },
    });
  }

  reload(createdId?: number): void {
    this.loading = true;
    this.errorMsg = '';

    this.portfolioService.list().subscribe({
      next: (data) => {
        this.portfolios = data.data;
        if (createdId != null) {
          const idx = this.portfolios.findIndex((p) => p.id === createdId);
          this.selectedIndex = idx >= 0 ? idx : 0;
        }
        this.setPortfolioId();
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'No se pudo cargar la lista de carteras.';
        this.loading = false;
      },
    });
  }

  onDeletePortfolio(): void {
    const selected = this.portfolios[this.selectedIndex];
    if (!selected) return;

    const ok = confirm(`¿Eliminar la cartera "${selected.name}"?`);
    if (!ok) return;

    const deletingId = selected.id;

    this.portfolioService.delete(deletingId).subscribe({
      next: () => {
        const deletedIndex = this.portfolios.findIndex((p) => p.id === deletingId);
        this.portfolios = this.portfolios.filter((p) => p.id !== deletingId);

        if (this.portfolios.length === 0) {
          const defaultPortfolio = { name: 'Mi cartera', type: 'WATCHLIST' } as PortfolioRequest;
          this.createPortfolio(defaultPortfolio);
          this.selectedIndex = 0;
          return;
        }

        // Mantener “posición” si existe; si borraste la última, selecciona la nueva última
        this.selectedIndex = Math.min(this.selectedIndex, this.portfolios.length - 1);

        // Si borraste una tab anterior a la seleccionada, desplaza el índice
        if (deletedIndex >= 0 && deletedIndex < this.selectedIndex) {
          this.selectedIndex = this.selectedIndex - 1;
        }
      },
      error: () => {
        this.errorMsg = 'No se pudo eliminar la cartera.';
      },
    });
  }

  closeEditIfOpen() {
    if (this.editingIndex !== null) {
      this.saveEdit(this.editingIndex);
    }
  }

  selectTab(i: number) {
    // si estás editando otra pestaña, guarda (o cancela) antes
    this.positionFormVisible = false;
    this.selectedInstrument = null;
    if (this.editingIndex !== null && this.editingIndex !== i) {
      this.saveEdit(this.editingIndex);
    }
    this.selectedIndex = i;
    this.portfolioType = this.portfolios[this.selectedIndex].type;
    this.setPortfolioId();
    this.reloadInstruments();
    // this.calculateTotals();
  }

  private setPortfolioId(): void {
    const selected = this.portfolios?.[this.selectedIndex];
    this.portfolioId = selected?.id ?? 0;
    this.listPositionsByPortfolioId(this.portfolioId);
  }

  startEdit(i: number) {
    this.editingIndex = i;
    this.editName = this.portfolios[i].name;

    setTimeout(() => {
      // Como solo habrá 1 input visible, cogemos el primero
      const el = this.editInputs.first?.nativeElement;
      el?.focus();
      el?.select();
    });
  }

  cancelEdit() {
    this.editingIndex = null;
    this.editName = '';
  }

  saveEdit(index: number) {
    const portfolio = this.portfolios[index];
    const newName = this.editName.trim();

    if (!newName || newName === portfolio.name) {
      this.cancelEdit();
      return;
    }

    this.portfolioService.rename(portfolio.id, newName).subscribe({
      next: (updated) => {
        this.portfolios[index] = updated;
        this.cancelEdit();
      },
      error: () => {
        alert('No se pudo renombrar la cartera.');
        this.cancelEdit();
      },
    });
  }

  submitSymbol(): void {
    const q = this.symbolQuery.trim();
    if (!q) {
      this.symbolError = 'Introduce un símbolo o búsqueda.';
      return;
    }
    this.symbolError = '';
    console.log('ADD SYMBOL =>', {
      portfolioId: this.portfolios[this.selectedIndex]?.id,
      query: q,
    });

    // Por ahora solo limpiamos el input
    this.symbolQuery = '';
  }

  dropTab(event: CdkDragDrop<any>) {
    if (event.previousIndex === event.currentIndex) return;

    moveItemInArray(this.portfolios, event.previousIndex, event.currentIndex);

    // Ajuste del selectedIndex para que no “salte” a otra pestaña
    if (this.selectedIndex === event.previousIndex) {
      this.selectedIndex = event.currentIndex;
    } else if (this.selectedIndex > event.previousIndex && this.selectedIndex <= event.currentIndex) {
      this.selectedIndex--;
    } else if (this.selectedIndex < event.previousIndex && this.selectedIndex >= event.currentIndex) {
      this.selectedIndex++;
    }

    // (Opcional) Persistir orden:
    // this.saveOrder(this.portfolios.map(p => p.id));
  }

  onCloseFormClicked() {
    this.positionFormVisible = false;
    this.selectedInstrument = null;
  }

  onInstrumentSearchFocus(): void {
    if (!this.portfolioType.endsWith('S')) return;
    // Si ya hay un instrumento seleccionado, no vuelvas a deshabilitar el formulario
    if (this.selectedInstrument) return;
    this.positionFormVisible = true;
    this.positionFormEnabled = false;
    this.selectedInstrument = null;
    this.positionForm.operation = 'Compra';
    this.positionForm.date = '';
    this.positionForm.quantity = '';
    this.positionForm.price = '';
    this.positionForm.commission = '';
  }

  onInstrumentSelected(instrument: InstrumentResponse): void {
    this.selectedInstrument = instrument;
    this.positionFormVisible = true;
    this.positionFormEnabled = true;
    this.positionForm.date = this.getTodayForInput();
    this.instrumentSvc.searchQuote(instrument.symbol).subscribe({
      next: (data) => {
        this.positionForm.price = this.toInputNumber(data.close);
        this.instrumentSymbol = data.symbol;
        this.instrumentName = data.name;
      },
      error: () => {
        alert('No se pudo recibir la cotización.');
      },
    });
  }

  private getTodayForInput(): string {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private toInputNumber(value: number | string | null | undefined): string {
    if (value === null || value === undefined) return '';
    return String(value).replace('.', ',');
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
      quantity: this.parseLocalizedNumber(this.positionForm.quantity),
      price: this.parseLocalizedNumber(this.positionForm.price),
      fee: this.parseLocalizedNumber(this.positionForm.commission || '0'),
      symbol: this.instrumentSymbol,
    };

    this.positionSvc.create(payload).subscribe({
      next: () => {
        console.log('Posición creada');
        this.listPositionsByPortfolioId(this.portfolioId);
      },
      error: (err) => {
        console.error('Error al crear la posición', err);
      },
    });

    console.log('SUBMIT POSITION =>', payload);
    this.positionFormEnabled = false;
    this.positionFormVisible = false;
  }

  listPositionsByPortfolioId(id: number) {
    this.positionSvc.listByPortfolioId(id).subscribe({
      next: (resp) => {
        console.log(resp.data);
        this.positions = resp.data;
        this.calculateTotalProfitLoss();
        this.calculateDailyProfitLoss();
      },
      error: (err) => {
        console.error('Error al crear la posición', err);
      },
    });
  }

  private calculateTotalProfitLoss() {
    const totals = this.positions.reduce(
      (acc, position) => {
        acc.closePrice += position.close * position.quantity;
        acc.netAmount += position.netAmount;
        return acc;
      },
      { closePrice: 0, netAmount: 0 },
    );
    this.marketValue = totals.closePrice;
    this.totalNetAmount = totals.netAmount;
    this.totalProfitLossValue = this.marketValue - this.totalNetAmount;
    this.totalProfitLossPercentage = (this.marketValue / this.totalNetAmount - 1) * 100;
  }

  private calculateDailyProfitLoss() {
    const totals = this.positions.reduce(
      (acc, position) => {
        const previousValue = position.previousClose * position.quantity;
        const dailyValue = (position.close - position.previousClose) * position.quantity;

        acc.previousPortfolioValue += previousValue;
        acc.dailyProfitLossValue += dailyValue;

        return acc;
      },
      {
        previousPortfolioValue: 0,
        dailyProfitLossValue: 0,
      },
    );

    this.dailyProfitLossValue = totals.dailyProfitLossValue;
    this.dailyProfitLossPercentage =
      totals.previousPortfolioValue !== 0 ? (totals.dailyProfitLossValue / totals.previousPortfolioValue) * 100 : 0;
  }

  private parseLocalizedNumber(value: string): number {
    const normalized = (value || '').replace(/\./g, '').replace(',', '.').trim();
    return normalized ? Number(normalized) : 0;
  }
}

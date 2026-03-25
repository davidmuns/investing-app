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

  positionFormVisible = false;
  positionFormEnabled = false;
  selectedInstrument: InstrumentResponse | null = null;

  positionForm = {
    operation: 'B',
    date: '',
    quantity: '',
    price: '',
    commission: '',
  };

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

  constructor(
    private portfolioService: PortfolioService,
    public dialog: MatDialog,
    private instrumentSvc: InstrumentService,
    private utilsSvc: UtilsService,
  ) {}

  ngOnInit(): void {
    this.reload();
    this.reloadInstruments();
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
  }

  private setPortfolioId(): void {
    const selected = this.portfolios?.[this.selectedIndex];
    this.portfolioId = selected?.id ?? 0;
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
    this.positionForm.operation = 'B';
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

    const payload = {
      portfolioId: this.portfolioId,
      instrumentId: this.selectedInstrument.id,
      operation: this.positionForm.operation,
      date: this.positionForm.date,
      quantity: this.parseLocalizedNumber(this.positionForm.quantity),
      price: this.parseLocalizedNumber(this.positionForm.price),
      commission: this.parseLocalizedNumber(this.positionForm.commission || '0'),
    };

    console.log('SUBMIT POSITION =>', payload);
    this.positionFormEnabled = false;
    this.positionFormVisible = false;

    // Sustituir por tu servicio real
    // this.positionService.create(payload).subscribe(...)
  }

  private parseLocalizedNumber(value: string): number {
    const normalized = (value || '').replace(/\./g, '').replace(',', '.').trim();
    return normalized ? Number(normalized) : 0;
  }
}

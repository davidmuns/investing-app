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
import { PositionSummaryResponse } from '@app/shared/models/position-summary-response';
import { environment } from '@env/environment';
import { UpdatePositionRequest } from '@app/shared/models/update-position-request';
import { PositionCloseResponse } from '@app/shared/models/position-close-response';
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
  portfolioInstruments: InstrumentResponse[] = [];
  portfolioType: string = '';
  instrumentSymbol: string = '';
  instrumentName: string = '';
  instrumentExchange: string = '';
  closePrice = 0;
  positionFormVisible = false;
  positionFormEnabled = false;
  selectedInstrument: InstrumentResponse | null = null;
  positions: PositionResponse[] = [];
  positionsClosed: PositionCloseResponse[] = [];
  positionsSummary: PositionSummaryResponse[] = [];
  WATCHLIST = environment.WATCHLIST_PORTFOLIO;
  POSITIONS = environment.POSITION_PORTFOLIO;

  constructor(
    private portfolioService: PortfolioService,
    public dialog: MatDialog,
    private instrumentSvc: InstrumentService,
    private utilsSvc: UtilsService,
    private positionSvc: PositionService,
  ) {}

  ngOnInit(): void {
    this.loadPortfolios();
    this.loadInstruments();
    this.listPositionClose();
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

  get isWatchlist(): boolean {
    return this.portfolioType === this.WATCHLIST;
  }

  get isEmptyPortfolio(): boolean {
    return this.isWatchlist ? this.instruments.length === 0 : this.positions.length === 0;
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
        this.portfolios = [...this.portfolios, p];
        this.setPortfolioTab(p.id);
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
        this.positionsClosed = this.positionsClosed.filter((p) => p.portfolioId != deletingId);
        this.positions = this.positions.filter((p) => p.portfolioId != deletingId);
        this.positionsSummary = this.positionsSummary.filter((p) => p.portfolioId != deletingId);
        if (this.portfolios.length === 0) {
          const defaultPortfolio = { name: 'Mi cartera', type: 'POSITIONS' } as PortfolioRequest;
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

  setPortfolioTab(createdId: number) {
    if (createdId != null) {
      const idx = this.portfolios.findIndex((p) => p.id === createdId);
      this.selectedIndex = idx >= 0 ? idx : 0;
    }
  }

  onInstrumentEmitted(instrument: InstrumentRequest): void {
    this.instrumentSvc.create(instrument, this.portfolioId).subscribe({
      next: (resp) => {
        this.instruments = [...this.instruments, resp];
        this.filterPortfolioInstruments();
      },
      error: (err) => {
        console.log(err.error.message);
      },
    });
  }

  uploadInstrumentsByPortfolioId(id: number) {
    this.instrumentSvc.listByPortfolioId(id).subscribe({
      next: (resp) => {
        this.instruments = resp.data;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  loadInstruments(): void {
    this.instrumentSvc.list().subscribe({
      next: (data) => {
        this.instruments = data.data;
        this.filterPortfolioInstruments();
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
        this.filterPortfolioInstruments();
      },
      error: (err) => {
        console.error('Error deleting instrument', err);
        this.utilsSvc.showSnackBar(`Could not delete instrument ${instrument.name}`, 3000);
      },
    });
  }

  loadPortfolios(): void {
    this.portfolioService.list().subscribe({
      next: (resp) => {
        this.portfolios = resp.data;
      },
      error: () => {
        this.errorMsg = 'No se pudo cargar la lista de carteras.';
        this.loading = false;
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
    this.portfolioId = this.portfolios[this.selectedIndex].id;

    if (this.portfolioType === this.WATCHLIST) {
      this.filterPortfolioInstruments();
      return;
    }
    this.reloadPositions();
  }

  filterPortfolioInstruments() {
    this.portfolioInstruments = this.instruments.filter((i) => i.portfolioId == this.portfolioId);
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
    if (this.portfolioType === this.WATCHLIST) return;
    // Si ya hay un instrumento seleccionado, no volver a deshabilitar el formulario
    if (this.selectedInstrument) return;
    this.positionFormVisible = true;
    this.positionFormEnabled = false;
    this.selectedInstrument = null;
  }

  onInstrumentSelectedFromPositionPortfolio(instrument: InstrumentResponse): void {
    this.selectedInstrument = instrument;
    this.positionFormVisible = true;
    this.positionFormEnabled = true;
    this.instrumentSvc.searchQuote(instrument.symbol).subscribe({
      next: (data) => {
        this.closePrice = data.close;
        this.instrumentSymbol = data.symbol;
        this.instrumentName = data.name;
        this.instrumentExchange = data.exchange;
      },
      error: () => {
        alert('No se pudo recibir la cotización.');
      },
    });
  }

  onCreatePosition(position: PositionRequest) {
    this.positionSvc.create(position).subscribe({
      next: () => {
        this.reloadPositions();
      },
      error: (err) => {
        console.error('Error al crear la posición', err);
      },
    });
    this.positionFormEnabled = false;
    this.positionFormVisible = false;
  }

  onClosePosition(position: UpdatePositionRequest) {
    this.positionSvc.close(position).subscribe({
      next: (resp) => {
        this.positionsClosed = [...this.positionsClosed, resp];
        console.log(this.positionsClosed);
        this.reloadPositions();
      },
      error: (err) => {
        console.error('Error deleting position', err);
      },
    });
  }

  listPositionClose() {
    this.positionSvc.listPositionClose().subscribe({
      next: (resp) => {
        this.positionsClosed = resp.data;
      },
      error: (err) => {
        console.error('Error al crear la posición', err);
      },
    });
  }

  onUpdatePosition(event: UpdatePositionRequest) {
    this.positionSvc.update(event).subscribe({
      next: () => {
        this.reloadPositions();
      },
      error: (err) => {
        console.error('Error updating position', err);
      },
    });
  }

  private reloadPositions() {
    this.listPositionsByPortfolioId(this.portfolioId);
    this.listPositionSummaryByPortfolioId(this.portfolioId);
  }

  listPositionsByPortfolioId(id: number) {
    this.positionSvc.listByPortfolioId(id).subscribe({
      next: (resp) => {
        this.positions = resp.data;
      },
      error: (err) => {
        console.error('Error al crear la posición', err);
      },
    });
  }

  listPositionSummaryByPortfolioId(id: number) {
    this.positionSvc.listSummaryByPortfolioId(id).subscribe({
      next: (resp) => {
        this.positionsSummary = resp.data;
      },
      error: (err) => {
        console.error('Error al crear summary', err);
      },
    });
  }
}

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
import { PositionOpenResponse } from '@app/shared/models/position-open-response';
import { SearchInstrumentComponent } from './search-instrument/search-instrument.component';
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
  @ViewChild('searchInstrument') searchInstrumentComponent!: SearchInstrumentComponent;
  instruments: InstrumentResponse[] = [];
  portfolioInstruments: InstrumentResponse[] = [];
  portfolioType: string = '';
  instrumentSymbol: string = '';
  instrumentName: string = '';
  instrumentExchange: string = '';
  closePrice = 1;
  positionFormVisible = false;
  positionFormEnabled = false;
  selectedInstrument: InstrumentRequest | null = null;
  positions: PositionResponse[] = [];
  positionsClosed: PositionCloseResponse[] = [];
  positionsSummary: PositionSummaryResponse[] = [];
  WATCHLIST = environment.WATCHLIST_PORTFOLIO;
  POSITIONS = environment.POSITION_PORTFOLIO;
  symbol = '';
  selectedPositionTab = 'Posiciones';
  subTabIndex = 0;
  transactionTab: 'open' | 'closed' = 'open';
  positionsOpened: PositionOpenResponse[] = [];
  closedPositionsSum = 0;

  constructor(
    private portfolioService: PortfolioService,
    public dialog: MatDialog,
    private instrumentSvc: InstrumentService,
    private utilsSvc: UtilsService,
    private positionSvc: PositionService,
  ) {}

  ngOnInit(): void {
    this.loadPortfolios();
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

  loadPortfolios(): void {
    this.portfolioService.list().subscribe({
      next: (resp) => {
        this.portfolios = resp.data;
        if (this.portfolios.length > 0) {
          this.portfolioId = this.portfolios[this.selectedIndex].id;
          this.portfolioType = this.portfolios[this.selectedIndex].type;
          if (this.portfolioType !== this.WATCHLIST) {
            this.loadAllPositionsByPortfolioId(this.portfolioId);
          } else {
            this.loadInstrumentsByPortfolioId(this.portfolioId);
          }
          this.reorderPortfolios(this.portfolios);
        }
      },
      error: () => {
        this.errorMsg = 'No se pudo cargar la lista de carteras.';
        this.loading = false;
      },
    });
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
        this.selectedIndex = this.portfolios.findIndex((x) => x.id === p.id);
        this.setActivePortfolio(p);
        this.reorderPortfolios(this.portfolios);
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
    // const previous: PortfolioResponse | undefined = this.portfolios[this.selectedIndex - 1];
    if (!selected) return;

    const ok = confirm(`¿Eliminar la cartera "${selected.name}"?`);
    if (!ok) return;

    const deletingId = selected.id;

    this.portfolioService.delete(deletingId).subscribe({
      next: () => {
        const deletedIndex = this.portfolios.findIndex((p) => p.id === deletingId);
        this.portfolios = this.portfolios.filter((p) => p.id !== deletingId);
        if (this.portfolios.length === 0) {
          this.selectedIndex = 0;
          const defaultPortfolio = { name: 'Mi cartera', type: 'POSITIONS' } as PortfolioRequest;
          this.createPortfolio(defaultPortfolio);
          return;
        }
        // Mantener “posición” si existe; si borraste la última, selecciona la nueva última
        this.selectedIndex = Math.min(this.selectedIndex, this.portfolios.length - 1);

        // Si borraste una tab anterior a la seleccionada, desplaza el índice
        if (deletedIndex >= 0 && deletedIndex < this.selectedIndex) {
          this.selectedIndex = this.selectedIndex - 1;
        }
        this.loadPortfolios();
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

  onInstrumentSelected(instrument: InstrumentRequest) {
    if (this.portfolioType === this.WATCHLIST) {
      this.saveInstrument(instrument);
      return;
    }
    this.searchQuote(instrument);
  }

  saveInstrument(instrument: InstrumentRequest): void {
    this.instrumentSvc.create(instrument, this.portfolioId).subscribe({
      next: (resp) => {
        this.loadInstrumentsByPortfolioId(resp.portfolioId);
      },
      error: (err) => {
        console.log(err.error.message);
      },
    });
  }

  searchQuote(instrument: InstrumentRequest): void {
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

  loadInstrumentsByPortfolioId(id: number) {
    this.instrumentSvc.listByPortfolioId(id).subscribe({
      next: (resp) => {
        this.instruments = resp.data;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  reloadCurrentPortfolio(): void {
    if (this.portfolioType === this.WATCHLIST) {
      this.reloadInstruments();
      return;
    }

    if (this.portfolioType === this.POSITIONS) {
      this.reloadPositions();
    }
  }

  reloadInstruments(): void {
    this.loadInstrumentsByPortfolioId(this.portfolioId);
  }

  reloadPositions(): void {
    this.loadAllPositionsByPortfolioId(this.portfolioId);
  }

  onDeleteInstrument(instrument: Instrument): void {
    this.instrumentSvc.deleteById(instrument.id).subscribe({
      next: () => {
        this.loadInstrumentsByPortfolioId(instrument.portfolioId);
        this.utilsSvc.showSnackBar(`Instrument ${instrument.name} deleted`, 3000);
      },
      error: (err) => {
        console.error('Error deleting instrument', err);
        this.utilsSvc.showSnackBar(`Could not delete instrument ${instrument.name}`, 3000);
      },
    });
  }

  closeEditIfOpen() {
    if (this.editingIndex !== null) {
      this.saveEdit(this.editingIndex);
    }
  }

  showOpenTransactions(): void {
    this.transactionTab = 'open';
  }

  showClosedTransactions(): void {
    this.transactionTab = 'closed';
    this.closedPositionsSum = this.positionsClosed
      .filter((p) => p.portfolioId === this.portfolioId)
      .reduce((acc, p) => acc + p.profitLoss, 0);
  }

  selectPortfolioTab(i: number) {
    this.subTabIndex = 0;
    this.transactionTab = 'open';
    if (this.editingIndex !== null && this.editingIndex !== i) {
      this.saveEdit(this.editingIndex);
    }
    const selected = this.portfolios[i];
    if (!selected) return;
    this.selectedIndex = i;
    this.setActivePortfolio(this.portfolios[i]);
    if (this.portfolioType === this.WATCHLIST) {
      this.loadInstrumentsByPortfolioId(this.portfolioId);
      return;
    }
    this.loadAllPositionsByPortfolioId(this.portfolioId);
  }

  selectPositionTab(index: number): void {
    this.selectedPositionTab = index === 0 ? 'Posiciones' : 'Transacciones';
    if (index === 1) {
      this.transactionTab = 'open';
    }
  }

  private setActivePortfolio(portfolio: PortfolioResponse): void {
    if (!portfolio) return;
    this.portfolioId = portfolio.id;
    this.portfolioType = portfolio.type;
    this.symbol = '';
    this.positionFormVisible = false;
    this.positionFormEnabled = false;
    this.selectedInstrument = null;
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

  dropTab(event: CdkDragDrop<PortfolioResponse[]>): void {
    if (event.previousIndex === event.currentIndex) return;

    moveItemInArray(this.portfolios, event.previousIndex, event.currentIndex);

    if (this.selectedIndex === event.previousIndex) {
      this.selectedIndex = event.currentIndex;
    } else if (this.selectedIndex > event.previousIndex && this.selectedIndex <= event.currentIndex) {
      this.selectedIndex--;
    } else if (this.selectedIndex < event.previousIndex && this.selectedIndex >= event.currentIndex) {
      this.selectedIndex++;
    }

    this.reorderPortfolios(this.portfolios);
  }

  reorderPortfolios(portfolios: PortfolioResponse[]): void {
    const payload: PortfolioRequest[] = portfolios.map((p, index) => ({
      id: p.id,
      name: p.name,
      type: p.type,
      displayOrder: index,
    }));

    this.portfolioService.reorder(payload).subscribe({
      next: (resp) => {
        this.portfolios = [...resp.data];
        this.portfolioId = this.portfolios[this.selectedIndex]?.id;
        this.portfolioType = this.portfolios[this.selectedIndex].type;
      },
      error: () => {
        console.log('No se pudo reordenar la lista');
      },
    });
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
    setTimeout(() => {
      this.searchInstrumentComponent?.focusInput();
    });
  }

  onAddPosition(position: PositionRequest) {
    this.positionSvc.create(position).subscribe({
      next: () => {
        this.loadAllPositionsByPortfolioId(this.portfolioId);
      },
      error: (err) => {
        console.error('Error al crear la posición', err);
      },
    });
    this.positionFormEnabled = false;
    this.positionFormVisible = false;
  }

  onUpdatePosition(event: UpdatePositionRequest) {
    this.positionSvc.update(event).subscribe({
      next: () => {
        this.loadAllPositionsByPortfolioId(this.portfolioId);
      },
      error: (err) => {
        console.error('Error updating position', err);
      },
    });
  }

  onClosePosition(position: UpdatePositionRequest) {
    this.positionSvc.close(position).subscribe({
      next: (resp) => {
        this.loadAllPositionsByPortfolioId(this.portfolioId);
      },
      error: (err) => {
        this.utilsSvc.showSnackBar(err.error.message, 3000);
      },
    });
  }

  onDeletePositionClose(id: number) {
    const position = this.positionsClosed.find((p) => p.id == id);
    const ok = confirm(`¿Está seguro de querer eliminar permanentemente su posición "${position?.name}"?`);
    if (!ok) return;
    this.positionSvc.deletePositionClose(id).subscribe({
      next: () => {
        this.positionsClosed = this.positionsClosed.filter((p) => p.id != id);
      },
      error: (err) => {
        this.utilsSvc.showSnackBar(err.error.message, 3000);
      },
    });
  }

  listPositionCloseByPortfolioId(portfolioId: number) {
    this.positionSvc.listPositionCloseByPortfolioId(portfolioId).subscribe({
      next: (resp) => {
        this.positionsClosed = [...resp.data];
      },
      error: (err) => {
        console.error('Error al cargar posiciones cerradas por portfolio ID ', err);
      },
    });
  }

  listPositionOpenByPortfolioId(portfolioId: number) {
    this.positionSvc.listPositionOpenByPortfolioId(portfolioId).subscribe({
      next: (resp) => {
        this.positionsOpened = [...resp.data];
      },
      error: (err) => {
        console.error('Error al cargar posiciones abiertas por portfolio ID ', err);
      },
    });
  }

  onSymbolSelected(symbol: string) {
    this.symbol = symbol || '';
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

  private loadAllPositionsByPortfolioId(id: number) {
    this.listPositionsByPortfolioId(id);
    this.listPositionSummaryByPortfolioId(id);
    this.listPositionCloseByPortfolioId(id);
    this.listPositionOpenByPortfolioId(id);
  }
}

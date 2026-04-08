import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { PositionCloseResponse } from '@app/shared/models/position-close-response';
import { PositionRow } from '../position/position-table.component';
import { UtilsService } from '@app/services/utils.service';

@Component({
  selector: 'app-position-close-table',
  templateUrl: './position-close-table.component.html',
  styleUrls: ['./position-close-table.component.css'],
})
export class PositionCloseTableComponent implements OnInit {
  columns = [
    { def: 'name', label: 'Nombre' },
    { def: 'symbol', label: 'Símbolo' },
    { def: 'openedAt', label: 'F. apertura' },
    { def: 'type', label: 'Tipo' },
    { def: 'quantity', label: 'Cantidad' },
    { def: 'entryPrice', label: 'Precio entrada' },
    { def: 'closedAt', label: 'Fecha cierre' },
    { def: 'closedPrice', label: 'Precio cierre' },
    { def: 'profitLossPercentage', label: '%Beneficio' },
    { def: 'profitLoss', label: 'B/P neto' },
  ];
  displayedColumns = [...this.columns.map((c) => c.def), 'actions'];
  dataSource = new MatTableDataSource<PositionCloseResponse>([]);
  @ViewChild(MatSort) sort!: MatSort;
  @Input() positionsClosed: PositionCloseResponse[] = [];
  @Input() portfolioId: number = 0;
  @Output() deletePositionClose = new EventEmitter<number>();
  filtereddPositions: PositionCloseResponse[] = [];

  constructor(
    private _liveAnnouncer: LiveAnnouncer,
    private utilsSvc: UtilsService,
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['positionsClosed'] || changes['portfolioId']) {
      this.filterByPorfolioId();
    }
  }

  filterByPorfolioId() {
    this.filtereddPositions = this.positionsClosed.filter((p) => p.portfolioId == this.portfolioId);
    this.setTableData();
  }

  private setTableData(): void {
    this.dataSource.data = this.filtereddPositions;
  }

  announceSortChange(sortState: Sort): void {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  onDeleteClicked(id: number): void {
    this.deletePositionClose.emit(id);
  }

  getValueStyle(columnDef: string, element: PositionRow): { [key: string]: string } {
    return this.utilsSvc.getValueStyle(columnDef, element as unknown as Record<string, unknown>, [
      'profitLoss',
      'profitLossPercentage',
    ]);
  }
}

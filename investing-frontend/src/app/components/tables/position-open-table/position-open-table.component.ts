import { LiveAnnouncer } from '@angular/cdk/a11y';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { UtilsService } from '@app/services/utils.service';
import { PositionOpenResponse } from '@app/shared/models/position-open-response';
import { UpdatePositionRequest } from '@app/shared/models/update-position-request';
import { PositionRow } from '../position-table/position-table.component';
import { PositionResponse } from '@app/shared/models/position-response';

@Component({
  selector: 'app-position-open-table',
  templateUrl: './position-open-table.component.html',
  styleUrls: ['./position-open-table.component.css'],
})
export class PositionOpenTableComponent implements OnInit, AfterViewInit, OnChanges {
  positionSummaryColumns = [
    { def: 'name', label: 'Nombre' },
    { def: 'symbol', label: 'Símbolo' },
    { def: 'createdAt', label: 'Fecha apertura' },
    { def: 'type', label: 'Tipo' },
    { def: 'quantity', label: 'Cantidad' },
    { def: 'price', label: 'Precio entrada' },
    { def: 'close', label: 'Precio actual' },
    { def: 'marketValue', label: 'Val. mercado' },
    { def: 'netProfitLossPercentage', label: '% B/P neto' },
    { def: 'dailyProfitLoss', label: 'B/P diario' },
    { def: 'netProfitLossValue', label: 'B/P neto' },
  ];

  displayedColumns = [...this.positionSummaryColumns.map((c) => c.def)];

  @Input() positions: PositionOpenResponse[] = [];
  positionsResponse: PositionResponse[] = [];
  @Output() closePosition = new EventEmitter<UpdatePositionRequest>();
  @Output() updatePosition = new EventEmitter<UpdatePositionRequest>();
  dataSource = new MatTableDataSource<PositionOpenResponse>([]);
  @ViewChild(MatSort) sort!: MatSort;
  positionSelected: PositionOpenResponse | null = null;
  filteredPositions: PositionResponse[] = [];

  constructor(
    private _liveAnnouncer: LiveAnnouncer,
    private utilsSvc: UtilsService,
  ) {}

  ngOnInit(): void {
    this.setTableData();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['positions']) {
      this.setTableData();
      this.toPositionResponse(this.positions);
    }
  }

  onClosePosition(event: UpdatePositionRequest) {
    this.positionSelected = null;
    this.closePosition.emit(event);
  }

  onUpdatePosition(event: UpdatePositionRequest) {
    this.positionSelected = null;
    this.updatePosition.emit(event);
  }

  onRowClick(row: PositionOpenResponse): void {
    this.positionSelected = this.positionSelected?.symbol === row.symbol ? null : row;
    this.filteredPositions = this.positionsResponse.filter((p) => p.id == row.id);
  }

  private setTableData(): void {
    this.dataSource.data = this.positions;
  }

  private toPositionResponse(positions: PositionOpenResponse[]) {
    this.positionsResponse = this.positions.map((p) => ({
      id: p.id,
      name: p.name,
      type: p.type,
      symbol: p.symbol,
      fee: 0,
      price: p.price,
      createdAt: p.createdAt,
      quantity: p.quantity,
      portfolioId: p.portfolioId,
      close: p.close,
      previousClose: 0,
      netAmount: 0,
      grossAmount: 0,
    }));
  }

  announceSortChange(sortState: Sort): void {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  getCellClass(columnDef: string): string {
    if (columnDef === 'name' || columnDef === 'symbol') {
      return 'link-cell';
    }

    return '';
  }

  getValueStyle(columnDef: string, element: PositionRow): { [key: string]: string } {
    return this.utilsSvc.getValueStyle(columnDef, element as unknown as Record<string, unknown>, [
      'dailyProfitLoss',
      'netProfitLossValue',
      'netProfitLossPercentage',
    ]);
  }
}

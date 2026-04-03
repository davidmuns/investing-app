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
import { PositionResponse } from '@app/shared/models/position-response';
import { PositionSummaryResponse } from '@app/shared/models/position-summary-response';
import { UpdatePositionRequest } from '@app/shared/models/update-position-request';

export interface PositionRow extends PositionResponse {
  marketValue: number;
  dailyProfitLoss: number;
  totalProfitLoss: number;
  totalProfitLossPercentage: number;
}

@Component({
  selector: 'app-position-table',
  templateUrl: './position-table.component.html',
  styleUrls: ['./position-table.component.css'],
})
export class PositionTableComponent implements OnInit, AfterViewInit, OnChanges {
  positionSummaryColumns = [
    { def: 'name', label: 'Nombre' },
    { def: 'symbol', label: 'Símbolo' },
    { def: 'type', label: 'Tipo' },
    { def: 'totalQuantity', label: 'Cantidad' },
    { def: 'averagePrice', label: 'Precio medio' },
    { def: 'currentPrice', label: 'Precio actual' },
    { def: 'marketValue', label: 'Val. mercado' },
    { def: 'dailyProfitLoss', label: 'B/P diario' },
    { def: 'netProfitLossPercentage', label: '% B/P neto' },
    { def: 'netProfitLoss', label: 'B/P neto' },
  ];

  displayedColumns = [...this.positionSummaryColumns.map((c) => c.def)];

  @Input() positions: PositionResponse[] = [];
  filteredPositions: PositionResponse[] = [];
  @Input() positionsSummary: PositionSummaryResponse[] = [];
  @Output() deletePosition = new EventEmitter<number>();
  @Output() updatePosition = new EventEmitter<UpdatePositionRequest>();
  positionSelected: PositionSummaryResponse | null = null;
  dataSource = new MatTableDataSource<PositionSummaryResponse>([]);
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private _liveAnnouncer: LiveAnnouncer) {}

  ngOnInit(): void {
    this.setTableData();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['positionsSummary'] || changes['positions']) {
      this.setTableData();
      this.restoreExpandedRow();
    }
  }

  private restoreExpandedRow(): void {
    if (!this.positionSelected) {
      this.filteredPositions = [];
      return;
    }

    const updatedSelected = this.positionsSummary.find((p) => p.symbol === this.positionSelected?.symbol);

    if (!updatedSelected) {
      this.positionSelected = null;
      this.filteredPositions = [];
      return;
    }

    this.positionSelected = updatedSelected;
    this.filteredPositions = this.positions.filter((p) => p.symbol === updatedSelected.symbol);
  }

  onDeletePosition(event: number) {
    this.deletePosition.emit(event);
  }

  onUpdatePosition(event: UpdatePositionRequest) {
    this.updatePosition.emit(event);
  }

  onRowClick(row: PositionSummaryResponse): void {
    this.positionSelected = this.positionSelected?.symbol === row.symbol ? null : row;
    this.filteredPositions = this.positions.filter((p) => p.symbol == row.symbol);
  }

  private setTableData(): void {
    this.dataSource.data = this.positionsSummary;
  }

  announceSortChange(sortState: Sort): void {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  getValueStyle(columnDef: string, element: PositionRow): { [key: string]: string } {
    const coloredColumns = ['dailyProfitLoss', 'netProfitLoss', 'netProfitLossPercentage'];

    if (!coloredColumns.includes(columnDef)) {
      return {};
    }

    const value = element[columnDef as keyof PositionRow] as number | null | undefined;

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

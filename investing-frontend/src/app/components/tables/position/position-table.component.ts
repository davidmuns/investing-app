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
  positionColumns = [
    { def: 'name', label: 'Nombre' },
    { def: 'symbol', label: 'Símbolo' },
    { def: 'type', label: 'Tipo' },
    { def: 'quantity', label: 'Cantidad' },
    { def: 'price', label: 'Precio medio' },
    { def: 'close', label: 'Precio actual' },
    { def: 'marketValue', label: 'Val. mercado' },
    { def: 'dailyProfitLoss', label: 'B/P diario' },
    { def: 'totalProfitLossPercentage', label: '% B/P neto' },
    { def: 'totalProfitLoss', label: 'B/P neto' },
  ];

  displayedColumns = [...this.positionColumns.map((c) => c.def), 'actions'];

  @Input() positions: PositionResponse[] = [];
  @Output() positionDeleted = new EventEmitter<PositionResponse>();

  dataSource = new MatTableDataSource<PositionRow>([]);

  @ViewChild(MatSort) sort!: MatSort;

  constructor(private _liveAnnouncer: LiveAnnouncer) {}

  ngOnInit(): void {
    this.setTableData();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['positions']) {
      console.log('Positions before => ', this.positions);
      this.setTableData();
    }
  }

  private setTableData(): void {
    this.dataSource.data = this.positions.map((position) => {
      const marketValue = position.close * position.quantity;

      const totalProfitLoss = marketValue - position.netAmount;

      const totalProfitLossPercentage = position.netAmount !== 0 ? (totalProfitLoss / position.netAmount) * 100 : 0;

      const dailyProfitLoss =
        position.previousClose != null ? (position.close - position.previousClose) * position.quantity : 0;

      return {
        ...position,
        marketValue,
        dailyProfitLoss,
        totalProfitLoss,
        totalProfitLossPercentage,
      };
    });
    console.log('Positions after => ', this.dataSource.data);
  }

  announceSortChange(sortState: Sort): void {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  onDeleteClicked(position: PositionResponse): void {
    this.positionDeleted.emit(position);
  }

  getValueStyle(columnDef: string, element: PositionRow): { [key: string]: string } {
    const coloredColumns = ['dailyProfitLoss', 'totalProfitLoss', 'totalProfitLossPercentage'];

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

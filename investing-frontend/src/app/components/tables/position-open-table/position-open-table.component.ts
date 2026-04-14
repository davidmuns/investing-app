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
import { PositionRow } from '../position/position-table.component';

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
  @Output() closePosition = new EventEmitter<UpdatePositionRequest>();
  dataSource = new MatTableDataSource<PositionOpenResponse>([]);
  @ViewChild(MatSort) sort!: MatSort;

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
    }
  }

  onClosePosition(event: UpdatePositionRequest) {
    this.closePosition.emit(event);
  }

  private setTableData(): void {
    this.dataSource.data = this.positions;
  }

  announceSortChange(sortState: Sort): void {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  getValueStyle(columnDef: string, element: PositionRow): { [key: string]: string } {
    return this.utilsSvc.getValueStyle(columnDef, element as unknown as Record<string, unknown>, [
      'dailyProfitLoss',
      'netProfitLossValue',
      'netProfitLossPercentage',
    ]);
  }
}

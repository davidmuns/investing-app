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
import { Instrument } from '@app/shared/models/instrument';
import { InstrumentResponse } from '@app/shared/models/instrument-response';

@Component({
  selector: 'app-instrument-table',
  templateUrl: './instrument-table.component.html',
  styleUrls: ['./instrument-table.component.css'],
})
export class InstrumentTableComponent implements OnInit, AfterViewInit, OnChanges {
  instrumentColumns = [
    // { def: 'id', label: 'ID' },
    { def: 'name', label: 'Nombre' },
    { def: 'symbol', label: 'Símbolo' },
    { def: 'type', label: 'Tipo' },
    { def: 'exchange', label: 'Exchange' },
    { def: 'close', label: 'Último' },
    { def: 'open', label: 'Apertura' },
    { def: 'high', label: 'Máximo' },
    { def: 'low', label: 'Mínimo' },
    { def: 'change', label: 'Var.' },
    { def: 'percentChange', label: '% var.' },
  ];
  displayedColumns = [...this.instrumentColumns.map((c) => c.def), 'actions'];
  @Input() instruments: InstrumentResponse[] = [];
  @Output() instrumentDeleted = new EventEmitter<Instrument>();
  dataSource = new MatTableDataSource<InstrumentResponse>([]);
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private _liveAnnouncer: LiveAnnouncer,
    private utilsSvc: UtilsService,
  ) {}

  ngOnInit(): void {
    this.dataSource.data = this.instruments;
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['instruments']) {
      this.dataSource.data = this.instruments;
    }
  }
  /** Announce the change in sort state for assistive technology. */
  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  onDeleteClicked(instrument: Instrument): void {
    this.instrumentDeleted.emit(instrument);
  }

  getCellClass(columnDef: string): string {
    if (columnDef === 'name' || columnDef === 'symbol') {
      return 'link-cell';
    }

    return '';
  }

  getValueStyle(columnDef: string, element: InstrumentResponse): { [key: string]: string } {
    return this.utilsSvc.getValueStyle(columnDef, element as unknown as Record<string, unknown>, [
      'change',
      'percentChange',
    ]);
  }
}

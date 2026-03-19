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
import { InstrumentService } from '@app/services/instrument.service';
import { UtilsService } from '@app/services/utils.service';
import { InstrumentResponse } from '@app/shared/models/instrument-response';
import { Position } from '@app/shared/models/position';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
})
export class TableComponent implements OnInit, AfterViewInit, OnChanges {
  instrumentColumns = [
    // { def: 'id', label: 'ID' },
    { def: 'name', label: 'Nombre' },
    { def: 'symbol', label: 'Símbolo' },
    { def: 'type', label: 'Tipo' },
    { def: 'exchange', label: 'Exchange' },
  ];
  displayedColumns = [...this.instrumentColumns.map((c) => c.def), 'actions'];
  @Input() instruments: InstrumentResponse[] = [];
  @Output() instrumentDeleted = new EventEmitter<number>();
  dataSource = new MatTableDataSource<InstrumentResponse>([]);
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private _liveAnnouncer: LiveAnnouncer,
    private instrumentSvc: InstrumentService,
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

  delete(instrument: InstrumentResponse): void {
    const { id, name } = instrument;
    this.instrumentSvc.deleteById(id).subscribe({
      next: () => {
        this.utilsSvc.showSnackBar(`Instrument ${name} deleted`, 3000);
        this.instrumentDeleted.emit(id);
      },
      error: (err) => {
        console.error('Error deleting instrument', err);
        this.utilsSvc.showSnackBar(`Could not delete instrument ${name}`, 3000);
      },
    });
  }
}

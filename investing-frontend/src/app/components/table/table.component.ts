import { LiveAnnouncer } from '@angular/cdk/a11y';
import { AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { InstrumentService } from '@app/services/instrument.service';
import { Instrument } from '@app/shared/models/instrument';
import { Position } from '@app/shared/models/position';

const ELEMENT_DATA: Position[] = [
  {
    nombre: 'Adobe',
    simbolo: 'ADBE',
    tipo: 'Compra',
    cantidad: 2,
    precioMedio: 252,
    precioActual: 242.75,
    valorMercado: 485.5,
    bpDiario: 4.39,
    procentajeBpDiario: -3.67,
    bpNeto: -18.5,
  },
  {
    nombre: 'Oracle',
    simbolo: 'ORCL',
    tipo: 'Compra',
    cantidad: 5,
    precioMedio: 125,
    precioActual: 110,
    valorMercado: 500,
    bpDiario: 5,
    procentajeBpDiario: 5,
    bpNeto: 6,
  },
  {
    nombre: 'PayPal',
    simbolo: '2PP',
    tipo: 'Compra',
    cantidad: 5,
    precioMedio: 125,
    precioActual: 110,
    valorMercado: 500,
    bpDiario: 5,
    procentajeBpDiario: 5,
    bpNeto: 6,
  },
];

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
})
export class TableComponent implements OnInit, AfterViewInit, OnChanges {
  columns = [
    { def: 'nombre', label: 'Nombre' },
    { def: 'simbolo', label: 'Símbolo' },
    { def: 'tipo', label: 'Tipo' },
    { def: 'cantidad', label: 'Cantidad' },
    { def: 'precioMedio', label: 'Precio medio' },
    { def: 'precioActual', label: 'Precio actual' },
    { def: 'valorMercado', label: 'Valor mercado' },
    { def: 'bpDiario', label: 'B/P diario' },
    { def: 'procentajeBpDiario', label: '% B/P diario' },
    { def: 'bpNeto', label: 'B/P neto' },
  ];

  instrumentColumns = [
    { def: 'id', label: 'ID' },
    { def: 'name', label: 'Nombre' },
    { def: 'symbol', label: 'Símbolo' },
    { def: 'type', label: 'Tipo' },
    { def: 'exchange', label: 'Exchange' },
  ];
  displayedColumns = this.instrumentColumns.map((c) => c.def);
  // displayedColumns = this.columns.map((c) => c.def);
  // dataSource = new MatTableDataSource<Position>(ELEMENT_DATA);
  // dataSource!: MatTableDataSource<Instrument>;
  @Input() instruments: Instrument[] = [];
  dataSource = new MatTableDataSource<Instrument>([]);
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private _liveAnnouncer: LiveAnnouncer,
    private instrumentSvc: InstrumentService,
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
}

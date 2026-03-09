import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Position } from '@app/shared/models/position';

const ELEMENT_DATA: Position[] = [
  {
    nombre: 'Adobe',
    simbolo: 'ADBE',
    tipo: 'compra',
    cantidad: 5,
    precioMedio: 125,
    precioActual: 110,
    valorMercado: 500,
    bpDiario: 5,
    procentajeBpDiario: 5,
    bpNeto: 6,
  },
  {
    nombre: 'Adobe',
    simbolo: 'ADBE',
    tipo: 'compra',
    cantidad: 5,
    precioMedio: 125,
    precioActual: 110,
    valorMercado: 500,
    bpDiario: 5,
    procentajeBpDiario: 5,
    bpNeto: 6,
  },
  {
    nombre: 'Adobe',
    simbolo: 'ADBE',
    tipo: 'compra',
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
export class TableComponent implements OnInit {
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
  displayedColumns = this.columns.map((c) => c.def);
  data = new MatTableDataSource<Position>();

  constructor() {}

  ngOnInit(): void {
    this.data.data = ELEMENT_DATA;
  }
}

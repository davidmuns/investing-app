import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { InstrumentService } from '@app/services/instrument.service';
import { Instrument } from '@app/shared/models/instrument';
import { Position } from '@app/shared/models/position';
import { SearchResponse } from '@app/shared/models/search-response';
import { debounceTime, map, Observable, of, startWith, switchMap } from 'rxjs';

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
  selector: 'app-search-position-oriol',
  templateUrl: './search-position-oriol.component.html',
  styleUrls: ['./search-position-oriol.component.css'],
})
export class SearchPositionOriolComponent implements OnInit {
  // form = this.fb.control('', [Validators.minLength(1), Validators.required]);
  form = this.fb.control('', [Validators.minLength(1)]);

  instruments: Instrument[] = [];

  filteredOptions!: Observable<string[]>;

  constructor(
    private readonly fb: FormBuilder,
    private instrumentSvc: InstrumentService,
  ) {}

  ngOnInit(): void {
    // console.log('inside ' + SearchPositionOriolComponent.toString());
    this.initFilteredOptions();
  }

  private initFilteredOptions(): void {
    this.filteredOptions = this.form.valueChanges.pipe(
      // startWith(''),
      debounceTime(200),
      map((value) => this.normalizeQuery(value)),
      switchMap((value) => this.searchInstruments(value)),
    );
  }

  private normalizeQuery(value: string | null): string {
    return (value || '').trim();
  }

  private searchInstruments(value: string): Observable<string[]> {
    if (!value) {
      this.instruments = [];
      return of([]);
    }

    return this.instrumentSvc.search(value).pipe(map((response) => this.handleSearchResults(response)));
  }

  private handleSearchResults(response: SearchResponse<Instrument>): string[] {
    this.instruments = response.data;
    console.log(response);
    return response.data.map((instrument) => instrument.instrument_name);
  }

  clearInput(): void {
    // O también this.form.setValue('') para borrar el contenido.
    this.form.reset();
  }
}

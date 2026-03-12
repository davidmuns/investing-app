import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Position } from '@app/shared/models/position';
import { debounceTime, map, Observable, startWith } from 'rxjs';

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
  positions: Position[] = [];
  options: string[] = [];
  filteredOptions!: Observable<string[]>;

  constructor(private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.getPositions();
    this.filteredOptions = this.form.valueChanges.pipe(
      debounceTime(400),
      startWith(''),
      map((value) => this._filter(value || '')),
    );
  }

  clearInput(): void {
    this.form.reset(); // O también puedes usar this.form.setValue('') para borrar el contenido.
  }

  private getPositions() {
    this.positions = ELEMENT_DATA;
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    // if (this.form.valid) {
    //   this.positions = ELEMENT_DATA;
    //   this.options = [];
    //   this.positions.forEach((x) => {
    //     this.options.push(x.nombre);
    //   });
    //   this.uniqueChars = [...new Set(this.options)];
    // }
    // return this.uniqueChars.filter((option) => option.toLowerCase().includes(filterValue));
    return this.positions
      .map((position) => position.nombre)
      .filter((nombre) => nombre.toLowerCase().includes(filterValue));
  }

  submitArticle() {
    for (const option of this.positions) {
      if (option.nombre === this.form.value) {
        // this.articleId = option.id;
        // this.router.navigate(['article', this.articleId]);
        // this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        // this.router.onSameUrlNavigation = 'reload';
      }
    }
  }

  selectArticle(value: string) {
    for (const option of this.positions) {
      if (option.nombre === value) {
        // this.articleId = option.id;
        // this.router.navigate(['article', this.articleId]);
        // this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        // this.router.onSameUrlNavigation = 'reload';
        break;
      }
    }
  }
}

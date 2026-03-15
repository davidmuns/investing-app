import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { InstrumentService } from '@app/services/instrument.service';
import { Instrument } from '@app/shared/models/instrument';
import { PortfolioResponse } from '@app/shared/models/portfolios-response';
import { SearchResponse } from '@app/shared/models/search-response';
import { debounceTime, map, Observable, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-search-position-gpt',
  templateUrl: './search-position-gpt.component.html',
  styleUrls: ['./search-position-gpt.component.css'],
})
export class SearchPositionGptComponent implements OnInit {
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
    this.instruments = response.items;
    return response.items.map((instrument) => instrument.name);
  }

  clearInput(): void {
    // O también this.form.setValue('') para borrar el contenido.
    this.form.reset();
  }

  addSymbol(symbol: any) {
    console.log(symbol);
  }
}

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { InstrumentService } from '@app/services/instrument.service';
import { Instrument } from '@app/shared/models/instrument';
import { SearchResponse } from '@app/shared/models/search-response';
import { debounceTime, map, Observable, of, switchMap } from 'rxjs';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { InstrumentRequest } from '@app/shared/models/instrument-request';

@Component({
  selector: 'app-search-position-gpt',
  templateUrl: './search-position-gpt.component.html',
  styleUrls: ['./search-position-gpt.component.css'],
})
export class SearchPositionGptComponent implements OnInit {
  form = this.fb.control<string | InstrumentRequest>('', [Validators.minLength(1)]);
  @Output() instrumentCreated = new EventEmitter<void>();
  @Input() portfolioId: number = 0;
  instruments: InstrumentRequest[] = [];
  filteredOptions!: Observable<Instrument[]>;
  displayInstrument = (instrument: Instrument | null): string => {
    return instrument ? instrument.symbol : '';
  };

  constructor(
    private readonly fb: FormBuilder,
    private instrumentSvc: InstrumentService,
  ) {}

  ngOnInit(): void {
    this.initFilteredOptions();
  }

  private initFilteredOptions(): void {
    this.filteredOptions = this.form.valueChanges.pipe(
      debounceTime(200),
      map((value) => this.normalizeQuery(value)),
      switchMap((value) => this.searchInstruments(value)),
    );
  }

  private normalizeQuery(value: string | InstrumentRequest | null): string {
    if (typeof value === 'string') {
      return value.trim();
    }

    if (value && typeof value === 'object') {
      return value.instrument_name?.trim() || '';
    }

    return '';
  }

  private searchInstruments(value: string): Observable<InstrumentRequest[]> {
    if (!value) {
      this.instruments = [];
      return of([]);
    }

    return this.instrumentSvc.search(value).pipe(map((response) => this.handleSearchResults(response)));
  }

  private handleSearchResults(response: SearchResponse<InstrumentRequest>): InstrumentRequest[] {
    // console.log(response);
    this.instruments = response.data;
    return response.data.map((response) => response);
  }

  onOptionSelected(event: MatAutocompleteSelectedEvent): void {
    const instrument = event.option.value as InstrumentRequest;
    this.addSymbol(instrument);
    this.form.reset();
  }

  addSymbol(instrument: InstrumentRequest) {
    this.instrumentSvc.create(instrument, this.portfolioId).subscribe({
      next: (data) => {
        this.instrumentCreated.emit();
      },
      error: (err) => {
        console.log(err.error.message);
      },
    });
  }
}

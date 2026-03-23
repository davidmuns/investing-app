import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { InstrumentService } from '@app/services/instrument.service';
import { SearchResponse } from '@app/shared/models/search-response';
import { debounceTime, map, Observable, of, switchMap } from 'rxjs';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { InstrumentRequest } from '@app/shared/models/instrument-request';
import { InstrumentResponse } from '@app/shared/models/instrument-response';

@Component({
  selector: 'app-search-instrument',
  templateUrl: './search-instrument.component.html',
  styleUrls: ['./search-instrument.component.css'],
})
export class SearchInstrumentComponent implements OnInit {
  form = this.fb.control<string | InstrumentResponse>('', [Validators.minLength(1)]);
  @Output() instrumentCreated = new EventEmitter<void>();
  @Input() portfolioId: number = 0;
  instruments: InstrumentResponse[] = [];
  filteredOptions!: Observable<InstrumentResponse[]>;
  displayInstrument = (instrument: InstrumentResponse | null): string => {
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

  private normalizeQuery(value: string | InstrumentResponse | null): string {
    if (typeof value === 'string') {
      return value.trim();
    }

    if (value && typeof value === 'object') {
      return value.name?.trim() || '';
    }

    return '';
  }

  private searchInstruments(value: string): Observable<InstrumentResponse[]> {
    if (!value) {
      this.instruments = [];
      return of([]);
    }

    return this.instrumentSvc.search(value).pipe(map((response) => this.handleSearchResults(response)));
  }

  private handleSearchResults(response: SearchResponse<InstrumentResponse>): InstrumentResponse[] {
    this.instruments = response.data;
    // console.log(this.instruments);
    return response.data.map((response) => response);
  }

  onOptionSelected(event: MatAutocompleteSelectedEvent): void {
    const instrument = event.option.value as InstrumentRequest;
    this.addInstrument(instrument);
    this.form.reset();
  }

  addInstrument(instrument: InstrumentRequest) {
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

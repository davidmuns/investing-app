import { Component, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { InstrumentService } from '@app/services/instrument.service';
import { SearchResponse } from '@app/shared/models/search-response';
import { debounceTime, map, Observable, of, switchMap } from 'rxjs';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { InstrumentRequest } from '@app/shared/models/instrument-request';

@Component({
  selector: 'app-search-instrument',
  templateUrl: './search-instrument.component.html',
  styleUrls: ['./search-instrument.component.css'],
})
export class SearchInstrumentComponent implements OnInit {
  @ViewChild('searchInstrumentInput') searchInput!: ElementRef<HTMLInputElement>;
  form = this.fb.control<string | InstrumentRequest>('', [Validators.minLength(1)]);
  @Output() instrumentSelected = new EventEmitter<InstrumentRequest>();
  @Output() searchFocused = new EventEmitter<void>();
  instruments: InstrumentRequest[] = [];
  filteredOptions!: Observable<InstrumentRequest[]>;
  displayInstrument = (instrument: InstrumentRequest | null): string => {
    return instrument ? instrument.symbol : '';
  };

  constructor(
    private readonly fb: FormBuilder,
    private instrumentSvc: InstrumentService,
  ) {}

  ngOnInit(): void {
    this.initFilteredOptions();
  }

  ngOnChanges() {
    this.form.reset();
  }

  focusInput(): void {
    this.searchInput?.nativeElement.focus();
  }

  onInstrumentClicked(event: MatAutocompleteSelectedEvent): void {
    const instrument = event.option.value as InstrumentRequest;
    this.instrumentSelected.emit(instrument);
    this.form.reset();
  }

  onFocusSearch(): void {
    this.searchFocused.emit();
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
      return value.name?.trim() || '';
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
    this.instruments = response.data;
    return response.data.map((response) => response);
  }
}

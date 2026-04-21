import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { InstrumentService } from '@app/services/instrument.service';
import { PortfolioService } from '@app/services/portfolio.service';
import { PositionService } from '@app/services/position.service';
import { TokenService } from '@app/services/token.service';
import { UtilsService } from '@app/services/utils.service';
import { PortfolioResponse } from '@app/shared/models/portfolios-response';
import { SearchResponse } from '@app/shared/models/search-response';

import { PortfoliosComponent } from './portfolios.component';

describe('PortfoliosComponent', () => {
  let fixture: ComponentFixture<PortfoliosComponent>;
  let component: PortfoliosComponent;
  let portfolioService: jasmine.SpyObj<PortfolioService>;
  let tokenService: jasmine.SpyObj<TokenService>;
  let positionService: jasmine.SpyObj<PositionService>;
  let instrumentService: jasmine.SpyObj<InstrumentService>;

  const createSearchResponse = <T>(data: T[]): SearchResponse<T> => ({
    data,
    count: data.length,
  });

  beforeEach(async () => {
    portfolioService = jasmine.createSpyObj<PortfolioService>('PortfolioService', [
      'listByUsername',
      'create',
      'reorder',
    ]);
    tokenService = jasmine.createSpyObj<TokenService>('TokenService', ['getUsername']);
    positionService = jasmine.createSpyObj<PositionService>('PositionService', [
      'listByPortfolioId',
      'listSummaryByPortfolioId',
      'listPositionCloseByPortfolioId',
      'listPositionOpenByPortfolioId',
    ]);
    instrumentService = jasmine.createSpyObj<InstrumentService>('InstrumentService', ['listByPortfolioId']);

    tokenService.getUsername.and.returnValue('alice');
    portfolioService.listByUsername.and.returnValue(of(createSearchResponse([])));
    portfolioService.create.and.returnValue(
      of({
        id: 1,
        name: 'Mi cartera',
        type: 'POSITIONS',
        displayOrder: 0,
      }),
    );
    portfolioService.reorder.and.returnValue(of(createSearchResponse([])));
    positionService.listByPortfolioId.and.returnValue(of(createSearchResponse([])));
    positionService.listSummaryByPortfolioId.and.returnValue(of(createSearchResponse([])));
    positionService.listPositionCloseByPortfolioId.and.returnValue(of(createSearchResponse([])));
    positionService.listPositionOpenByPortfolioId.and.returnValue(of(createSearchResponse([])));
    instrumentService.listByPortfolioId.and.returnValue(of(createSearchResponse([])));

    await TestBed.configureTestingModule({
      declarations: [PortfoliosComponent],
      providers: [
        { provide: PortfolioService, useValue: portfolioService },
        { provide: MatDialog, useValue: {} },
        { provide: InstrumentService, useValue: instrumentService },
        { provide: UtilsService, useValue: {} },
        { provide: PositionService, useValue: positionService },
        { provide: TokenService, useValue: tokenService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PortfoliosComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user portfolios on init', () => {
    const portfolios: PortfolioResponse[] = [
      {
        id: 7,
        name: 'Principal',
        type: 'POSITIONS',
        displayOrder: 0,
      },
    ];
    portfolioService.listByUsername.and.returnValue(of(createSearchResponse(portfolios)));
    portfolioService.reorder.and.returnValue(of(createSearchResponse(portfolios)));

    fixture.detectChanges();

    expect(tokenService.getUsername).toHaveBeenCalled();
    expect(portfolioService.listByUsername).toHaveBeenCalledWith('alice');
    expect(component.username).toBe('alice');
    expect(component.portfolios).toEqual(portfolios);
    expect(component.portfolioId).toBe(7);
    expect(component.portfolioType).toBe('POSITIONS');
  });

  it('should load portfolios by username and refresh position data for a positions portfolio', () => {
    const portfolios: PortfolioResponse[] = [
      {
        id: 15,
        name: 'Cartera principal',
        type: 'POSITIONS',
        displayOrder: 0,
      },
    ];
    component.username = 'alice';
    portfolioService.listByUsername.and.returnValue(of(createSearchResponse(portfolios)));
    portfolioService.reorder.and.returnValue(of(createSearchResponse(portfolios)));

    component.loadPortfoliosByUsername();

    expect(portfolioService.listByUsername).toHaveBeenCalledWith('alice');
    expect(component.portfolios).toEqual(portfolios);
    expect(component.portfolioId).toBe(15);
    expect(component.portfolioType).toBe('POSITIONS');
    expect(positionService.listByPortfolioId).toHaveBeenCalledWith(15);
    expect(positionService.listSummaryByPortfolioId).toHaveBeenCalledWith(15);
    expect(positionService.listPositionCloseByPortfolioId).toHaveBeenCalledWith(15);
    expect(positionService.listPositionOpenByPortfolioId).toHaveBeenCalledWith(15);
    expect(instrumentService.listByPortfolioId).not.toHaveBeenCalled();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalPortfolioComponent } from './modal-portfolio.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

describe('ModalPortfolioComponent', () => {
  let component: ModalPortfolioComponent;
  let fixture: ComponentFixture<ModalPortfolioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalPortfolioComponent],
      providers: [{ provide: MatDialogRef, useValue: jasmine.createSpy('ModalPortfolioComponent') }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalPortfolioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

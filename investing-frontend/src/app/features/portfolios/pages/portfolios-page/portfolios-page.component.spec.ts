import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfoliosPageComponent } from './portfolios-page.component';

describe('PortfoliosPageComponent', () => {
  let component: PortfoliosPageComponent;
  let fixture: ComponentFixture<PortfoliosPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PortfoliosPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortfoliosPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

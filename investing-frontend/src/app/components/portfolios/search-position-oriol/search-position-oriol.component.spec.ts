import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchPositionOriolComponent } from './search-position-oriol.component';

describe('SearchPositionOriolComponent', () => {
  let component: SearchPositionOriolComponent;
  let fixture: ComponentFixture<SearchPositionOriolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchPositionOriolComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchPositionOriolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

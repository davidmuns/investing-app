import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchPositionGptComponent } from './search-position-gpt.component';

describe('SearchPositionGptComponent', () => {
  let component: SearchPositionGptComponent;
  let fixture: ComponentFixture<SearchPositionGptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchPositionGptComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchPositionGptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

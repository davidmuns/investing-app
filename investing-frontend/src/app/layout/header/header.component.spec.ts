import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';

import { HeaderComponent } from './header.component';
import { TokenService } from '@app/services/token.service';
import { UtilsService } from '@app/services/utils.service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let tokenService: jasmine.SpyObj<TokenService>;
  let utilsSvc: jasmine.SpyObj<UtilsService>;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    tokenService = jasmine.createSpyObj<TokenService>('TokenService', ['isLogged', 'getUsername', 'logOut']);
    utilsSvc = jasmine.createSpyObj<UtilsService>('UtilsService', ['showSnackBar']);
    tokenService.isLogged.and.returnValue(false);
    tokenService.getUsername.and.returnValue(null);

    await TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      imports: [MatMenuModule],
      providers: [
        { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) },
        { provide: TokenService, useValue: tokenService },
        { provide: UtilsService, useValue: utilsSvc },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

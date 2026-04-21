import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormTemplateComponent } from './form-template.component';
import { MatDialog } from '@angular/material/dialog';
import { TokenService } from '@app/services/token.service';
import { UtilsService } from '@app/services/utils.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@app/services/auth.service';

describe('FormTemplateComponent', () => {
  let component: FormTemplateComponent;
  let tokenService: jasmine.SpyObj<TokenService>;
  let utilsSvc: jasmine.SpyObj<UtilsService>;
  let authSvc: jasmine.SpyObj<AuthService>;
  let fixture: ComponentFixture<FormTemplateComponent>;

  beforeEach(async () => {
    tokenService = jasmine.createSpyObj<TokenService>('TokenService', ['isLogged', 'getUsername', 'logOut']);
    utilsSvc = jasmine.createSpyObj<UtilsService>('UtilsService', ['showSnackBar']);
    authSvc = jasmine.createSpyObj<AuthService>('AuthService', ['loginUser', 'signupUser']);
    tokenService.isLogged.and.returnValue(false);
    tokenService.getUsername.and.returnValue(null);

    await TestBed.configureTestingModule({
      declarations: [FormTemplateComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open', 'closeAll']) },
        { provide: AuthService, useValue: authSvc },
        { provide: TokenService, useValue: tokenService },
        { provide: UtilsService, useValue: utilsSvc },
        FormBuilder,
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FormTemplateComponent);
    component = fixture.componentInstance;
    component.formType = 'login';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

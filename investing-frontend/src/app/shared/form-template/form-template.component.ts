import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from '@app/services/auth.service';
import { PortfolioService } from '@app/services/portfolio.service';
import { TokenService } from '@app/services/token.service';
import { UtilsService } from '@app/services/utils.service';
import { LoginComponent } from 'src/app/components/auth/login/login.component';
import { PortfolioRequest } from '../models/portfolios-request';

type FormType = 'login' | 'signup' | 'Seguimiento' | 'Posiciones';
type PortfolioKind = 'WATCHLIST' | 'POSITIONS';

@Component({
  selector: 'app-form-template',
  templateUrl: './form-template.component.html',
  styleUrls: ['./form-template.component.css'],
})
export class FormTemplateComponent implements OnInit {
  @Input() formType!: FormType;
  @Output() portfolioRequest = new EventEmitter<PortfolioRequest>();
  protected form!: FormGroup;
  protected hide: boolean = true;
  formError = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialog: MatDialog,
    private readonly authSvc: AuthService,
    private readonly tokenSvc: TokenService,
    private readonly utilsSvc: UtilsService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.initFormByType();
  }

  onSubmit() {
    switch (this.formType) {
      case 'login': {
        this.login();
        break;
      }
      case 'signup': {
        this.signup();
        break;
      }
      case 'Seguimiento':
      case 'Posiciones': {
        this.emitPortfolio();
        break;
      }
      default: {
        alert('form type: ' + this.formType + ' does not exist');
        break;
      }
    }
  }

  private initFormByType(): void {
    switch (this.formType) {
      case 'login':
        this.initFormLogin();
        break;
      case 'signup':
        this.initFormSignup();
        break;
      case 'Seguimiento':
      case 'Posiciones':
        this.initFormAddPortfolio();
        break;
      default:
        alert(`option: ${this.formType} does not exist`);
    }
  }

  private initFormAddPortfolio() {
    this.form = this.fb.group({
      nombre: ['', [Validators.maxLength(20)]],
    });
  }

  private getPortfolioType(): PortfolioKind {
    return this.formType === 'Posiciones' ? 'POSITIONS' : 'WATCHLIST';
  }

  private initFormLogin() {
    this.form = this.fb.group({
      nombreUsuario: ['', [Validators.required, Validators.maxLength(30)]],
      password: ['', Validators.required],
    });
  }

  private initFormSignup() {
    this.form = this.fb.group({
      nombreUsuario: ['', [Validators.required, Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(30)]],
      password: ['', [Validators.required, Validators.pattern('^(?=.*[A-Za-z])(?=.*\\d).{8,}$')]],
    });
  }

  private login() {
    if (this.form.valid) {
      this.authSvc.loginUser(this.form.value).subscribe({
        next: (data) => {
          this.tokenSvc.setToken(data.token);
          this.dialog.closeAll();
          const msg = `${'Welcome '} ${this.form.value.nombreUsuario}!`;

          // this.router.navigate(['group-form']);
          setTimeout(() => {
            this.utilsSvc.showSnackBar(msg, 5000);
            this.router.navigate(['portfolios']);
          }, 600);
        },
        error: (err) => {
          const msg = 'auth.login.wrong-data';
          this.utilsSvc.showSnackBar(msg, 10000);
          this.form.reset();
        },
      });
    } else {
      const msg = 'auth.login.fill-blanks';
      this.utilsSvc.showSnackBar(msg, 5000);
    }
  }

  private signup() {
    let msg = '';
    if (this.form.valid) {
      this.authSvc.signupUser(this.form.value).subscribe({
        next: (data) => {
          this.dialog.closeAll();
          this.dialog.open(LoginComponent);
          msg = 'user-saved';
          this.utilsSvc.showSnackBar(msg, 10000);
        },
        error: (err) => {
          if (err.error.mensaje.includes('Email')) {
            msg = 'email-exists';
          } else {
            msg = 'username-exists';
          }
          this.utilsSvc.showSnackBar(err.error.mensaje, 3000);
        },
      });
    } else {
      const msg = 'fill-blanks';
      this.utilsSvc.showSnackBar(msg, 3000);
    }
  }

  emitPortfolio(): void {
    const name = this.form.value.nombre.trim();
    if (!name) {
      this.formError = 'El nombre es obligatorio.';
      return;
    }
    this.formError = '';
    const newPortfolio = { name, type: this.getPortfolioType() } as PortfolioRequest;
    this.portfolioRequest.emit(newPortfolio);
  }

  removeErr() {
    this.formError = '';
  }

  signupOpen() {
    this.dialog.closeAll();
    this.dialog.open(LoginComponent, {
      enterAnimationDuration: '1000ms',
    });
  }
}

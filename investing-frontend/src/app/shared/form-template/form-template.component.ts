import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
// import { EmailPasswordComponent } from 'src/app/components/auth/email-password/email-password.component';
import { Router } from '@angular/router';
import { AuthService } from '@app/services/auth.service';
import { TokenService } from '@app/services/token.service';
import { UtilsService } from '@app/services/utils.service';
import { LoginComponent } from 'src/app/components/auth/login/login.component';

@Component({
  selector: 'app-form-template',
  templateUrl: './form-template.component.html',
  styleUrls: ['./form-template.component.css'],
})
export class FormTemplateComponent implements OnInit {
  @Input() formType: string = '';
  protected form!: FormGroup;
  protected hide: boolean = true;

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialog: MatDialog,
    private readonly authSvc: AuthService,
    private readonly tokenSvc: TokenService,
    private readonly utilsSvc: UtilsService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    if (this.formType === 'login') {
      this.initFormLogin();
    } else if (this.formType === 'signup') {
      this.initFormSignup();
    } else {
      alert('option: ' + this.formType + 'does not exist');
    }
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
      default: {
        alert('form type: ' + this.formType + ' does not exist');
        break;
      }
    }
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
            // this.router.navigate(['articles']);
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

  signupOpen() {
    this.dialog.closeAll();
    this.dialog.open(LoginComponent, {
      enterAnimationDuration: '1000ms',
    });
  }
}

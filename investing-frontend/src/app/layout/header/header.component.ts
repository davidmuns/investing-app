import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { LoginComponent } from '@app/components/auth/login/login.component';
import { TokenService } from '@app/services/token.service';
import { UtilsService } from '@app/services/utils.service';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  isMobile = false;
  isSolid = true;
  isDarkMode = false;
  isHomeRoute = false;
  private readonly darkModeStorageKey = 'home-dark-mode';

  contexts = [
    {
      lang: 'ca',
      flagUrl: 'https://wallpapercave.com/wp/wp2240009.png',
      title: 'Català',
      label: 'Català',
      width: '20',
      height: '20',
    },
    {
      lang: 'es',
      flagUrl:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Bandera_de_Espa%C3%B1a.svg/1200px-Bandera_de_Espa%C3%B1a.svg.png',
      title: 'Español',
      label: 'Español',
      width: '20',
      height: '20',
    },
    {
      lang: 'en',
      flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/aa/Flag_of_the_United_Kingdom_%281-1%29.svg',
      title: 'English',
      label: 'English',
      width: '20',
      height: '20',
    },
    {
      lang: 'ru',
      flagUrl: 'https://www.publicdomainpictures.net/pictures/250000/velka/russian-flag-151947920021T.jpg',
      title: 'Русский',
      label: 'Русский',
      width: '20',
      height: '20',
    },
  ];
  constructor(
    public dialog: MatDialog,
    public tokenService: TokenService,
    public utilsSvc: UtilsService,
    private readonly router: Router,
    private readonly renderer: Renderer2,
    @Inject(DOCUMENT) private readonly document: Document,
  ) {}

  ngOnInit(): void {
    this.isDarkMode = localStorage.getItem(this.darkModeStorageKey) === 'true';
    this.syncRouteState(this.router.url);
    this.applyHomeDarkModeClass();

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.syncRouteState(event.urlAfterRedirects);
        this.applyHomeDarkModeClass();
      });
  }

  openMenu(menuTrigger: MatMenuTrigger) {
    // menuTrigger.openMenu();
  }

  openLogin() {
    this.dialog.open(LoginComponent, {
      enterAnimationDuration: '500ms',
      exitAnimationDuration: '500ms',
    });
  }

  onLogout() {
    const msg = `${'See you '} ${this.tokenService.getUsername()}!!`;
    this.utilsSvc.showSnackBar(msg, 5000);
    this.tokenService.logOut();
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem(this.darkModeStorageKey, String(this.isDarkMode));
    this.applyHomeDarkModeClass();
  }

  private syncRouteState(url: string): void {
    this.isHomeRoute = url === '/home' || url === '/';
  }

  private applyHomeDarkModeClass(): void {
    const method = this.isDarkMode && this.isHomeRoute ? 'addClass' : 'removeClass';
    this.renderer[method](this.document.body, 'home-dark-mode');
  }
}

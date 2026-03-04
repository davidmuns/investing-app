import { Component, OnInit } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  isMobile = false;
  isSolid = false;

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
  constructor() {}

  ngOnInit(): void {}

  openMenu(menuTrigger: MatMenuTrigger) {
    // menuTrigger.openMenu();
  }
}

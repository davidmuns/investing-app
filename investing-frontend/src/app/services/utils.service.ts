import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  constructor(private readonly snack: MatSnackBar) {}
  public showSnackBar(msg: string, duration: number) {
    // const action = this.translateSvc.instant('article.close');
    const action = 'close';
    this.snack.open(msg, action, {
      duration: duration,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
}

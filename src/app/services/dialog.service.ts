import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { MatDialog } from '@angular/material';
import { ConfirmationDialogComponent } from '../shared/confirmation-dialog/confirmation-dialog.component';
import { switchMap } from 'rxjs/operators';
import { LoginComponent } from '../components/login/login.component';

@Injectable()
export class DialogService {
   constructor(public dialog: MatDialog) {}

   public confirm(text: string): Observable<boolean> {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
         width: '350px',
         data: text
      });
      return dialogRef
         .afterClosed()
         .pipe(
            switchMap(result => (result ? of(result) : throwError('cancelled')))
         );
   }

   public showLogin(): Observable<any> {
      const dialogRef = this.dialog.open(LoginComponent, {
         width: '350px'
      });
      return dialogRef.afterClosed();
   }
}

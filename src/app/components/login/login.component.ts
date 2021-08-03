import {
   ChangeDetectionStrategy,
   ChangeDetectorRef,
   Component,
   OnInit
} from '@angular/core';
import { LoginService } from '../../services/login.service';
import { SettingsService } from '../../services/settings.service';
import { MatDialogRef } from '@angular/material/dialog';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
   selector: 'app-login',
   templateUrl: './login.component.html',
   styleUrls: ['./login.component.scss'],
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit {
   public username = '';
   public password = '';
   status = 'IDLE';

   constructor(
      private loginService: LoginService,
      private settingsService: SettingsService,
      private cdRef: ChangeDetectorRef,
      public dialogRef: MatDialogRef<LoginComponent>
   ) {}

   ngOnInit() {
      this.settingsService.getServerCredentials().subscribe({
         next: credentials => {
            this.username = credentials?.username;
            this.cdRef.detectChanges();
         }
      });
   }

   login() {
      this.status = 'LOADING';
      this.loginService
         .login(this.username, this.password)
         .pipe(
            tap(() => {
               this.dialogRef.close();
               this.status = 'IDLE';
            }),
            catchError(err => {
               if (err?.response?.status === 401) {
                  this.status = 'ERROR_401';
               } else {
                  this.status = 'ERROR';
               }
               return throwError(err);
            })
         )
         .subscribe()
         .add(() => this.cdRef.detectChanges());
   }
}

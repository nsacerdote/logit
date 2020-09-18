import {
   ChangeDetectionStrategy,
   ChangeDetectorRef,
   Component,
   OnInit
} from '@angular/core';
import { LoginService } from '../../services/login.service';
import { SettingsService } from '../../services/settings.service';
import { MatDialogRef } from '@angular/material';

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
      this.settingsService.getJiraUser().subscribe({
         next: user => {
            this.username = user;
            this.cdRef.detectChanges();
         }
      });
   }

   login() {
      this.status = 'LOADING';
      this.loginService
         .login(this.username, this.password)
         .subscribe({
            next: () => {
               this.settingsService.saveJiraUser(this.username);
               this.dialogRef.close();
            },
            complete: () => (this.status = 'IDLE'),
            error: err => {
               if (err.response.status === 401) {
                  this.status = 'ERROR_401';
               } else {
                  this.status = 'ERROR';
               }
            }
         })
         .add(() => this.cdRef.detectChanges());
   }
}

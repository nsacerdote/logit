import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { map, switchMap, tap } from 'rxjs/operators';
import { LoginService } from './services/login.service';
import { DialogService } from './services/dialog.service';
import { SettingsService } from './services/settings.service';
import { combineLatest, of } from 'rxjs';
import { Router } from '@angular/router';

@Component({
   selector: 'app-root',
   templateUrl: './app.component.html',
   styleUrls: ['./app.component.scss'],
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
   constructor(
      private translate: TranslateService,
      private settingsService: SettingsService,
      private loginService: LoginService,
      private dialogService: DialogService,
      private router: Router
   ) {
      translate.setDefaultLang('en');
   }

   ngOnInit(): void {
      this.checkRequiredSettings()
         .pipe(
            switchMap(requiredSettingsPresent =>
               requiredSettingsPresent ? this.tryRestoreLogin() : of()
            )
         )
         .subscribe();
   }

   private checkRequiredSettings() {
      return combineLatest([
         this.settingsService.getServerType(),
         this.settingsService.getServerUrl()
      ]).pipe(
         map(([serverType, serverUrl]) => {
            if (!serverType || !serverUrl) {
               this.router.navigate(['/settings']);
               return false;
            } else {
               return true;
            }
         })
      );
   }

   private tryRestoreLogin() {
      return this.loginService.restoreLogin().pipe(
         tap(loggedIn => {
            if (!loggedIn) {
               this.dialogService.showLogin();
            }
         })
      );
   }
}

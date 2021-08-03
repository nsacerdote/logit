import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { tap } from 'rxjs/operators';
import { LoginService } from './services/login.service';
import { DialogService } from './services/dialog.service';

@Component({
   selector: 'app-root',
   templateUrl: './app.component.html',
   styleUrls: ['./app.component.scss'],
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
   constructor(
      private translate: TranslateService,
      private loginService: LoginService,
      private dialogService: DialogService
   ) {
      translate.setDefaultLang('en');
   }

   ngOnInit(): void {
      this.loginService
         .init()
         .pipe(
            tap(loggedIn => {
               if (!loggedIn) {
                  this.dialogService.showLogin();
               }
            })
         )
         .subscribe();
   }
}

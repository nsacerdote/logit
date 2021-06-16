import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
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
      private dialogService: DialogService
   ) {
      translate.setDefaultLang('en');
   }

   ngOnInit(): void {
      this.dialogService.showLogin();
   }
}

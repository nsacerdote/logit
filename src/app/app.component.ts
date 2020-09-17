import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ElectronService } from './services/electron.service';
import { TranslateService } from '@ngx-translate/core';
import { AppConfig } from '../environments/environment';
import { DialogService } from './services/dialog.service';

@Component({
   selector: 'app-root',
   templateUrl: './app.component.html',
   styleUrls: ['./app.component.scss'],
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
   constructor(
      public electronService: ElectronService,
      private translate: TranslateService,
      private dialogService: DialogService
   ) {
      translate.setDefaultLang('en');
      console.log('AppConfig', AppConfig);

      if (electronService.isElectron()) {
         console.log('Mode electron');
         console.log('Electron ipcRenderer', electronService.ipcRenderer);
         console.log('NodeJS childProcess', electronService.childProcess);
      } else {
         console.log('Mode web');
      }
   }

   ngOnInit(): void {
      this.dialogService.showLogin();
   }
}

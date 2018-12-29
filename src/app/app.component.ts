import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ElectronService } from './services/electron.service';
import { TranslateService } from '@ngx-translate/core';
import { AppConfig } from '../environments/environment';

@Component({
   selector: 'app-root',
   templateUrl: './app.component.html',
   styleUrls: ['./app.component.scss'],
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
   constructor(public electronService: ElectronService,
               private translate: TranslateService) {

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
}

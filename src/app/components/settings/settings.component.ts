import {
   ChangeDetectionStrategy,
   ChangeDetectorRef,
   Component,
   OnDestroy,
   OnInit
} from '@angular/core';
import { SettingsService } from '../../services/settings.service';

@Component({
   selector: 'app-settings',
   templateUrl: './settings.component.html',
   styleUrls: ['./settings.component.scss'],
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent implements OnInit, OnDestroy {
   serverUrl: string;

   constructor(
      private settingsService: SettingsService,
      private cdRef: ChangeDetectorRef
   ) {}

   ngOnInit() {
      this.settingsService.getServerUrl().subscribe(serverUrl => {
         this.serverUrl = serverUrl;
         this.cdRef.detectChanges();
      });
   }

   save() {
      this.settingsService.saveServerUrl(this.serverUrl).subscribe();
   }

   ngOnDestroy(): void {
      this.save();
   }
}

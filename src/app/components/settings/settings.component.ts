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
   jiraUrl: string;

   constructor(
      private settingsService: SettingsService,
      private cdRef: ChangeDetectorRef
   ) {}

   ngOnInit() {
      this.settingsService.getJiraUrl().subscribe(jiraUrl => {
         this.jiraUrl = jiraUrl;
         this.cdRef.detectChanges();
      });
   }

   save() {
      this.settingsService.saveJiraUrl(this.jiraUrl).subscribe();
   }

   ngOnDestroy(): void {
      this.save();
   }
}

import {
   ChangeDetectionStrategy,
   ChangeDetectorRef,
   Component,
   OnDestroy,
   OnInit
} from '@angular/core';
import { SettingsService } from '../../services/settings.service';
import { combineLatest } from 'rxjs';
import { SERVER_TYPES } from '../../services/server.service';
import { LoginService } from '../../services/login.service';
import { IssueCacheService } from '../../services/issue-cache.service';

@Component({
   selector: 'app-settings',
   templateUrl: './settings.component.html',
   styleUrls: ['./settings.component.scss'],
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent implements OnInit, OnDestroy {
   serverUrl: string;
   serverType: string;
   serverTypes = SERVER_TYPES;

   constructor(
      private settingsService: SettingsService,
      private cdRef: ChangeDetectorRef,
      private loginService: LoginService,
      private issueCacheService: IssueCacheService
   ) {}

   ngOnInit() {
      combineLatest([
         this.settingsService.getServerUrl(),
         this.settingsService.getServerType()
      ]).subscribe(([serverUrl, serverType]) => {
         this.serverUrl = serverUrl;
         this.serverType = serverType;
         this.cdRef.detectChanges();
      });
   }

   save() {
      this.settingsService.saveServerUrl(this.serverUrl).subscribe();
      this.settingsService.saveServerType(this.serverType).subscribe();
   }

   ngOnDestroy(): void {
      this.save();
   }

   serverTypeChanged() {
      this.loginService.logout();
      this.save();
   }

   clearIssueCache() {
      this.issueCacheService.clearAllCachedIssues().subscribe();
   }
}

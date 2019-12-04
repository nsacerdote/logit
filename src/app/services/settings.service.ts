import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Database } from '../entity/database';
import { Setting } from '../models/setting.model';
import { map } from 'rxjs/operators';

const KEYS = {
   JIRA_URL: 'JIRA_URL'
};
/**
 * This service is responsible for providing a way to access the settings configured in the settings screen
 */
@Injectable()
export class SettingsService {
   private settingDb: Database<Setting>;

   private static settingValue($setting: Observable<Setting>) {
      return $setting.pipe(map(s => (s ? s.value : s)));
   }

   constructor() {
      this.settingDb = new Database<Setting>('setting');
   }

   getJiraUrl(): Observable<string> {
      return SettingsService.settingValue(
         this.settingDb.findById(KEYS.JIRA_URL)
      );
   }

   saveJiraUrl(newJiraUrl): Observable<string> {
      return SettingsService.settingValue(
         this.settingDb.upsert(new Setting(KEYS.JIRA_URL, newJiraUrl))
      );
   }
}

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Database } from '../entity/database';
import { Setting } from '../models/setting.model';
import { map } from 'rxjs/operators';

const KEYS = {
   SERVER_URL: 'SERVER_URL',
   SERVER_USER: 'SERVER_USER'
};
/**
 * This service is responsible for providing a way to access the settings configured in the settings/login screen
 */
@Injectable({
   providedIn: 'root'
})
export class SettingsService {
   private settingDb: Database<Setting>;

   private static settingValue($setting: Observable<Setting>) {
      return $setting.pipe(map(s => (s ? s.value : s)));
   }

   constructor() {
      this.settingDb = new Database<Setting>('setting');
   }

   getServerUrl(): Observable<string> {
      return SettingsService.settingValue(
         this.settingDb.findById(KEYS.SERVER_URL)
      );
   }

   saveServerUrl(newJiraUrl): Observable<string> {
      return SettingsService.settingValue(
         this.settingDb.upsert(new Setting(KEYS.SERVER_URL, newJiraUrl))
      );
   }

   getServerUser(): Observable<string> {
      return SettingsService.settingValue(
         this.settingDb.findById(KEYS.SERVER_USER)
      );
   }

   saveServerUser(user): Observable<string> {
      return SettingsService.settingValue(
         this.settingDb.upsert(new Setting(KEYS.SERVER_USER, user))
      );
   }
}

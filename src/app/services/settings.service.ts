import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Database } from '../entity/database';
import { Setting } from '../models/setting.model';
import { map } from 'rxjs/operators';

const KEYS = {
   SERVER_URL: 'SERVER_URL',
   SERVER_TYPE: 'SERVER_TYPE',
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

   getServerType(): Observable<string> {
      return this.get(KEYS.SERVER_TYPE);
   }

   saveServerType(newServerType): Observable<string> {
      return this.upsert(KEYS.SERVER_TYPE, newServerType);
   }

   getServerUrl(): Observable<string> {
      return this.get(KEYS.SERVER_URL);
   }

   saveServerUrl(newServerUrl): Observable<string> {
      return this.upsert(KEYS.SERVER_URL, newServerUrl);
   }

   getServerUser(): Observable<string> {
      return this.get(KEYS.SERVER_USER);
   }

   saveServerUser(user): Observable<string> {
      return this.upsert(KEYS.SERVER_USER, user);
   }

   private get(key): Observable<string> {
      return SettingsService.settingValue(this.settingDb.findById(key));
   }

   private upsert(key, value) {
      return SettingsService.settingValue(
         this.settingDb.upsert(new Setting(key, value))
      );
   }
}

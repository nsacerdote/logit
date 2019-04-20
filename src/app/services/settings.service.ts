import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

/**
 * This service is responsible for providing a way to access the settings configured in the settings screen
 */
@Injectable()
export class SettingsService {

   constructor() {}

   getJiraUrl(): Observable<string> {
      return of('http://admin:admin@localhost:2990/jira');
   }

}

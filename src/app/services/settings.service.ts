import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

/**
 * This service is responsible for providing a way to access the settings configured in the settings screen
 */
@Injectable()
export class SettingsService {
   constructor() {}

   getJiraSettings(): Observable<{url: string, username: string, password: string}> {
      return of({
         url : 'https://jira.edataconsulting.es',
         username : 'username_goes_here',
         password : 'password_goes_here'
      });
   }

}

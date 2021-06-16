import { Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { Worklog } from '../models/worklog.model';
import { Issue } from '../models/issue.model';
import { UserInfo } from '../models/user-info.model';
import { Server } from './server.interface';
import axios from 'axios';
import { ElectronService } from './electron.service';

/**
 * This service is responsible for contacting jira rest api (login, get autocomplete list, send workLogs, ...)
 */
@Injectable({
   providedIn: 'root'
})
export class YouTrackService implements Server {
   private axios: typeof axios;

   constructor(electronService: ElectronService) {
      this.axios = electronService.remote.require('axios');
   }

   sendWorkLogs(workLogs: Worklog[]): Observable<Worklog[]> {
      return of(workLogs);
   }

   searchIssues(text: string): Observable<Issue[]> {
      return of([new Issue('DUMMY-1', 'Hardcoded issue')]);
   }

   deleteWorkLog(workLog: Worklog) {
      return of('ok');
   }

   checkAndSaveCredentials(username, password): Observable<UserInfo> {
      return of({
         displayName: 'Dummy User',
         avatarUrl:
            'https://www.gravatar.com/avatar/00000000000000000000000000000000'
      });
   }

   clearCredentials() {
      return of('ok');
   }

   getImage(url: string) {
      return from(
         this.axios.get(url, {
            responseType: 'arraybuffer'
         })
      ).pipe(
         map(response => {
            const image = btoa(
               new Uint8Array(response.data).reduce(
                  (data, byte) => data + String.fromCharCode(byte),
                  ''
               )
            );
            return `data:${response.headers[
               'content-type'
            ].toLowerCase()};base64,${image}`;
         })
      );
   }
}

import { Injectable } from '@angular/core';
import { combineLatest, concat, from, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Worklog } from '../models/worklog.model';
import { Issue } from '../models/issue.model';
import { UserInfo } from '../models/user-info.model';
import { Server } from './server.interface';
import axios from 'axios';
import { ElectronService } from './electron.service';
import { SettingsService } from './settings.service';
import { get, unescape } from 'lodash-es';

/**
 * This service is responsible for contacting jira rest api (login, get autocomplete list, send workLogs, ...)
 */
@Injectable({
   providedIn: 'root'
})
export class YouTrackService implements Server {
   constructor(
      electronService: ElectronService,
      private settingsService: SettingsService
   ) {
      this.axios = electronService.remote.require('axios');
      this.settingsService
         .getServerUrl()
         .pipe(tap(jiraUrl => (this.serverUrl = `${jiraUrl}`)))
         .subscribe();
   }

   private get apiUrl() {
      return `${this.serverUrl}/youtrack/api`;
   }
   private axios: typeof axios;
   private serverUrl: string;
   private credentials: {
      username: string;
      password: string;
   } = null;

   private static buildWorkLogBody(workLog: Worklog) {
      return {
         text: workLog.description,
         date: workLog.getStartTimeAsMoment().valueOf(),
         duration: {
            minutes: workLog.getWorkedDuration().asMinutes()
         }
      };
   }

   private static toIssue(r: { idReadable; summary }) {
      return new Issue(r.idReadable, r.summary);
   }

   sendWorkLogs(workLogs: Worklog[]): Observable<Worklog[]> {
      return combineLatest(workLogs.map(w => this.sendWorkLog(w)));
   }

   private sendWorkLog(workLog: Worklog): Observable<Worklog> {
      if (workLog.isSent()) {
         return of(workLog);
      }

      return concat(
         setAsSending(),
         this.apiSendWorklog(workLog).pipe(
            map(result => setAsSent(result)),
            catchError(err => setAsError(err))
         )
      );

      function setAsSending() {
         workLog.setAsSending();
         return of(workLog);
      }

      function setAsSent(result) {
         workLog.setAsSent(result.id);
         return workLog;
      }

      function setAsError(err) {
         console.error(err.response.data);
         const errorMessage =
            get(err.response, 'data.error_description') ||
            get(err.response, 'data.error') ||
            'Unknown error';
         workLog.setAsError(unescape(errorMessage));
         return of(workLog);
      }
   }

   private apiSendWorklog(worklog: Worklog) {
      return from(
         this.axios.post(
            `${this.apiUrl}/issues/${worklog.issue.key}/timeTracking/workItems`,
            YouTrackService.buildWorkLogBody(worklog),
            this.authHeaders()
         )
      ).pipe(map(r => r.data));
   }

   searchIssues(text: string): Observable<Issue[]> {
      return this.apiSearch(text).pipe(
         map(results => results.map(r => YouTrackService.toIssue(r)))
      );
   }

   private apiSearch(text: string): Observable<Array<{ idReadable; summary }>> {
      return from(
         this.axios.get<Array<{ idReadable; summary }>>(
            `${this.apiUrl}/issues`,
            {
               ...this.authHeaders(),
               params: { query: text, fields: 'idReadable,summary' }
            }
         )
      ).pipe(map(r => r.data));
   }

   deleteWorkLog(workLog: Worklog) {
      return from(
         this.axios.delete(
            `${this.apiUrl}/issues/${workLog.issue.key}/timeTracking/workItems/${workLog.id}`,
            this.authHeaders()
         )
      );
   }

   checkAndSaveCredentials(username, password): Observable<UserInfo> {
      return this.credentialsCheck(username, password).pipe(
         tap(response => this.checkResponse(response)),
         tap(() => this.saveCredentials(username, password)),
         map(result => this.toUserInfo(result))
      );
   }

   private credentialsCheck(username, password): Observable<YoutrackUserInfo> {
      return from(
         this.axios.get<YoutrackUserInfo>(`${this.apiUrl}/users/me`, {
            ...this.authHeaders({ username, password }),
            params: { fields: 'name,avatarUrl,guest' }
         })
      ).pipe(map(r => r.data));
   }

   private checkResponse(response: YoutrackUserInfo) {
      if (response.guest) {
         throw { response: { status: 401 } };
      }
   }

   private saveCredentials(username, password) {
      this.credentials = { username, password };
   }

   private toUserInfo(input: YoutrackUserInfo): UserInfo {
      return {
         displayName: input.name,
         avatarUrl: input.avatarUrl
      };
   }

   clearCredentials() {
      this.credentials = null;
   }

   getImage(url: string) {
      return of(this.serverUrl + url);
   }

   private authHeaders(credentials?) {
      return { auth: credentials || this.credentials };
   }
}

interface YoutrackUserInfo {
   name: string;
   avatarUrl: string;
   guest: boolean;
}

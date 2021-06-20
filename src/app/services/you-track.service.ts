import { Injectable } from '@angular/core';
import { combineLatest, from, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Worklog } from '../models/worklog.model';
import { Issue } from '../models/issue.model';
import { UserInfo } from '../models/user-info.model';
import { Server } from './server.interface';
import axios, { AxiosResponse } from 'axios';
import { ElectronService } from './electron.service';
import { SettingsService } from './settings.service';

/**
 * This service is responsible for contacting jira rest api (login, get autocomplete list, send workLogs, ...)
 */
@Injectable({
   providedIn: 'root'
})
export class YouTrackService implements Server {
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

   constructor(
      electronService: ElectronService,
      private settingsService: SettingsService
   ) {
      this.axios = electronService.remote.require('axios');
      this.settingsService
         .getJiraUrl()
         .pipe(tap(jiraUrl => (this.serverUrl = `${jiraUrl}`)))
         .subscribe();
   }

   sendWorkLogs(workLogs: Worklog[]): Observable<Worklog[]> {
      return combineLatest(workLogs.map(w => this.sendWorklog(w)));
   }

   sendWorklog(worklog: Worklog): Observable<Worklog> {
      if (worklog.isSent()) {
         return of(worklog);
      }
      worklog.setAsSending();
      return from(
         this.axios.post(
            `${this.apiUrl}/issues/${worklog.issue.key}/timeTracking/workItems`,
            YouTrackService.buildWorkLogBody(worklog),
            this.authHeaders()
         )
      ).pipe(
         map(result => setAsSent(result)),
         catchError(err => setAsError(err))
      );

      function setAsSent(result: AxiosResponse<any>) {
         worklog.setAsSent(result.data.id);
         return worklog;
      }

      function setAsError(err: any) {
         console.error(err);
         worklog.setAsError('whatever!');
         return of(worklog);
      }
   }

   searchIssues(text: string): Observable<Issue[]> {
      return from(
         this.axios.get(`${this.apiUrl}/issues`, {
            ...this.authHeaders(),
            params: { query: text, fields: 'idReadable,summary' }
         })
      ).pipe(
         map(response =>
            response.data.map(
               (youtrackIssue: any) =>
                  new Issue(youtrackIssue.idReadable, youtrackIssue.summary)
            )
         )
      );
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
      return from(
         this.axios.get<YoutrackUserInfo>(`${this.apiUrl}/users/me`, {
            ...this.authHeaders({ username, password }),
            params: { fields: 'name,avatarUrl' }
         })
      ).pipe(
         tap(() => (this.credentials = { username, password })),
         map(response => ({
            displayName: response.data.name,
            avatarUrl: response.data.avatarUrl
         }))
      );
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

   private get apiUrl() {
      return `${this.serverUrl}/youtrack/api`;
   }
}

interface YoutrackUserInfo {
   name: string;
   avatarUrl: string;
}

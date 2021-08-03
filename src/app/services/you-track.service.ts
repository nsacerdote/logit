import { Injectable } from '@angular/core';
import { combineLatest, from, Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import { Worklog } from '../models/worklog.model';
import { Issue } from '../models/issue.model';
import { UserInfo } from '../models/user-info.model';
import axios, { AxiosError } from 'axios';
import { ElectronService } from './electron.service';
import { SettingsService } from './settings.service';
import { AbstractServerService } from './abstract-server.service';
import { get } from 'lodash-es';

/**
 * This service is responsible for contacting jira rest api (login, get autocomplete list, send workLogs, ...)
 */
@Injectable({
   providedIn: 'root'
})
export class YouTrackService extends AbstractServerService {
   constructor(
      electronService: ElectronService,
      private settingsService: SettingsService
   ) {
      super();
      this.axios = electronService.remote.require('axios');
   }

   private axios: typeof axios;
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

   protected apiSendWorklog(worklog: Worklog) {
      return this.apiUrl$.pipe(
         switchMap(apiUrl =>
            from(
               this.axios.post(
                  `${apiUrl}/issues/${worklog.issue.key}/timeTracking/workItems`,
                  YouTrackService.buildWorkLogBody(worklog),
                  this.authHeaders()
               )
            )
         ),
         map(r => r.data)
      );
   }

   searchIssues(text: string): Observable<Issue[]> {
      return this.apiSearch(text).pipe(
         map(results => results.map(r => YouTrackService.toIssue(r)))
      );
   }

   private apiSearch(text: string): Observable<Array<{ idReadable; summary }>> {
      return this.apiUrl$.pipe(
         switchMap(apiUrl =>
            from(
               this.axios.get<Array<{ idReadable; summary }>>(
                  `${apiUrl}/issues`,
                  {
                     ...this.authHeaders(),
                     params: { query: text, fields: 'idReadable,summary' }
                  }
               )
            )
         ),
         map(r => r.data)
      );
   }

   deleteWorkLog(workLog: Worklog) {
      return this.apiUrl$.pipe(
         switchMap(apiUrl =>
            from(
               this.axios.delete(
                  `${apiUrl}/issues/${workLog.issue.key}/timeTracking/workItems/${workLog.id}`,
                  this.authHeaders()
               )
            )
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
      return this.apiUrl$.pipe(
         switchMap(apiUrl =>
            from(
               this.axios.get<YoutrackUserInfo>(`${apiUrl}/users/me`, {
                  ...this.authHeaders({ username, password }),
                  params: { fields: 'name,avatarUrl,guest' }
               })
            )
         ),
         map(r => r.data)
      );
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
      return this.serverUrl$.pipe(map(serverUrl => serverUrl + url));
   }

   private authHeaders(credentials?) {
      return { auth: credentials || this.credentials };
   }

   protected getErrorMessage(err: AxiosError): string {
      return (
         get(err.response, 'data.error_description') ||
         get(err.response, 'data.error') ||
         'Unknown error, check server URL and internet connectivity'
      );
   }

   private get serverUrl$(): Observable<string> {
      return this.settingsService.getServerUrl();
   }

   private get apiUrl$(): Observable<string> {
      return this.serverUrl$.pipe(
         map(serverUrl => `${serverUrl}/youtrack/api`)
      );
   }
}

interface YoutrackUserInfo {
   name: string;
   avatarUrl: string;
   guest: boolean;
}

import axios from 'axios';
import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { ElectronService } from './electron.service';
import { SettingsService } from './settings.service';
import { Issue } from '../models/issue.model';
import { UserInfo } from '../models/user-info.model';

/**
 * This service is responsible for contacting jira rest api (login, get autocomplete list, send worklogs, ...)
 */
@Injectable()
export class JiraApiService {
   private axios: typeof axios;
   private apiUrl: string;
   private credentials: {
      username: string;
      password: string;
   } = null;

   constructor(
      electronService: ElectronService,
      private settingsService: SettingsService
   ) {
      this.axios = electronService.remote.require('axios');
      this.settingsService
         .getJiraUrl()
         .pipe(tap(jiraUrl => (this.apiUrl = `${jiraUrl}/rest/api/latest`)))
         .subscribe();
   }

   private static getJql(text: string): string {
      if (text) {
         return `(status != "Closed" AND status != "Resolved" AND text~"${text}") OR key=${text}`;
      } else {
         return '';
      }
   }

   sendWorklog(issueKey: string, worklog: JiraWorklogModel) {
      return from(
         this.axios.post(
            `${this.apiUrl}/issue/${issueKey}/worklog`,
            worklog,
            this.authHeaders()
         )
      ).pipe(map(response => response.data));
   }

   searchIssues(text: string): Observable<Issue[]> {
      return from(
         this.axios.get(`${this.apiUrl}/search`, {
            ...this.authHeaders(),
            params: {
               jql: JiraApiService.getJql(text),
               validateQuery: false
            }
         })
      ).pipe(
         map(response =>
            response.data.issues.map(
               (jiraIssue: any) =>
                  new Issue(jiraIssue.key, jiraIssue.fields.summary)
            )
         )
      );
   }

   deleteWorklog(issueKey, worklogId) {
      return from(
         this.axios.delete(
            `${this.apiUrl}/issue/${issueKey}/worklog/${worklogId}`,
            this.authHeaders()
         )
      );
   }

   checkAndSaveCredentials(username, password): Observable<UserInfo> {
      return from(
         this.axios.get<UserInfo>(`${this.apiUrl}/myself`, {
            auth: { username, password }
         })
      ).pipe(
         tap(() => (this.credentials = { username, password })),
         map(response => response.data)
      );
   }

   clearJiraCredentials() {
      this.credentials = null;
   }

   private authHeaders() {
      return { auth: this.credentials };
   }

   getImage(url: string) {
      return from(
         this.axios.get(url, {
            responseType: 'arraybuffer',
            ...this.authHeaders()
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

interface JiraWorklogModel {
   comment: string;
   started: string;
   timeSpentSeconds: number;
}

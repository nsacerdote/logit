import axios from 'axios';
import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { ElectronService } from './electron.service';
import { SettingsService } from './settings.service';
import { Issue } from '../models/issue.model';
import { UserInfo } from '../models/user-info.model';
import { WorkLogItem } from './remote-server.interface';

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

   private static getJql(query: string): string {
      if (!query) {
         return '';
      }
      query = query.replace(/"/g, '\\"');
      if (this.isIssueKey(query)) {
         return `key="${query}" OR text~"${query}"`;
      }
      const [firstWord, ...rest] = query.split(' ');
      let projectPart = '';
      if (this.isProjectKey(firstWord)) {
         projectPart = `AND project="${firstWord}"`;
         query = rest.join(' ');
      }
      const queryPart = query ? `AND text~"${query}"` : '';
      return `status != "Closed" AND status != "Resolved" ${queryPart} ${projectPart}`;
   }

   private static isIssueKey(s: string): boolean {
      return /^[A-Z][A-Z0-9]{1,9}-[0-9]+$/.test(s);
   }

   private static isProjectKey(s: string): boolean {
      return /^[A-Z][A-Z0-9]{1,9}$/.test(s);
   }

   sendWorkLog(issueKey: string, workLog: WorkLogItem) {
      return from(
         this.axios.post(
            `${this.apiUrl}/issue/${issueKey}/worklog`,
            workLog,
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

   deleteWorkLog(issueKey, workLogId) {
      return from(
         this.axios.delete(
            `${this.apiUrl}/issue/${issueKey}/worklog/${workLogId}`,
            this.authHeaders()
         )
      );
   }

   checkAndSaveCredentials(username, password): Observable<UserInfo> {
      return from(
         this.axios.get<JiraUserInfo>(`${this.apiUrl}/myself`, {
            auth: { username, password }
         })
      ).pipe(
         tap(() => (this.credentials = { username, password })),
         map(response => ({
            displayName: response.data.displayName,
            avatarUrl: response.data.avatarUrls['48x48']
         }))
      );
   }

   clearCredentials() {
      this.credentials = null;
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

   private authHeaders() {
      return { auth: this.credentials };
   }
}

interface JiraUserInfo {
   displayName: string;
   avatarUrls: {
      '48x48': string;
   };
}

import * as _ from 'lodash';
import axios from 'axios';
import { Injectable } from '@angular/core';
import { combineLatest, concat, from, Observable, of } from 'rxjs';
import { catchError, concatMap, map, tap } from 'rxjs/operators';

import { Worklog } from '../models/worklog.model';
import { ElectronService } from './electron.service';
import { SettingsService } from './settings.service';
import { Issue } from '../models/issue.model';
import { UserInfo } from '../models/user-info.model';
import { JiraCredentialsService } from './jira-credentials.service';

/**
 * This service is responsible for contacting jira rest api (login, get autocomplete list, send worklogs, ...)
 */
@Injectable()
export class JiraApiService {
   private axios: typeof axios;
   private apiUrl: string;

   constructor(
      electronService: ElectronService,
      private settingsService: SettingsService,
      private jiraCredentialsService: JiraCredentialsService
   ) {
      this.axios = electronService.remote.require('axios');
      this.settingsService
         .getJiraUrl()
         .pipe(tap(jiraUrl => (this.apiUrl = `${jiraUrl}/rest/api/latest`)))
         .subscribe();
   }

   private static buildWorklogBody(worklog: Worklog) {
      return {
         comment: worklog.description,
         started: worklog
            .getStartTimeAsMoment()
            .format('YYYY-MM-DDTHH:mm:ss.SSSZZ'),
         timeSpentSeconds: worklog.getWorkedDuration().asSeconds()
      };
   }

   private static getJql(text: string): string {
      if (text) {
         return `(status != "Closed" AND status != "Resolved" AND text~"${text}") OR key=${text}`;
      } else {
         return '';
      }
   }

   sendWorklogs(worklogs: Worklog[]): Observable<Worklog[]> {
      const groupedWorklogs = _.groupBy(worklogs, 'issue.key');
      return combineLatest(
         _.map(groupedWorklogs, gW => this.sendWorklogsSequentially(gW))
      ).pipe(map(groupedResults => _.flatten(groupedResults)));
   }

   private sendWorklogsSequentially(worklogs: Worklog[]) {
      return from(worklogs).pipe(
         concatMap(w => this.sendWorklog(w)),
         map(() => worklogs)
      );
   }

   private sendWorklog(worklog: Worklog) {
      if (worklog.isSent()) {
         return of(worklog);
      }

      return concat(
         setAsSending(),
         this.sendToJira(worklog).pipe(
            map(result => setAsSent(result)),
            catchError(err => setAsError(err))
         )
      );

      function setAsSending() {
         worklog.setAsSending();
         return of(worklog);
      }

      function setAsSent(result) {
         worklog.setAsSent(result.id);
         return worklog;
      }

      function setAsError(err) {
         console.error(err.response.data);
         const errorMessage = _.get(
            err,
            'response.data.errorMessages[0]',
            'Unknown error'
         );
         worklog.setAsError(errorMessage);
         return of(worklog);
      }
   }

   private sendToJira(worklog: Worklog) {
      return from(
         this.axios.post(
            `${this.apiUrl}/issue/${worklog.issue.key}/worklog`,
            JiraApiService.buildWorklogBody(worklog),
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

   deleteWorklog(worklog: Worklog) {
      return from(
         this.axios.delete(
            `${this.apiUrl}/issue/${worklog.issue.key}/worklog/${worklog.id}`,
            this.authHeaders()
         )
      );
   }

   checkCredentials(username, password): Observable<UserInfo> {
      return from(
         this.axios.get<UserInfo>(`${this.apiUrl}/myself`, {
            auth: { username, password }
         })
      ).pipe(map(response => response.data));
   }

   private authHeaders() {
      return { auth: this.jiraCredentialsService.getJiraCredentials() };
   }
}

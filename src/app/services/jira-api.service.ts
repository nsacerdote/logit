import * as _ from 'lodash';
import axios from 'axios';
import { Injectable } from '@angular/core';
import { combineLatest, concat, from, Observable, of } from 'rxjs';
import { catchError, concatMap, map, switchMap } from 'rxjs/operators';

import { Worklog } from '../models/worklog.model';
import { ElectronService } from './electron.service';
import { SettingsService } from './settings.service';
import { Issue } from '../models/issue.model';

/**
 * This service is responsible for contacting jira rest api (login, get autocomplete list, send worklogs, ...)
 */
@Injectable()
export class JiraApiService {
   constructor(
      electronService: ElectronService,
      private settingsService: SettingsService
   ) {
      this.axios = electronService.remote.require('axios');
   }
   private axios: typeof axios;

   private static buildWorklogBody(worklog: Worklog) {
      return {
         comment: worklog.description,
         started: worklog
            .getStartTimeAsMoment()
            .format('YYYY-MM-DDTHH:mm:ss.SSSZZ'),
         timeSpentSeconds: worklog.getWorkedDuration().asSeconds()
      };
   }

   private static authHeaders(jiraSettings) {
      return {
         auth: {
            username: jiraSettings.username,
            password: jiraSettings.password
         }
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
            map(() => setAsSent()),
            catchError(err => setAsError(err))
         )
      );

      function setAsSending() {
         worklog.setAsSending();
         return of(worklog);
      }

      function setAsSent() {
         worklog.setAsSent();
         return worklog;
      }

      function setAsError(err) {
         console.error(JSON.stringify(err));
         worklog.setAsError('unknown error');
         return of(worklog);
      }
   }

   private sendToJira(worklog: Worklog) {
      return this.settingsService
         .getJiraSettings()
         .pipe(
            switchMap(jiraSettings =>
               from(
                  this.axios.post(
                     `${jiraSettings.url}/rest/api/latest/issue/${worklog.issue.key}/worklog`,
                     JiraApiService.buildWorklogBody(worklog),
                     JiraApiService.authHeaders(jiraSettings)
                  )
               )
            )
         );
   }

   searchIssues(text: string): Observable<Issue[]> {
      return this.settingsService.getJiraSettings().pipe(
         switchMap(jiraSettings =>
            from(
               this.axios.get(`${jiraSettings.url}/rest/api/latest/search`, {
                  ...JiraApiService.authHeaders(jiraSettings),
                  params: {
                     jql: JiraApiService.getJql(text),
                     validateQuery: false
                  }
               })
            )
         ),
         map(response =>
            response.data.issues.map(
               (jiraIssue: any) =>
                  new Issue(jiraIssue.key, jiraIssue.fields.summary)
            )
         )
      );
   }
}

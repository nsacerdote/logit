import axios from 'axios';
import { Injectable } from '@angular/core';
import { combineLatest, concat, from, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

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

   private static getJql(text: string): string {
      if (text) {
         return `?jql=text~"${text}"`;
      } else {
         return '';
      }
   }

   sendWorklogs(worklogs: Worklog[]): Observable<Worklog[]> {
      return this.settingsService
         .getJiraUrl()
         .pipe(
            switchMap(jiraUrl =>
               combineLatest(worklogs.map(w => this.sendWorklog(jiraUrl, w)))
            )
         );
   }

   private sendWorklog(jiraUrl: string, worklog: Worklog) {
      if (worklog.isSent()) {
         return of(worklog);
      }

      return concat(
         setAsSending(),
         this.sendToJira(jiraUrl, worklog).pipe(
            map(() => setAsSent()),
            catchError(err => setAsError(err))
         )
      );

      function setAsSending() {
         worklog.setAsSending();;
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

   private sendToJira(jiraUrl: string, worklog: Worklog) {
      return from(
         this.axios.post(
            `${jiraUrl}/rest/api/latest/issue/${worklog.issue.key}/worklog`,
            JiraApiService.buildWorklogBody(worklog)
         )
      );
   }

   searchIssues(text: string): Observable<Issue[]> {
      const jql = JiraApiService.getJql(text);
      return this.settingsService.getJiraUrl().pipe(
         switchMap(jiraUrl =>
            from(this.axios.get(`${jiraUrl}/rest/api/latest/search${jql}`))
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

import axios from 'axios';
import { Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { delay, map, switchMap } from 'rxjs/operators';

import { Worklog } from '../models/worklog.model';
import { ElectronService } from './electron.service';
import { SettingsService } from './settings.service';
import { Issue } from '../models/issue.model';

/**
 * This service is responsible for contacting jira rest api (login, get autocomplete list, send worklogs, ...)
 */
@Injectable()
export class JiraApiService {
   private axios: typeof axios;

   constructor(
      electronService: ElectronService,
      private settingsService: SettingsService
   ) {
      this.axios = electronService.remote.require('axios');
   }

   sendWorklogs(worklogs: Worklog[]) {
      return of(1).pipe(delay(2500));
   }

   searchIssues(text: string): Observable<Issue[]> {
      const jql = this.getJql(text);
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

   private getJql(text: string): string {
      if (text) {
         return `?jql=text~"${text}"`;
      } else {
         return '';
      }
   }
}

import * as _ from 'lodash';
import { Injectable } from '@angular/core';
import { combineLatest, concat, from, Observable, of } from 'rxjs';
import { catchError, concatMap, map } from 'rxjs/operators';

import { Worklog } from '../models/worklog.model';
import { Issue } from '../models/issue.model';
import { UserInfo } from '../models/user-info.model';
import { JiraApiService } from './jira-api.service';

/**
 * This service is responsible for contacting jira rest api (login, get autocomplete list, send worklogs, ...)
 */
@Injectable()
export class JiraService {
   constructor(private jiraApiService: JiraApiService) {}

   private static buildWorklogBody(worklog: Worklog) {
      return {
         comment: worklog.description,
         started: worklog
            .getStartTimeAsMoment()
            .format('YYYY-MM-DDTHH:mm:ss.SSSZZ'),
         timeSpentSeconds: worklog.getWorkedDuration().asSeconds()
      };
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
         this.jiraApiService
            .sendWorklog(
               worklog.issue.key,
               JiraService.buildWorklogBody(worklog)
            )
            .pipe(
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

   searchIssues(text: string): Observable<Issue[]> {
      return this.jiraApiService.searchIssues(text);
   }

   deleteWorklog(worklog: Worklog) {
      return this.jiraApiService.deleteWorklog(worklog.issue.key, worklog.id);
   }

   checkAndSaveCredentials(username, password): Observable<UserInfo> {
      return this.jiraApiService.checkAndSaveCredentials(username, password);
   }

   clearJiraCredentials() {
      this.jiraApiService.clearJiraCredentials();
   }

   getImage(url: string) {
      return this.jiraApiService.getImage(url);
   }
}

import { Injectable } from '@angular/core';
import { combineLatest, concat, from, Observable, of } from 'rxjs';
import { catchError, concatMap, map } from 'rxjs/operators';

import { Worklog } from '../models/worklog.model';
import { Issue } from '../models/issue.model';
import { UserInfo } from '../models/user-info.model';
import { JiraApiService } from './jira-api.service';
import { flatten, get, groupBy, map as lodashMap } from 'lodash-es';
import { Server } from './server.interface';

/**
 * This service is responsible for contacting jira rest api (login, get autocomplete list, send workLogs, ...)
 */
@Injectable({
   providedIn: 'root'
})
export class JiraService implements Server {
   constructor(private jiraApiService: JiraApiService) {}

   private static buildWorkLogBody(workLog: Worklog) {
      return {
         comment: workLog.description,
         started: workLog
            .getStartTimeAsMoment()
            .format('YYYY-MM-DDTHH:mm:ss.SSSZZ'),
         timeSpentSeconds: workLog.getWorkedDuration().asSeconds()
      };
   }

   sendWorkLogs(workLogs: Worklog[]): Observable<Worklog[]> {
      const groupedWorkLogs = groupBy(workLogs, 'issue.key');
      return combineLatest(
         lodashMap(groupedWorkLogs, gW => this.sendWorkLogsSequentially(gW))
      ).pipe(map(groupedResults => flatten(groupedResults)));
   }

   private sendWorkLogsSequentially(workLogs: Worklog[]) {
      return from(workLogs).pipe(
         concatMap(w => this.sendWorkLog(w)),
         map(() => workLogs)
      );
   }

   private sendWorkLog(workLog: Worklog) {
      if (workLog.isSent()) {
         return of(workLog);
      }

      return concat(
         setAsSending(),
         this.jiraApiService
            .sendWorkLog(
               workLog.issue.key,
               JiraService.buildWorkLogBody(workLog)
            )
            .pipe(
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
         const errorMessage = get(
            err,
            'response.data.errorMessages[0]',
            'Unknown error'
         );
         workLog.setAsError(errorMessage);
         return of(workLog);
      }
   }

   searchIssues(text: string): Observable<Issue[]> {
      return this.jiraApiService.searchIssues(text);
   }

   deleteWorkLog(workLog: Worklog) {
      return this.jiraApiService.deleteWorkLog(workLog.issue.key, workLog.id);
   }

   checkAndSaveCredentials(username, password): Observable<UserInfo> {
      return this.jiraApiService.checkAndSaveCredentials(username, password);
   }

   clearCredentials() {
      this.jiraApiService.clearCredentials();
   }

   getImage(url: string) {
      return this.jiraApiService.getImage(url);
   }
}

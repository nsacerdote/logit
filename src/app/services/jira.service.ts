import { Injectable } from '@angular/core';
import { combineLatest, from, Observable } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';

import { Worklog } from '../models/worklog.model';
import { Issue } from '../models/issue.model';
import { UserInfo } from '../models/user-info.model';
import { JiraApiService } from './jira-api.service';
import { flatten, get, groupBy, map as lodashMap } from 'lodash-es';
import { AbstractServerService } from './abstract-server.service';
import { AxiosError } from 'axios';

/**
 * This service is responsible for contacting jira rest api (login, get autocomplete list, send workLogs, ...)
 */
@Injectable({
   providedIn: 'root'
})
export class JiraService extends AbstractServerService {
   constructor(private jiraApiService: JiraApiService) {
      super();
   }

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

   protected apiSendWorklog(worklog: Worklog): Observable<any> {
      return this.jiraApiService.sendWorkLog(
         worklog.issue.key,
         JiraService.buildWorkLogBody(worklog)
      );
   }

   protected getErrorMessage(err: AxiosError): string {
      return get(
         err,
         'response.data.errorMessages[0]',
         'Unknown error, check server URL and internet connectivity'
      );
   }
}

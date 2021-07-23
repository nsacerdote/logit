import { concat, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { Worklog } from '../models/worklog.model';
import { Issue } from '../models/issue.model';
import { UserInfo } from '../models/user-info.model';
import { Server } from './server.interface';
import { AxiosError } from 'axios';

export abstract class AbstractServerService implements Server {
   abstract sendWorkLogs(workLogs: Worklog[]): Observable<Worklog[]>;

   protected sendWorkLog(workLog: Worklog) {
      if (workLog.isSent()) {
         return of(workLog);
      }

      if (!workLog.issue.key) {
         return setAsError('Issue is required');
      }

      return concat(
         setAsSending(),
         this.apiSendWorklog(workLog).pipe(
            map(result => setAsSent(result)),
            catchError(err => setAsError(this.getErrorMessage(err)))
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

      function setAsError(errorMessage) {
         workLog.setAsError(errorMessage);
         return of(workLog);
      }
   }

   protected abstract apiSendWorklog(worklog: Worklog): Observable<any>;

   protected abstract getErrorMessage(err: AxiosError): string;

   abstract searchIssues(text: string): Observable<Issue[]>;

   abstract deleteWorkLog(workLog: Worklog);

   abstract checkAndSaveCredentials(username, password): Observable<UserInfo>;

   abstract clearCredentials();

   abstract getImage(url: string);
}

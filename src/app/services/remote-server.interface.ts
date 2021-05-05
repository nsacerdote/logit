import { Worklog } from '../models/worklog.model';
import { Issue } from '../models/issue.model';
import { Observable } from 'rxjs';
import { UserInfo } from '../models/user-info.model';

export interface RemoteServer {
   checkAndSaveCredentials(username, password): Observable<UserInfo>;
   getImage(url: string);

   searchIssues(text: string): Observable<Issue[]>;
   sendWorkLogs(workLogs: Worklog[]): Observable<Worklog[]>;
   deleteWorkLog(workLog: Worklog);

   clearCredentials();
}

export interface WorkLogItem {
   started: string;
   comment: string;
   timeSpentSeconds: number;
}

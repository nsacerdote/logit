import { Injectable } from '@angular/core';
import { JiraService } from './jira.service';
import { Server } from './server.interface';
import { Observable, of } from 'rxjs';
import { UserInfo } from '../models/user-info.model';
import { Worklog } from '../models/worklog.model';
import { Issue } from '../models/issue.model';
import { switchMap, tap } from 'rxjs/operators';
import { YouTrackService } from './you-track.service';

@Injectable({
   providedIn: 'root'
})
export class ServerService implements Server {
   private server$: Observable<Server>;

   constructor(
      private jiraService: JiraService,
      private youTrackService: YouTrackService
   ) {
      this.server$ = of(youTrackService);
   }

   checkAndSaveCredentials(username, password): Observable<UserInfo> {
      return this.runSwitch<UserInfo>(server =>
         server.checkAndSaveCredentials(username, password)
      );
   }

   clearCredentials() {
      this.runTap(server => server.clearCredentials());
   }

   deleteWorkLog(workLog: Worklog): Observable<any> {
      return this.runSwitch(server => server.deleteWorkLog(workLog));
   }

   getImage(url: string): Observable<string> {
      return this.runSwitch<string>(server => server.getImage(url));
   }

   searchIssues(text: string): Observable<Issue[]> {
      return this.runSwitch<Issue[]>(server => server.searchIssues(text));
   }

   sendWorkLogs(workLogs: Worklog[]): Observable<Worklog[]> {
      return this.runSwitch<Worklog[]>(server => server.sendWorkLogs(workLogs));
   }

   private runTap<T>(runFn: (s: Server) => void) {
      return this.server$.pipe(tap(runFn));
   }

   private runSwitch<T>(runFn: (s: Server) => Observable<T>) {
      return this.server$.pipe(switchMap(runFn));
   }
}

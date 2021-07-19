import { Injectable } from '@angular/core';
import { JiraService } from './jira.service';
import { Server } from './server.interface';
import { Observable } from 'rxjs';
import { UserInfo } from '../models/user-info.model';
import { Worklog } from '../models/worklog.model';
import { Issue } from '../models/issue.model';
import { map, switchMap, tap } from 'rxjs/operators';
import { YouTrackService } from './you-track.service';
import { SettingsService } from './settings.service';

export const SERVER_TYPES = {
   JIRA: 'Jira',
   YOUTRACK: 'Youtrack'
};

@Injectable({
   providedIn: 'root'
})
export class ServerService implements Server {
   constructor(
      private settingsService: SettingsService,
      private jiraService: JiraService,
      private youTrackService: YouTrackService
   ) {}

   checkAndSaveCredentials(username, password): Observable<UserInfo> {
      return this.runSwitch<UserInfo>(server =>
         server.checkAndSaveCredentials(username, password)
      );
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

   clearCredentials() {
      this.runTap(server => server.clearCredentials()).subscribe();
   }

   private runTap<T>(runFn: (s: Server) => void) {
      return this.server$.pipe(tap(runFn));
   }

   private runSwitch<T>(runFn: (s: Server) => Observable<T>) {
      return this.server$.pipe(switchMap(runFn));
   }

   private get server$(): Observable<Server> {
      return this.settingsService
         .getServerType()
         .pipe(
            map(serverType =>
               serverType === SERVER_TYPES.JIRA
                  ? this.jiraService
                  : this.youTrackService
            )
         );
   }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { JiraApiService } from './jira-api.service';
import { tap } from 'rxjs/operators';
import { UserInfo } from '../models/user-info.model';
import { JiraCredentialsService } from './jira-credentials.service';

/**
 * This service is responsible for holding the login info and status, perform login and logout operations
 */
@Injectable()
export class LoginService {
   private userInfo = new BehaviorSubject<UserInfo>(null);

   constructor(
      private jiraApiService: JiraApiService,
      private jiraCredentialsService: JiraCredentialsService
   ) {}

   login(user, pass) {
      return this.jiraApiService.checkCredentials(user, pass).pipe(
         tap(userInfo => this.userInfo.next(userInfo)),
         tap(() => this.jiraCredentialsService.saveJiraCredentials(user, pass))
      );
   }

   logout() {
      this.userInfo.next(null);
      this.jiraCredentialsService.clearJiraCredentials();
   }

   getUserInfo() {
      return this.userInfo.asObservable();
   }

   isLoggedIn() {
      return this.userInfo.value !== null;
   }
}

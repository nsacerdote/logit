import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UserInfo } from '../models/user-info.model';
import { JiraService } from './jira.service';

/**
 * This service is responsible for holding the login info and status, perform login and logout operations
 */
@Injectable()
export class LoginService {
   private userInfo = new BehaviorSubject<UserInfo>(null);

   constructor(private jiraService: JiraService) {}

   login(user, pass) {
      return this.jiraService
         .checkAndSaveCredentials(user, pass)
         .pipe(tap(userInfo => this.userInfo.next(userInfo)));
   }

   logout() {
      this.userInfo.next(null);
      this.jiraService.clearCredentials();
   }

   getUserInfo() {
      return this.userInfo.asObservable();
   }

   isLoggedIn() {
      return this.userInfo.value !== null;
   }
}

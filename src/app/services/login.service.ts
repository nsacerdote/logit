import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { UserInfo } from '../models/user-info.model';
import { ServerService } from './server.service';
import { SettingsService } from './settings.service';

/**
 * This service is responsible for holding the login info and status, perform login and logout operations
 */
@Injectable({
   providedIn: 'root'
})
export class LoginService {
   private userInfo = new BehaviorSubject<UserInfo>(null);

   constructor(
      private serverProvider: ServerService,
      private settingsService: SettingsService
   ) {}

   public restoreLogin(): Observable<boolean> {
      return this.settingsService.getServerCredentials().pipe(
         switchMap(credentials =>
            this.login(credentials.username, credentials.password)
         ),
         map(() => true),
         catchError(err => {
            console.error('Error automatic login', err);
            this.logout();
            return of(false);
         })
      );
   }

   login(username, password) {
      return this.serverProvider
         .checkAndSaveCredentials(username, password)
         .pipe(
            tap(userInfo => this.userInfo.next(userInfo)),
            switchMap(() =>
               this.settingsService.saveServerCredentials({
                  username,
                  password
               })
            )
         );
   }

   logout() {
      this.userInfo.next(null);
      this.serverProvider.clearCredentials();
      this.settingsService
         .getServerCredentials()
         .pipe(
            switchMap(credentials =>
               this.settingsService.saveServerCredentials({
                  ...credentials,
                  password: null
               })
            )
         )
         .subscribe();
   }

   getUserInfo() {
      return this.userInfo.asObservable();
   }

   isLoggedIn() {
      return this.userInfo.value !== null;
   }
}

import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { DialogService } from '../../services/dialog.service';
import { LoginService } from '../../services/login.service';
import { UserInfo } from '../../models/user-info.model';
import { Observable } from 'rxjs';
import { JiraService } from '../../services/jira.service';
import { filter, map, switchMap } from 'rxjs/operators';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
   selector: 'app-header',
   templateUrl: './header.component.html',
   styleUrls: ['./header.component.scss'],
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit {
   userInfo$: Observable<UserInfo>;
   userImage$: Observable<SafeResourceUrl>;

   constructor(
      private dialogService: DialogService,
      private loginService: LoginService,
      private jiraService: JiraService,
      private sanitizer: DomSanitizer
   ) {}

   ngOnInit() {
      this.userInfo$ = this.loginService.getUserInfo();
      this.userImage$ = this.userInfo$.pipe(
         filter(userInfo => !!userInfo),
         map(userInfo => userInfo.avatarUrls['48x48']),
         switchMap(avatarUrl => this.jiraService.getImage(avatarUrl)),
         map(base64src =>
            this.sanitizer.bypassSecurityTrustResourceUrl(base64src)
         )
      );
   }

   openLogin() {
      this.dialogService.showLogin().subscribe();
   }

   logout() {
      this.loginService.logout();
   }
}

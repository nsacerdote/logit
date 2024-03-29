import 'reflect-metadata';
import '../polyfills';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HttpClient, HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
// NG Translate
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppMaterialModule } from './shared/app-material.module';

import { AppComponent } from './app.component';

import { HeaderComponent } from './components/header/header.component';
import { SettingsComponent } from './components/settings/settings.component';
import { WorkdayComponent } from './components/workday/workday.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { WorklogListComponent } from './components/workday/worklog-list/worklog-list.component';
import { WorklogListItemComponent } from './components/workday/worklog-list/worklog-list-item/worklog-list-item.component';
import { RemindersComponent } from './components/workday/reminders/reminders.component';
import { WorkdaySummaryComponent } from './components/workday/workday-summary/workday-summary.component';
import { WorklogStatusComponent } from './components/workday/worklog-list/worklog-status/worklog-status.component';

import { TimepickerComponent } from './shared/timepicker/timepicker.component';
import { IssueAutocompleteComponent } from './shared/issue-autocomplete/issue-autocomplete.component';

import { ConfirmationDialogComponent } from './shared/confirmation-dialog/confirmation-dialog.component';
import { LoginComponent } from './components/login/login.component';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
   return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
   declarations: [
      AppComponent,
      HeaderComponent,
      SettingsComponent,
      WorkdayComponent,
      WorklogListComponent,
      WorklogListItemComponent,
      RemindersComponent,
      WorkdaySummaryComponent,
      TimepickerComponent,
      IssueAutocompleteComponent,
      WorklogStatusComponent,
      ConfirmationDialogComponent,
      LoginComponent
   ],
   imports: [
      BrowserModule,
      BrowserAnimationsModule,
      AppMaterialModule,
      FormsModule,
      ReactiveFormsModule,
      HttpClientModule,
      AppRoutingModule,
      TranslateModule.forRoot({
         loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
         }
      })
   ],
   bootstrap: [AppComponent]
})
export class AppModule {}

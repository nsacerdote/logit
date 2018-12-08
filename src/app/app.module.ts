import 'reflect-metadata';
import '../polyfills';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HttpClientModule, HttpClient } from '@angular/common/http';


import { AppRoutingModule } from './app-routing.module';

// NG Translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { ElectronService } from './services/electron.service';

import { AppMaterialModule } from './shared/app-material.module';

import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { SettingsComponent } from './components/settings/settings.component';
import { WorkdayComponent } from './components/workday/workday.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { WorklogListComponent } from './components/workday/worklog-list/worklog-list.component';
import { WorklogListItemComponent } from './components/workday/worklog-list-item/worklog-list-item.component';
import { RemindersComponent } from './components/workday/reminders/reminders.component';
import { WorkdaySummaryComponent } from './components/workday/workday-summary/workday-summary.component';

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
    WorkdaySummaryComponent
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
        useFactory: (HttpLoaderFactory),
        deps: [HttpClient]
      }
    })
  ],
  providers: [ElectronService],
  bootstrap: [AppComponent]
})
export class AppModule { }

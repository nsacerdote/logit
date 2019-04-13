import { Injectable } from '@angular/core';
import { Worklog } from '../models/worklog.model';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';


/**
 * This service is responsible for contacting jira rest api (login, get autocomplete list, send worklogs, ...)
 */
@Injectable()
export class JiraApiService {

   constructor() {}

   sendWorklogs(worklogs: Worklog[]) {
      return of(1).pipe(delay(2500));
   }
}

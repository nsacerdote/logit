import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Issue } from '../models/issue.model';
import { JiraApiService } from './jira-api.service';


/**
 * This service is responsible for providing autocomplete/search issues capabilities
 */
@Injectable()
export class IssueAutocompleteService {

   constructor(private jiraApiService: JiraApiService) {}

   searchIssuesFromCache(searchText: string): Observable<Issue[]> {
      return of([new Issue('ABC-123', searchText.repeat(10))]).pipe(delay(100));
   }

   searchIssues(searchText: string): Observable<Issue[]> {
      return this.jiraApiService.searchIssues(searchText);
   }

}

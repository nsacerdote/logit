import { Injectable } from '@angular/core';
import { concat, Observable, of } from 'rxjs';
import { Issue } from '../models/issue.model';
import { JiraApiService } from './jira-api.service';
import { IssueCacheService } from './issue-cache.service';
import { scan, tap } from 'rxjs/operators';
import * as _ from 'lodash';

/**
 * This service is responsible for providing autocomplete/search issues capabilities
 */
@Injectable()
export class IssueAutocompleteService {
   constructor(
      private jiraApiService: JiraApiService,
      private issueCacheService: IssueCacheService
   ) {}

   search(searchText: string): Observable<Issue[]> {
      if (!searchText || searchText.length < 3) {
         return of([]);
      }

      return concat(
         this.searchIssuesFromCache(searchText),
         this.searchIssues(searchText)
      ).pipe(scan((acc, issues) => mergeIssues(issues, acc), []));

      function mergeIssues(issues: Issue[], acc: Issue[]) {
         return _.sortBy(_.unionBy(issues, acc, 'key'), 'key');
      }
   }

   private searchIssuesFromCache(searchText: string): Observable<Issue[]> {
      return this.issueCacheService.search(searchText);
   }

   private searchIssues(searchText: string): Observable<Issue[]> {
      return this.jiraApiService
         .searchIssues(searchText)
         .pipe(
            tap(issues =>
               issues.forEach(i => this.issueCacheService.save(i).subscribe())
            )
         );
   }
}

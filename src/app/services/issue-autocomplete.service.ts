import { Injectable } from '@angular/core';
import { concat, Observable, of } from 'rxjs';
import { Issue } from '../models/issue.model';
import { JiraService } from './jira.service';
import { IssueCacheService } from './issue-cache.service';
import { scan } from 'rxjs/operators';
import { sortBy, unionBy } from 'lodash-es';

/**
 * This service is responsible for providing autocomplete/search issues capabilities
 */
@Injectable()
export class IssueAutocompleteService {
   constructor(
      private jiraService: JiraService,
      private issueCacheService: IssueCacheService
   ) {}

   search(searchText: string): Observable<Issue[]> {
      return concat(
         this.searchIssuesFromCache(searchText),
         this.searchIssues(searchText)
      ).pipe(scan((acc, issues) => mergeIssues(acc, issues), []));

      function mergeIssues(acc: Issue[], issues: Issue[]) {
         return unionBy(acc, sortBy(issues, 'key'), 'key');
      }
   }

   private searchIssuesFromCache(searchText: string): Observable<Issue[]> {
      return this.issueCacheService.search(searchText);
   }

   private searchIssues(searchText: string): Observable<Issue[]> {
      if (!searchText || searchText.length < 3) {
         return of([]);
      }
      return this.jiraService.searchIssues(searchText);
   }

   issueSelected(issue: Issue) {
      this.issueCacheService.save(issue).subscribe();
   }
}

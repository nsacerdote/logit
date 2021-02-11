import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Database } from '../entity/database';
import { Issue } from '../models/issue.model';
import { escapeRegExp, take } from 'lodash-es';

@Injectable()
export class IssueCacheService {
   private issueCacheDb: Database<Issue>;

   constructor() {
      this.issueCacheDb = new Database<Issue>('issue-cache');
   }

   save(issue: Issue): Observable<Issue> {
      return this.upsert(issue).pipe(map(issueDoc => Issue.of(issueDoc)));
   }

   private upsert(issue: Issue): Observable<Issue> {
      return this.issueCacheDb.upsert(issue);
   }

   search(text: string): Observable<Issue[]> {
      return this.issueCacheDb
         .find({
            $or: [
               { description: { $regex: new RegExp(escapeRegExp(text), 'i') } },
               { key: { $regex: new RegExp(escapeRegExp(text), 'i') } }
            ]
         })
         .pipe(
            map(issues => take(issues, 50)),
            map(issues => issues.map(i => Issue.of(i)))
         );
   }
}

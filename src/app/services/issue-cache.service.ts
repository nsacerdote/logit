import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Database } from '../entity/database';
import { Issue } from '../models/issue.model';
import * as _ from 'lodash';


@Injectable()
export class IssueCacheService {

   private issueCacheDb: Database<Issue>;

   constructor() {
      this.issueCacheDb = new Database<Issue>('issue-cache');
   }

   save(issue: Issue): Observable<Issue> {
      return this.upsert(issue)
         .pipe(
            map(issueDoc => Issue.of(issueDoc))
         );
   }

   private upsert(issue: Issue): Observable<Issue> {
      return this.issueCacheDb.upsert(issue);
   }

   search(text: string): Observable<Issue[]> {
      return this.issueCacheDb.find({
         $or : [
            { description : { $regex : new RegExp(text, 'i') }},
            { key : { $regex : new RegExp(text, 'i') }}
         ]
      }).pipe(
         map(issues => _.take(issues, 50))
      );
   }
}

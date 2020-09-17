import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as moment from 'moment';

import { Workday } from '../models/workday.model';
import { Worklog } from '../models/worklog.model';
import { Database } from '../entity/database';
import { TimeUtils } from '../shared/utils/time.utils';

/**
 * This service is responsible for providing a way to access the workdays
 */
@Injectable()
export class WorkdayService {
   private workdayDb: Database<Workday>;

   constructor() {
      this.workdayDb = new Database<Workday>('workday');
   }

   save(workday: Workday): Observable<Workday> {
      return this.upsert(workday).pipe(
         map(workdayDoc => Workday.of(workdayDoc))
      );
   }

   private upsert(workday: Workday): Observable<Workday> {
      return this.workdayDb.upsert(workday);
   }

   getOrCreate(date: moment.Moment): Observable<Workday> {
      return this.get(date).pipe(
         map(workdayDoc =>
            workdayDoc ? Workday.of(workdayDoc) : this.create(date)
         )
      );
   }

   private get(date: moment.Moment): Observable<Workday> {
      return this.workdayDb.findById(TimeUtils.momentDayToString(date));
   }

   private create(date: moment.Moment) {
      return new Workday(date, [new Worklog()], '');
   }
}

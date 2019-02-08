import { Issue } from './issue.model';
import * as moment from 'moment';
import { TimeUtils } from '../shared/utils/time.utils';

export enum WorklogStatus {
   NOT_SENT = 'NOT_SENT',
   SENT = 'SENT'
}

export class Worklog {
   constructor(public startTime: string = null,
               public endTime: string = null,
               public description: string = null,
               public issue: Issue = null,
               public status: WorklogStatus = null) {
   }

   static of(raw: any): Worklog {
      return Object.assign(new Worklog(), raw);
   }

   getWorkedTime(): string {
      return TimeUtils.humanizeDuration(
         this.getWorkedDuration()
      );
   }

   getWorkedDuration(): moment.Duration {
      const start = this.getStartTimeAsMoment();
      const end = this.getEndTimeAsMoment();
      return TimeUtils.getPositiveMomentsDifferenceDuration(end, start); // end - start
   }

   getStartTimeAsMoment(): moment.Moment {
      return TimeUtils.stringToMomentTime(this.startTime);
   }

   getEndTimeAsMoment(): moment.Moment {
      return TimeUtils.stringToMomentTime(this.endTime);
   }

}

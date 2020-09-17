import { Issue } from './issue.model';
import * as moment from 'moment';
import { TimeUtils } from '../shared/utils/time.utils';

export enum WorklogStatus {
   NOT_SENT = 'NOT_SENT',
   SENDING = 'SENDING',
   SENT = 'SENT',
   ERROR = 'ERROR'
}

export class Worklog {

   public statusMessage = '';

   constructor(
      public id: string = null,
      public startTime: string = '08:00',
      public endTime: string = '',
      public description: string = '',
      public issue: Issue = new Issue(),
      public status: WorklogStatus = WorklogStatus.NOT_SENT
   ) {
      if (this.isNotSent()) {
         this.statusMessage = 'Waiting to be sent to Jira';
      }
   }

   static of(raw: any): Worklog {
      const worklog = Object.assign(new Worklog(), raw);
      worklog.issue = Issue.of(worklog.issue);
      return worklog;
   }

   getWorkedTime(): string {
      return TimeUtils.humanizeDuration(this.getWorkedDuration());
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

   getRaw(): any {
      const raw: any = Object.assign({}, this);
      raw.issue = raw.issue.getRaw();
      return raw;
   }

   isSent(): boolean {
      return this.status === WorklogStatus.SENT;
   }

   isSending(): boolean {
      return this.status === WorklogStatus.SENDING;
   }

   hasError(): boolean {
      return this.status === WorklogStatus.ERROR;
   }

   isNotSent(): boolean {
      return this.status === WorklogStatus.NOT_SENT;
   }

   setAsSent(id: string) {
      this.id = id;
      this.status = WorklogStatus.SENT;
      this.statusMessage = 'Worklog has been sent to Jira';
   }

   setAsSending() {
      this.status = WorklogStatus.SENDING;
      this.statusMessage = 'Sending worklog to Jira';
   }

   setAsError(details: string) {
      this.status = WorklogStatus.ERROR;
      this.statusMessage = details;
   }
}

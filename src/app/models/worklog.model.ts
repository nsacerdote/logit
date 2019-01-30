import { Issue } from './issue.model';

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
      // TODO: use start and endtime to calc
      return '0m';
   }
}

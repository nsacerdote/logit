import { Worklog } from './worklog.model';

export class Workday {
   constructor(public worklogs: Worklog[],
               public reminders: string) {
   }
}

import { Worklog } from './worklog.model';
import * as moment from 'moment';

export class Workday {
   constructor(public date: moment.Moment = moment(),
               public worklogs: Worklog[] = [],
               public reminders: string = '') {
   }

   static of(raw: any): Workday {
      const result = Object.assign(new Workday(), raw);
      for (let i = 0; i < result.worklogs.length; i++) {
         result.worklogs[i] = Worklog.of(result.worklogs[i]);
      }
      return result;
   }
}

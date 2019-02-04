import { Worklog } from './worklog.model';
import * as moment from 'moment';

export class Workday {
   constructor(public date: moment.Moment = moment(),
               public worklogs: Worklog[] = [],
               public reminders: string = '') {
   }

   static of(raw: any): Workday {
      return Object.assign(new Workday(), raw);
   }
}

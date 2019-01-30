import { Worklog } from './worklog.model';
import * as moment from 'moment';

export class Workday {
   constructor(public date: moment.Moment = moment(),
               public worklogs: Worklog[] = [],
               public reminders: string = '') {
   }
}

import { Worklog } from './worklog.model';
import * as moment from 'moment';
import { TimeUtils } from '../shared/utils/time.utils';
import { GenericDocEntity } from '../entity/generic-doc.entity';

export class Workday implements GenericDocEntity {
   constructor(
      public date: moment.Moment = moment(),
      public worklogs: Worklog[] = [],
      public reminders: string = ''
   ) {}

   static of(raw: any): Workday {
      const result = Object.assign(new Workday(), raw);
      if (typeof result.date === 'string') {
         result.date = TimeUtils.stringToMomentDay(result.date);
      }
      for (let i = 0; i < result.worklogs.length; i++) {
         result.worklogs[i] = Worklog.of(result.worklogs[i]);
      }
      return result;
   }

   getRaw(): any {
      const raw: any = Object.assign({}, this);
      raw.date = TimeUtils.momentDayToString(raw.date);
      raw.worklogs = raw.worklogs.map(w => w.getRaw());
      return raw;
   }

   getId(): string {
      return TimeUtils.momentDayToString(this.date);
   }
}

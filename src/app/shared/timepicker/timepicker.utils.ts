import * as moment from 'moment';

export class TimepickerUtils {

   public static roundToStep(a: number, step: number) {
      return Math.round((a) / (step)) * (step);
   }

   public static keepInPositiveRange(a: number, rangeMax: number) {
      if (a >= 0 && a < rangeMax) {
         return a;
      } else if (a < 0) {
         return this.keepInPositiveRange(a + rangeMax, rangeMax);
      } else {
         return this.keepInPositiveRange(a - rangeMax, rangeMax);
      }
   }

   public static getClosestHour(date: moment.Moment, minuteStep: number): number {
      const stringHour =  this.getRoundedTime(date, minuteStep).format('HH');
      return +stringHour;
   }

   public static getClosestMinutes(date: moment.Moment, minuteStep: number): number {
      const stringMinutes =  this.getRoundedTime(date, minuteStep).format('mm');
      return +stringMinutes;
   }

   private static getRoundedTime(date: moment.Moment, minuteStep: number): moment.Moment {
      const stepDuration = moment.duration(minuteStep, 'minutes');
      return moment(this.roundToStep(+date, +stepDuration));
   }

}

import * as moment from 'moment';

export class TimeUtils {

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

   public static momentTimeToString(m: moment.Moment): string {
      return m.format('HH:mm');
   }

   public static stringToMomentTime(stringTime: string): moment.Moment {
      return moment(stringTime, 'HH:mm');
   }

   public static momentDayToString(m: moment.Moment): string {
      return m.format('YYYY-MM-DD');
   }

   public static stringToMomentDay(stringTime: string): moment.Moment {
      return moment(stringTime, 'YYYY-MM-DD');
   }

   public static getPositiveMomentsDifferenceDuration(a: moment.Moment, b: moment.Moment): moment.Duration {
      if (a.isValid() && b.isValid() && a.isAfter(b)) {
         return moment.duration(a.diff(b));
      }
      return moment.duration(0);
   }

   public static humanizeDuration(duration: moment.Duration): string {
      const days = duration.days();
      const hours = duration.hours();
      const minutes = duration.minutes();
      let result = minutes + 'm ';
      if (hours > 0) {
         result = hours + 'h ' + result;
      }
      if (days > 0) {
         result = days + 'd ' + result;
      }
      return result;
   }

   static getPositiveDurationDifference(a: moment.Duration, b: moment.Duration): moment.Duration {
      if (a.asMilliseconds() > b.asMilliseconds()) {
         return a.subtract(b);
      }
      return moment.duration(0);
   }
}

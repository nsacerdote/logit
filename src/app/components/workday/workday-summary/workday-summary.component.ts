import {
   ChangeDetectionStrategy,
   Component,
   Input,
   OnInit
} from '@angular/core';
import * as moment from 'moment';
import { Workday } from '../../../models/workday.model';
import { Worklog } from '../../../models/worklog.model';
import { TimeUtils } from '../../../shared/utils/time.utils';

@Component({
   selector: 'app-workday-summary',
   templateUrl: './workday-summary.component.html',
   styleUrls: ['./workday-summary.component.scss'],
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkdaySummaryComponent implements OnInit {
   @Input() workHoursPerDay = 8;
   @Input() workday: Workday;

   constructor() {}

   ngOnInit() {}

   getClockInHour(): string {
      return TimeUtils.momentTimeToString(this.getClockInMoment());
   }

   private getClockInMoment(): moment.Moment {
      return moment.min(
         this.workday.worklogs
            .map(w => w.getStartTimeAsMoment())
            .filter(m => m.isValid())
      );
   }

   getClockOutHour(): string {
      return TimeUtils.momentTimeToString(this.getClockOutMoment());
   }

   private getClockOutMoment(): moment.Moment {
      return moment.max(
         this.workday.worklogs
            .map(w => w.getEndTimeAsMoment())
            .filter(m => m.isValid())
      );
   }

   getWorkedTime(): string {
      return TimeUtils.humanizeDuration(this.getTotalWorkedDuration());
   }

   private getTotalWorkedDuration(): moment.Duration {
      return this.getWorklogsDurations().reduce(
         (a, b) => a.add(b),
         moment.duration(0)
      );
   }

   private getWorklogsDurations() {
      return this.workday.worklogs.map((worklog: Worklog) =>
         worklog.getWorkedDuration()
      );
   }

   getPauseTime(): string {
      const pauseDuration = this.getPauseDuration();
      return TimeUtils.humanizeDuration(pauseDuration);
   }

   private getPauseDuration() {
      const pauseDuration = moment.duration(0);
      if (this.workday.worklogs.length > 1) {
         const worklogs = this.getSortedWorklogs();
         worklogs.reduce((previousWorklog, currentWorklog) => {
            pauseDuration.add(
               this.calcPauseDuration(previousWorklog, currentWorklog)
            );
            return currentWorklog;
         });
      }
      return pauseDuration;
   }

   private getSortedWorklogs() {
      return this.workday.worklogs
         .slice(0)
         .sort(
            (a, b) =>
               a.getStartTimeAsMoment().valueOf() -
               b.getStartTimeAsMoment().valueOf()
         );
   }

   private calcPauseDuration(prevWorklog: Worklog, currentWorklog: Worklog) {
      return TimeUtils.getPositiveMomentsDifferenceDuration(
         currentWorklog.getStartTimeAsMoment(),
         prevWorklog.getEndTimeAsMoment()
      );
   }

   getProgressBarValue(): number {
      return (
         (this.getTotalWorkedDuration().asMinutes() /
            (this.workHoursPerDay * 60)) *
         100
      );
   }

   getProgressBarClass(): string {
      if (this.getProgressBarValue() < 30) {
         return 'red';
      } else if (this.getProgressBarValue() < 60) {
         return 'yellow';
      } else {
         return 'green';
      }
   }
}

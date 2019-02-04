import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Workday } from '../../../models/workday.model';
import { el } from '@angular/platform-browser/testing/src/browser_util';

@Component({
   selector: 'app-workday-summary',
   templateUrl: './workday-summary.component.html',
   styleUrls: ['./workday-summary.component.scss'],
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkdaySummaryComponent implements OnInit {

   @Input() workday: Workday;

   constructor() {
   }

   ngOnInit() {
   }

   getProgressBarValue(): number {
      return this.workday.worklogs.length * 10;
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

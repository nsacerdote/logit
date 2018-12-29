import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
   selector: 'app-workday-summary',
   templateUrl: './workday-summary.component.html',
   styleUrls: ['./workday-summary.component.scss'],
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkdaySummaryComponent implements OnInit {

   constructor() {
   }

   ngOnInit() {
   }

}

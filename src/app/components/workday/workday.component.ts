import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Worklog, WorklogStatus } from '../../models/worklog.model';
import { Issue } from '../../models/issue.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as moment from 'moment';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Workday } from '../../models/workday.model';
import { delay, map, switchMap } from 'rxjs/operators';

@Component({
   selector: 'app-workday',
   templateUrl: './workday.component.html',
   styleUrls: ['./workday.component.scss'],
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkdayComponent implements OnInit {

   workday: Workday;
   workdayForm: FormGroup;
   selectedDate$: BehaviorSubject<moment.Moment>;

   constructor(private fb: FormBuilder,
               private cdRef: ChangeDetectorRef) { }

   ngOnInit() {
      this.selectedDate$ = new BehaviorSubject<moment.Moment>(moment());
      this.setWorkdayAndForm(new Workday());

      this.selectedDate$.pipe(
         switchMap(selectedDate => this.loadWorkday(selectedDate))
      ).subscribe(
         workday => {
            this.setWorkdayAndForm(workday)
            this.cdRef.detectChanges();
         }
      );
   }

   sendWorklogs() {
      console.log(this.workdayForm.value);
   }

   handleCalendarChange(newDate: moment.Moment) {
      this.selectedDate$.next(newDate);
   }

   private loadWorkday(date: moment.Moment): Observable<Workday> {
      return of(
         new Workday(
            date,
            [
               new Worklog('23:56', '23:58', 'aaa' + date.format('LL'), new Issue('AAA-1', 'abc'), WorklogStatus.NOT_SENT),
               new Worklog('2', '3', 'bbb' + date.format('LL'), new Issue('BBB-1', 'abc'), WorklogStatus.NOT_SENT)
            ],
            'reminder'
         )
      ).pipe(
         delay(250)
      );
   }

   private setWorkdayAndForm(workday: Workday) {
      this.workday = workday;
      this.workdayForm = this.fb.group({
         worklogs: [workday.worklogs],
         reminder: [workday.reminders]
      });
      this.workdayForm.valueChanges.subscribe(next => {
         this.workday = Workday.of(next);
      });
   }
}

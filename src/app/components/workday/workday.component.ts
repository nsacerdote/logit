import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject, concat } from 'rxjs';
import { skip, switchMap, take, tap } from 'rxjs/operators';
import * as moment from 'moment';

import { Workday } from '../../models/workday.model';
import { WorkdayService } from '../../services/workday.service';

@Component({
   selector: 'app-workday',
   templateUrl: './workday.component.html',
   styleUrls: ['./workday.component.scss'],
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkdayComponent implements OnInit {

   loadedDate: moment.Moment;
   workdayForm: FormGroup;
   selectedDate$: BehaviorSubject<moment.Moment>;

   constructor(private fb: FormBuilder,
               private cdRef: ChangeDetectorRef,
               private workdayService: WorkdayService) { }

   ngOnInit() {
      this.selectedDate$ = new BehaviorSubject<moment.Moment>(moment());
      this.loadInitialDate();
      this.subscribeToSelectedDateChanges();
   }

   private loadInitialDate() {
      this.selectedDate$.pipe(
         take(1),
         switchMap(date => this.loadDate(date))
      ).subscribe();
   }

   private subscribeToSelectedDateChanges() {
      this.selectedDate$.pipe(
         skip(1),
         switchMap(date => this.saveAndLoad(date))
      ).subscribe();
   }

   sendWorklogs() {
      console.log(this.workdayForm.value);
   }

   handleCalendarChange(newDate: moment.Moment) {
      this.selectedDate$.next(newDate);
   }

   private setWorkdayForm(workday: Workday) {
      this.workdayForm = this.fb.group({
         worklogs: [workday.worklogs],
         reminder: [workday.reminders]
      });
   }

   private saveAndLoad(date: moment.Moment) {
      return concat(
         this.save(),
         this.loadDate(date)
      );
   }

   private save() {
      return this.workdayService.save(this.getFormValueAsWorkday());
   }

   getFormValueAsWorkday(): Workday {
      const workday = Workday.of(this.workdayForm.value);
      workday.date = this.loadedDate;
      return workday;
   }

   private loadDate(date: moment.Moment) {
      return this.workdayService.getOrCreate(date).pipe(
         tap(workday => this.setLoadedWorkday(workday))
      );
   }

   private setLoadedWorkday(workday: Workday) {
      this.loadedDate = workday.date;
      this.setWorkdayForm(workday);
      this.cdRef.detectChanges();
   }
}

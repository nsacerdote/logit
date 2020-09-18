import {
   ChangeDetectionStrategy,
   ChangeDetectorRef,
   Component, OnDestroy,
   OnInit
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject, concat } from 'rxjs';
import { skip, switchMap, tap } from 'rxjs/operators';
import * as moment from 'moment';

import { Workday } from '../../models/workday.model';
import { WorkdayService } from '../../services/workday.service';
import { JiraService } from '../../services/jira.service';

@Component({
   selector: 'app-workday',
   templateUrl: './workday.component.html',
   styleUrls: ['./workday.component.scss'],
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkdayComponent implements OnInit, OnDestroy {
   loadedDate: moment.Moment;
   workdayForm: FormGroup;
   selectedDate$: BehaviorSubject<moment.Moment>;
   sendingWorklogs = false;

   constructor(
      private fb: FormBuilder,
      private cdRef: ChangeDetectorRef,
      private workdayService: WorkdayService,
      private jiraService: JiraService
   ) {}

   ngOnInit() {
      const initialDate = moment();
      this.selectedDate$ = new BehaviorSubject<moment.Moment>(initialDate);
      this.loadDate(initialDate).subscribe();
      this.subscribeToSelectedDate();
   }

   private loadDate(date: moment.Moment) {
      return this.workdayService
         .getOrCreate(date)
         .pipe(tap(workday => this.setLoadedWorkday(workday)));
   }

   private subscribeToSelectedDate() {
      this.selectedDate$
         .pipe(
            skip(1),
            switchMap(date => this.saveAndLoad(date))
         )
         .subscribe();
   }

   private setLoadedWorkday(workday: Workday) {
      this.loadedDate = workday.date;
      this.setWorkdayForm(workday);
      this.cdRef.detectChanges();
   }

   private saveAndLoad(date: moment.Moment) {
      return concat(this.save(), this.loadDate(date));
   }

   private setWorkdayForm(workday: Workday) {
      this.workdayForm = this.fb.group({
         worklogs: [workday.worklogs],
         reminder: [workday.reminders]
      });
   }

   private save() {
      return this.workdayService.save(this.getFormValueAsWorkday());
   }

   getFormValueAsWorkday(): Workday {
      const workday = Workday.of(this.workdayForm.value);
      workday.date = this.loadedDate;
      return workday;
   }

   handleCalendarChange(newDate: moment.Moment) {
      if (!this.sendingWorklogs) {
         this.selectedDate$.next(newDate);
      }
   }

   sendWorklogs() {
      this.sendingWorklogs = true;
      this.sendWorklogsToJira().subscribe(
         worklogs => {
            this.workdayForm.patchValue({
               worklogs: worklogs
            });
         },
         () => {},
         () => {
            this.sendingWorklogs = false;
            this.cdRef.detectChanges();
         }
      );
   }

   sendWorklogsToJira() {
      return this.jiraService.sendWorklogs(
         this.getFormValueAsWorkday().worklogs
      );
   }

   ngOnDestroy(): void {
      this.save().subscribe();
   }
}

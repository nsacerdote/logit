import {
   ChangeDetectionStrategy,
   ChangeDetectorRef,
   Component,
   Input,
   OnInit
} from '@angular/core';
import {
   FormArray,
   FormBuilder,
   FormControl,
   NG_VALUE_ACCESSOR
} from '@angular/forms';
import { Worklog } from '../../../models/worklog.model';
import { BaseControlValueAccessorComponent } from '../../../shared/base-control-value-accessor.component';
import { Observable } from 'rxjs';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import * as moment from 'moment';
import { switchMap, tap } from 'rxjs/operators';
import { DialogService } from '../../../services/dialog.service';
import { TimeUtils } from '../../../shared/utils/time.utils';
import { ServerService } from '../../../services/server.service';

@Component({
   selector: 'app-worklog-list',
   templateUrl: './worklog-list.component.html',
   styleUrls: ['./worklog-list.component.scss'],
   providers: [
      {
         provide: NG_VALUE_ACCESSOR,
         useExisting: WorklogListComponent,
         multi: true
      }
   ],
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorklogListComponent
   extends BaseControlValueAccessorComponent
   implements OnInit {

   constructor(
      private fb: FormBuilder,
      private cdRef: ChangeDetectorRef,
      private dialogService: DialogService,
      private serverService: ServerService
   ) {
      super();
   }
   @Input() worklogsDate: moment.Moment;
   @Input() minuteStep = 5;

   worklogsFormArray: FormArray;
   focusIndex = -1;

   private static prepareNewWorklog(startTime) {
      const result = new Worklog();
      result.startTime = startTime || result.startTime;
      return result;
   }

   ngOnInit() {
      this.worklogsFormArray = this.fb.array([]);
   }

   addNewWorklog() {
      const endTime = this.setLastWorklogEndtime();
      this.worklogsFormArray.push(
         new FormControl(WorklogListComponent.prepareNewWorklog(endTime))
      );
      this.focusIndex = this.worklogsFormArray.length - 1;
   }

   private setLastWorklogEndtime() {
      const lastFormControl = this.getLastFormControl();
      const lastWorklog: Worklog =
         lastFormControl && Worklog.of(lastFormControl.value);
      if (!lastWorklog) {
         return null;
      }

      if (!lastWorklog.endTime) {
         lastWorklog.endTime = TimeUtils.getRoundedTimeString(
            moment(),
            this.minuteStep
         );
         lastFormControl.patchValue(lastWorklog);
      }
      return lastWorklog.endTime;
   }

   deleteWorklog(index: number) {
      const worklog = Worklog.of(this.worklogsFormArray.at(index).value);
      if (worklog.isSent()) {
         this.requestWorklogDeletion(worklog)
            .pipe(
               tap(() => {
                  this.removeWorklogFromArray(index);
                  this.cdRef.detectChanges();
               })
            )
            .subscribe();
      } else {
         this.removeWorklogFromArray(index);
      }
   }

   private requestWorklogDeletion(worklog) {
      return this.dialogService
         .confirm('Do you really want to delete this worklog?')
         .pipe(switchMap(() => this.serverService.deleteWorkLog(worklog)));
   }

   private removeWorklogFromArray(index) {
      this.worklogsFormArray.removeAt(index);
   }

   drop(event: CdkDragDrop<string[]>) {
      const worklogs = this.worklogsFormArray.value;
      moveItemInArray(worklogs, event.previousIndex, event.currentIndex);
      this.worklogsFormArray.setValue(worklogs.map(w => Worklog.of(w)));
   }

   writeValue(worklogs: Worklog[]): void {
      while (this.worklogsFormArray.length !== 0) {
         this.worklogsFormArray.removeAt(0);
      }
      worklogs.forEach(worklog =>
         this.worklogsFormArray.push(new FormControl(worklog))
      );
      this.cdRef.detectChanges();
   }

   valueChangeObservable(): Observable<any> {
      return this.worklogsFormArray.valueChanges;
   }

   private getLastFormControl() {
      return this.worklogsFormArray.at(this.worklogsFormArray.length - 1);
   }
}

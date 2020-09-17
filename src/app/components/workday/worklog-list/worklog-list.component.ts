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
import { JiraApiService } from '../../../services/jira-api.service';
import { switchMap, tap } from 'rxjs/operators';
import { DialogService } from '../../../services/dialog.service';

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
export class WorklogListComponent extends BaseControlValueAccessorComponent
   implements OnInit {
   @Input() worklogsDate: moment.Moment;

   worklogsFormArray: FormArray;
   focusIndex = -1;

   constructor(
      private fb: FormBuilder,
      private cdRef: ChangeDetectorRef,
      private jiraApiService: JiraApiService,
      private dialogService: DialogService
   ) {
      super();
   }

   ngOnInit() {
      this.worklogsFormArray = this.fb.array([]);
   }

   addNewWorklog() {
      const worklogToAdd = new Worklog();
      const lastFormControl = this.getLastFormControl();
      if (lastFormControl) {
         worklogToAdd.startTime = lastFormControl.value.endTime;
      }
      this.worklogsFormArray.push(new FormControl(worklogToAdd));
      this.focusIndex = this.worklogsFormArray.length - 1;
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
         .pipe(switchMap(() => this.jiraApiService.deleteWorklog(worklog)));
   }

   private removeWorklogFromArray(index) {
      this.worklogsFormArray.removeAt(index);
   }

   drop(event: CdkDragDrop<string[]>) {
      const worklogs = this.worklogsFormArray.value;
      moveItemInArray(worklogs, event.previousIndex, event.currentIndex);
      this.worklogsFormArray.setValue(worklogs);
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

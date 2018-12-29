import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Worklog, WorklogStatus } from '../../../models/worklog.model';
import { BaseControlValueAccessorComponent } from '../../../shared/base-control-value-accessor.component';
import { Observable } from 'rxjs';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Issue } from '../../../models/issue.model';

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
export class WorklogListComponent extends BaseControlValueAccessorComponent implements OnInit {

   worklogsFormArray: FormArray;
   focusIndex = -1;

   constructor(private fb: FormBuilder) {
      super();
   }

   ngOnInit() {
      this.worklogsFormArray = this.fb.array([]);
   }

   addNewWorklog() {
      const worklogToAdd = new Worklog('', '', '', new Issue('', ''), WorklogStatus.NOT_SENT);
      const lastFormControl = this.getLastFormControl();
      if (lastFormControl) {
         worklogToAdd.startTime = lastFormControl.value.endTime;
      }
      this.worklogsFormArray.push(new FormControl(worklogToAdd));
      this.focusIndex = this.worklogsFormArray.length - 1;
   }

   deleteWorklog(index: number) {
      this.worklogsFormArray.removeAt(index);
   }

   drop(event: CdkDragDrop<string[]>) {
      const worklogs = this.worklogsFormArray.value;
      moveItemInArray(worklogs, event.previousIndex, event.currentIndex);
      this.worklogsFormArray.setValue(worklogs);
   }

   writeValue(worklogs: Worklog[]): void {
      this.worklogsFormArray.reset();
      worklogs.forEach((worklog) => this.worklogsFormArray.push(new FormControl(worklog)));
   }

   valueChangeObservable(): Observable<any> {
      return this.worklogsFormArray.valueChanges;
   }

   private getLastFormControl() {
      return this.worklogsFormArray.at(this.worklogsFormArray.length - 1);
   }
}

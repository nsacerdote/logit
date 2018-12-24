import { Component, OnInit } from '@angular/core';
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
  ]
})
export class WorklogListComponent extends BaseControlValueAccessorComponent implements OnInit {

  worklogsFormArray: FormArray;

  constructor(private fb: FormBuilder) {
    super();
  }

  ngOnInit() {
    this.worklogsFormArray = this.fb.array([]);
  }

  addNewWorklog() {
    this.worklogsFormArray.push(new FormControl(
      new Worklog('00:00', '00:00', '', new Issue('', ''), WorklogStatus.NOT_SENT)
    ));
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
}

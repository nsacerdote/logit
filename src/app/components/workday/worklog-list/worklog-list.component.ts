import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Worklog } from '../../../models/worklog.model';
import { BaseControlValueAccessorComponent } from '../../../shared/base-control-value-accessor.component';
import { Observable } from 'rxjs';

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

  writeValue(worklogs: Worklog[]): void {
    this.worklogsFormArray.reset();
    worklogs.forEach((worklog) => this.worklogsFormArray.push(new FormControl(worklog)));
  }

  valueChangeObservable(): Observable<any> {
    return this.worklogsFormArray.valueChanges;
  }

}

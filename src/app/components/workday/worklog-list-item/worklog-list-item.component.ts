import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseControlValueAccessorComponent } from '../../../shared/base-control-value-accessor.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-worklog-list-item',
  templateUrl: './worklog-list-item.component.html',
  styleUrls: ['./worklog-list-item.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: WorklogListItemComponent,
      multi: true
    }
  ]
})
export class WorklogListItemComponent extends BaseControlValueAccessorComponent implements OnInit {

  worklogFormGroup: FormGroup;

  constructor(private fb: FormBuilder) {
    super();
  }

  ngOnInit() {
    this.worklogFormGroup = this.fb.group({
      'startTime': '',
      'endTime': '',
      'description': '',
      'issue': this.fb.group({
        'key': '',
        'description': '',
      }),
      'status': ''
    });
  }

  writeValue(worklog: any): void {
    this.worklogFormGroup.patchValue(worklog);
  }

  valueChangeObservable(): Observable<any> {
    return this.worklogFormGroup.valueChanges;
  }

}

import { Component, EventEmitter, Input, OnInit, Output, } from '@angular/core';
import { FormBuilder, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseControlValueAccessorComponent } from '../../../../shared/base-control-value-accessor.component';
import { Observable } from 'rxjs';
import { Worklog } from '../../../../models/worklog.model';

@Component({
  // tslint:disable-next-line:component-selector
  selector: '[app-worklog-list-item]',
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

  @Input() disabled = false;

  @Output() newRow = new EventEmitter<void>();
  @Output() rowDelete = new EventEmitter<void>();

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
    if (this.disabled) {
      this.worklogFormGroup.disable();
    }
  }

  writeValue(worklog: any): void {
    this.worklogFormGroup.patchValue(worklog);
  }

  valueChangeObservable(): Observable<any> {
    return this.worklogFormGroup.valueChanges;
  }

  calcSpentTime(): string {
    return Worklog.calcWorkedTime(
      this.worklogFormGroup.get('startTime').value,
      this.worklogFormGroup.get('endTime').value
    );
  }

  handleTabOnLastInput() {
    this.newRow.emit();
  }

  deleteRowClicked() {
    this.rowDelete.emit();
  }
}
import {
   ChangeDetectionStrategy,
   ChangeDetectorRef,
   Component,
   EventEmitter,
   Input,
   OnInit,
   Output
} from '@angular/core';
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
   ],
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorklogListItemComponent extends BaseControlValueAccessorComponent
   implements OnInit {
   @Input() last = false;
   @Input() shouldFocus = false;

   @Output() newRow = new EventEmitter<void>();
   @Output() rowDelete = new EventEmitter<void>();

   disabled = false;

   worklogFormGroup: FormGroup;

   constructor(private fb: FormBuilder, private cdRef: ChangeDetectorRef) {
      super();
   }

   ngOnInit() {
      this.worklogFormGroup = this.fb.group({
         startTime: '',
         endTime: '',
         description: '',
         issue: {
            key: '',
            description: ''
         },
         status: '',
         statusMessage: ''
      });
   }

   writeValue(worklog: Worklog): void {
      if (worklog) {
         this.worklogFormGroup.patchValue(worklog);
         this.updateDisbledStatus(worklog);
         this.cdRef.detectChanges();
      }
   }

   valueChangeObservable(): Observable<any> {
      return this.worklogFormGroup.valueChanges;
   }

   calcSpentTime(): string {
      return this.getFormValueAsWorklog().getWorkedTime();
   }

   handleTabOnLastInput(event: Event) {
      // Only emit if we are the last row
      if (this.last) {
         this.newRow.emit();
         event.preventDefault();
      }
   }

   deleteRowClicked() {
      this.rowDelete.emit();
   }

   getFormValueAsWorklog(): Worklog {
      return Worklog.of(this.worklogFormGroup.value);
   }

   private updateDisbledStatus(worklog: Worklog) {
      if (worklog.isSent()) {
         this.worklogFormGroup.disable();
         this.disabled = true;
      } else {
         this.worklogFormGroup.enable();
         this.disabled = false;
      }
   }
}

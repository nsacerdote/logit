import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseControlValueAccessorComponent } from '../base-control-value-accessor.component';
import { Observable } from 'rxjs';

@Component({
   selector: 'app-issue-autocomplete',
   templateUrl: './issue-autocomplete.component.html',
   styleUrls: ['./issue-autocomplete.component.scss'],
   providers: [
      {
         provide: NG_VALUE_ACCESSOR,
         useExisting: IssueAutocompleteComponent,
         multi: true
      }
   ],
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class IssueAutocompleteComponent extends BaseControlValueAccessorComponent implements OnInit {

   @Input() disabled = false;

   issueGroup: FormGroup;

   constructor(private fb: FormBuilder,
               private cdRef: ChangeDetectorRef) {
      super();
   }

   ngOnInit() {
      this.issueGroup = this.fb.group({
         'key': '',
         'description': '',
      });
      if (this.disabled) {
         this.issueGroup.disable();
      }
   }

   valueChangeObservable(): Observable<any> {
      return this.issueGroup.valueChanges;
   }

   writeValue(issue: any): void {
      if (issue) {
         this.issueGroup.patchValue(issue);
         this.cdRef.detectChanges();
      }
   }

}

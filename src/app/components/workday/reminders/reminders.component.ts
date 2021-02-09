import {
   ChangeDetectionStrategy,
   Component,
   Input,
   OnChanges,
   ViewChild
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';

@Component({
   selector: 'app-reminders',
   templateUrl: './reminders.component.html',
   styleUrls: ['./reminders.component.scss'],
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class RemindersComponent implements OnChanges {
   @Input() remindersFormControl: FormControl;
   @ViewChild('autosize', { static: true }) autosize: CdkTextareaAutosize;

   constructor() {}

   ngOnChanges() {
      setTimeout(() => this.autosize.resizeToFitContent(true), 0);
   }
}

import {
   ChangeDetectionStrategy,
   Component,
   Input,
   OnInit
} from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
   selector: 'app-reminders',
   templateUrl: './reminders.component.html',
   styleUrls: ['./reminders.component.scss'],
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class RemindersComponent implements OnInit {
   @Input() remindersFormControl: FormControl;

   constructor() {}

   ngOnInit() {}
}

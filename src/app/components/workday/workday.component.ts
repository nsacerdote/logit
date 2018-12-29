import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Worklog, WorklogStatus } from '../../models/worklog.model';
import { Issue } from '../../models/issue.model';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
   selector: 'app-workday',
   templateUrl: './workday.component.html',
   styleUrls: ['./workday.component.scss'],
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkdayComponent implements OnInit {

   workdayForm: FormGroup;

   constructor(private fb: FormBuilder) {
   }

   ngOnInit() {
      this.workdayForm = this.fb.group({
         worklogs: [[
            new Worklog('23:56', '23:58', 'aaa', new Issue('AAA-1', 'abc'), WorklogStatus.NOT_SENT),
            new Worklog('2', '3', 'bbb', new Issue('BBB-1', 'abc'), WorklogStatus.NOT_SENT)
         ]],
         reminder: ['reminder']
      });
   }

   sendWorklogs() {
      console.log(this.workdayForm.value);
   }

}

import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-worklog-status',
  templateUrl: './worklog-status.component.html',
  styleUrls: ['./worklog-status.component.scss']
})
export class WorklogStatusComponent implements OnInit {

   @Input() status: string;
   @Input() message: string;

  constructor() { }

  ngOnInit() {
  }

}

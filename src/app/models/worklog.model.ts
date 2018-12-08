import { Issue } from './issue.model';

export enum WorklogStatus {
  NOT_SENT = 'NOT_SENT',
  SENT = 'SENT'
}

export class Worklog {
  constructor(public startTime: string,
              public endTime: string,
              public description: string,
              public issue: Issue,
              public status: WorklogStatus) { }
}

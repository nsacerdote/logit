import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorklogStatusComponent } from './worklog-status.component';

describe('WorklogStatusComponent', () => {
  let component: WorklogStatusComponent;
  let fixture: ComponentFixture<WorklogStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorklogStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorklogStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
